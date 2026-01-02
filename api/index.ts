import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const url = req.url || '';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse body
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const db = getPool();

  try {
    // Debug endpoint
    if (url.includes('/api/debug/users')) {
      const result = await db.query('SELECT id, username, role FROM users LIMIT 10');
      return res.json({ count: result.rows.length, users: result.rows });
    }

    // Authentication
    if (url.includes('/api/auth/login') && method === 'POST') {
      const { username, labCode } = body || {};
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      if (user.role === 'trainee') {
        if (!labCode) {
          return res.status(400).json({ error: 'Lab code is required for trainees' });
        }
        if (user.laboratory_id) {
          const labResult = await db.query('SELECT * FROM laboratories WHERE id = $1', [user.laboratory_id]);
          if (labResult.rows.length === 0 || labResult.rows[0].code !== labCode) {
            return res.status(401).json({ error: 'Invalid lab code' });
          }
        }
      }

      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        laboratoryId: user.laboratory_id
      });
    }

    // Users
    if (url.includes('/api/users') && method === 'GET') {
      const idMatch = url.match(/\/api\/users\/([^/?]+)/);
      if (idMatch) {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [idMatch[1]]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const u = result.rows[0];
        return res.json({ id: u.id, username: u.username, role: u.role, name: u.name, email: u.email, laboratoryId: u.laboratory_id });
      }
      
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const role = urlParams.get('role');
      const labId = urlParams.get('laboratoryId');
      
      let result;
      if (role && labId) {
        result = await db.query('SELECT * FROM users WHERE role = $1 AND laboratory_id = $2', [role, labId]);
      } else if (role) {
        result = await db.query('SELECT * FROM users WHERE role = $1', [role]);
      } else {
        result = await db.query('SELECT * FROM users');
      }
      return res.json(result.rows.map(u => ({ id: u.id, username: u.username, role: u.role, name: u.name, email: u.email, laboratoryId: u.laboratory_id })));
    }

    // Instruments
    if (url.includes('/api/instruments') && method === 'GET') {
      const result = await db.query('SELECT * FROM instruments');
      return res.json(result.rows);
    }

    // Chapters
    if (url.includes('/api/chapters') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const instrumentId = urlParams.get('instrumentId');
      let result;
      if (instrumentId) {
        result = await db.query('SELECT * FROM chapters WHERE instrument_id = $1', [instrumentId]);
      } else {
        result = await db.query('SELECT * FROM chapters');
      }
      return res.json(result.rows.map(c => ({ id: c.id, instrumentId: c.instrument_id, name: c.name, order: c.order })));
    }

    // Sub-chapters
    if (url.includes('/api/sub-chapters') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const chapterId = urlParams.get('chapterId');
      let result;
      if (chapterId) {
        result = await db.query('SELECT * FROM sub_chapters WHERE chapter_id = $1', [chapterId]);
      } else {
        result = await db.query('SELECT * FROM sub_chapters');
      }
      return res.json(result.rows.map(s => ({ id: s.id, chapterId: s.chapter_id, name: s.name, order: s.order })));
    }

    // Training elements
    if (url.includes('/api/training-elements') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const subChapterId = urlParams.get('subChapterId');
      let result;
      if (subChapterId) {
        result = await db.query('SELECT * FROM training_elements WHERE sub_chapter_id = $1', [subChapterId]);
      } else {
        result = await db.query('SELECT * FROM training_elements');
      }
      return res.json(result.rows.map(e => ({ 
        id: e.id, subChapterId: e.sub_chapter_id, name: e.name, 
        description: e.description, facsUniversityLink: e.facs_university_link, order: e.order 
      })));
    }

    // Validations
    if (url.includes('/api/validations') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const traineeId = urlParams.get('traineeId');
      if (!traineeId) return res.status(400).json({ error: 'traineeId is required' });
      const result = await db.query('SELECT * FROM validations WHERE trainee_id = $1', [traineeId]);
      return res.json(result.rows.map(v => ({
        id: v.id, traineeId: v.trainee_id, trainingElementId: v.training_element_id,
        trainerId: v.trainer_id, validatedAt: v.validated_at, trainingLocation: v.training_location
      })));
    }

    if (url.includes('/api/validations') && method === 'POST') {
      const { traineeId, trainingElementId, trainerId, trainingLocation } = body || {};
      const result = await db.query(
        'INSERT INTO validations (trainee_id, training_element_id, trainer_id, training_location) VALUES ($1, $2, $3, $4) RETURNING *',
        [traineeId, trainingElementId, trainerId, trainingLocation]
      );
      const v = result.rows[0];
      return res.status(201).json({
        id: v.id, traineeId: v.trainee_id, trainingElementId: v.training_element_id,
        trainerId: v.trainer_id, validatedAt: v.validated_at, trainingLocation: v.training_location
      });
    }

    // Comfort ratings
    if (url.includes('/api/comfort-ratings') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const traineeId = urlParams.get('traineeId');
      if (!traineeId) return res.status(400).json({ error: 'traineeId is required' });
      const result = await db.query('SELECT * FROM comfort_ratings WHERE trainee_id = $1', [traineeId]);
      return res.json(result.rows.map(r => ({
        id: r.id, traineeId: r.trainee_id, trainingElementId: r.training_element_id,
        rating: r.rating, ratedAt: r.rated_at, isRevision: r.is_revision
      })));
    }

    if (url.includes('/api/comfort-ratings') && method === 'POST') {
      const { traineeId, trainingElementId, rating, isRevision } = body || {};
      
      const existing = await db.query(
        'SELECT * FROM comfort_ratings WHERE trainee_id = $1 AND training_element_id = $2',
        [traineeId, trainingElementId]
      );
      
      if (existing.rows.length > 0) {
        const result = await db.query(
          'UPDATE comfort_ratings SET rating = $1, is_revision = $2 WHERE id = $3 RETURNING *',
          [rating, isRevision || false, existing.rows[0].id]
        );
        const r = result.rows[0];
        return res.json({
          id: r.id, traineeId: r.trainee_id, trainingElementId: r.training_element_id,
          rating: r.rating, ratedAt: r.rated_at, isRevision: r.is_revision
        });
      }
      
      const result = await db.query(
        'INSERT INTO comfort_ratings (trainee_id, training_element_id, rating, is_revision) VALUES ($1, $2, $3, $4) RETURNING *',
        [traineeId, trainingElementId, rating, isRevision || false]
      );
      const r = result.rows[0];
      return res.status(201).json({
        id: r.id, traineeId: r.trainee_id, trainingElementId: r.training_element_id,
        rating: r.rating, ratedAt: r.rated_at, isRevision: r.is_revision
      });
    }

    // Laboratories
    if (url.includes('/api/laboratories') && method === 'GET') {
      const result = await db.query('SELECT * FROM laboratories');
      return res.json(result.rows);
    }

    // Modification history
    if (url.includes('/api/modification-history/all') && method === 'GET') {
      const result = await db.query('SELECT * FROM modification_history ORDER BY modified_at DESC');
      return res.json(result.rows.map(h => ({
        id: h.id, entityType: h.entity_type, entityId: h.entity_id, action: h.action,
        modifiedBy: h.modified_by, modifiedAt: h.modified_at, previousValue: h.previous_value, newValue: h.new_value
      })));
    }

    if (url.includes('/api/modification-history') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const entityType = urlParams.get('entityType');
      const entityId = urlParams.get('entityId');
      
      let result;
      if (entityType && entityId) {
        result = await db.query('SELECT * FROM modification_history WHERE entity_type = $1 AND entity_id = $2 ORDER BY modified_at DESC', [entityType, entityId]);
      } else if (entityType) {
        result = await db.query('SELECT * FROM modification_history WHERE entity_type = $1 ORDER BY modified_at DESC', [entityType]);
      } else {
        result = await db.query('SELECT * FROM modification_history ORDER BY modified_at DESC');
      }
      return res.json(result.rows.map(h => ({
        id: h.id, entityType: h.entity_type, entityId: h.entity_id, action: h.action,
        modifiedBy: h.modified_by, modifiedAt: h.modified_at, previousValue: h.previous_value, newValue: h.new_value
      })));
    }

    // Trainee progress
    const traineeProgressMatch = url.match(/\/api\/trainee\/([^/?]+)\/progress/);
    if (traineeProgressMatch && method === 'GET') {
      const traineeId = traineeProgressMatch[1];
      
      const validations = await db.query('SELECT * FROM validations WHERE trainee_id = $1', [traineeId]);
      const comfortRatings = await db.query('SELECT * FROM comfort_ratings WHERE trainee_id = $1', [traineeId]);
      const allElements = await db.query('SELECT * FROM training_elements');
      
      return res.json({
        totalElements: allElements.rows.length,
        validatedElements: validations.rows.length,
        ratedElements: comfortRatings.rows.length,
        validations: validations.rows.map(v => ({
          id: v.id, traineeId: v.trainee_id, trainingElementId: v.training_element_id,
          trainerId: v.trainer_id, validatedAt: v.validated_at, trainingLocation: v.training_location
        })),
        comfortRatings: comfortRatings.rows.map(r => ({
          id: r.id, traineeId: r.trainee_id, trainingElementId: r.training_element_id,
          rating: r.rating, ratedAt: r.rated_at, isRevision: r.is_revision
        })),
      });
    }

    // Training sessions
    if (url.includes('/api/training-sessions') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const trainerId = urlParams.get('trainerId');
      if (!trainerId) return res.status(400).json({ error: 'trainerId is required' });
      const result = await db.query('SELECT * FROM training_sessions WHERE trainer_id = $1', [trainerId]);
      return res.json(result.rows.map(s => ({
        id: s.id, trainerId: s.trainer_id, name: s.name, traineeIds: s.trainee_ids,
        instrumentIds: s.instrument_ids, location: s.location, createdAt: s.created_at, updatedAt: s.updated_at
      })));
    }

    if (url.includes('/api/training-sessions') && method === 'POST') {
      const { trainerId, traineeIds, name, instrumentIds, location } = body || {};
      const result = await db.query(
        'INSERT INTO training_sessions (trainer_id, trainee_ids, name, instrument_ids, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [trainerId, traineeIds || [], name, instrumentIds || [], location]
      );
      const s = result.rows[0];
      return res.status(201).json({
        id: s.id, trainerId: s.trainer_id, name: s.name, traineeIds: s.trainee_ids,
        instrumentIds: s.instrument_ids, location: s.location, createdAt: s.created_at, updatedAt: s.updated_at
      });
    }

    // Admin metrics
    if (url.includes('/api/admin/metrics') && method === 'GET') {
      const labsResult = await db.query('SELECT * FROM laboratories');
      const usersResult = await db.query('SELECT * FROM users');
      const ratingsResult = await db.query('SELECT * FROM comfort_ratings');
      const validationsResult = await db.query('SELECT * FROM validations');
      
      const trainees = usersResult.rows.filter(u => u.role === 'trainee');
      const labs = labsResult.rows;
      
      const alertThreshold = 2.5;
      const alertTrainees: any[] = [];
      const labMetrics: any[] = [];
      
      for (const lab of labs) {
        const labTrainees = trainees.filter(t => t.laboratory_id === lab.id);
        const labUserIds = labTrainees.map(t => t.id);
        const labRatings = ratingsResult.rows.filter(r => labUserIds.includes(r.trainee_id));
        const labValidations = validationsResult.rows.filter(v => labUserIds.includes(v.trainee_id));
        
        const avgComfort = labRatings.length > 0
          ? labRatings.reduce((sum, r) => sum + r.rating, 0) / labRatings.length
          : 0;
        
        const uniqueDates = [...new Set(labValidations.map(v => 
          new Date(v.validated_at).toISOString().split('T')[0]
        ))];
        
        labMetrics.push({
          id: lab.id,
          code: lab.code,
          name: lab.name,
          userCount: labTrainees.length,
          avgComfort: Math.round(avgComfort * 10) / 10,
          trainingCount: uniqueDates.length,
        });
      }
      
      for (const trainee of trainees) {
        const traineeRatings = ratingsResult.rows.filter(r => r.trainee_id === trainee.id);
        if (traineeRatings.length > 0) {
          const avgRating = traineeRatings.reduce((sum, r) => sum + r.rating, 0) / traineeRatings.length;
          if (avgRating < alertThreshold) {
            const traineeValidations = validationsResult.rows.filter(v => v.trainee_id === trainee.id);
            const lastTraining = traineeValidations.length > 0
              ? traineeValidations.sort((a, b) => new Date(b.validated_at).getTime() - new Date(a.validated_at).getTime())[0].validated_at
              : null;
            
            const lab = labs.find(l => l.id === trainee.laboratory_id);
            alertTrainees.push({
              id: trainee.id,
              name: trainee.name,
              lab: lab?.code || 'N/A',
              avgComfort: Math.round(avgRating * 10) / 10,
              lastTraining: lastTraining ? new Date(lastTraining).toISOString().split('T')[0] : null,
            });
          }
        }
      }
      
      const allRatings = ratingsResult.rows;
      const globalAvg = allRatings.length > 0
        ? Math.round((allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length) * 10) / 10
        : 0;
      
      return res.json({
        labCount: labs.length,
        traineeCount: trainees.length,
        alertCount: alertTrainees.length,
        globalAvgComfort: globalAvg,
        alertTrainees,
        laboratories: labMetrics,
        alertThreshold,
      });
    }

    // Lab details with users
    const labDetailsMatch = url.match(/\/api\/admin\/laboratories\/([^/?]+)/);
    if (labDetailsMatch && method === 'GET') {
      const labId = labDetailsMatch[1];
      const labResult = await db.query('SELECT * FROM laboratories WHERE id = $1 OR code = $1', [labId]);
      if (labResult.rows.length === 0) return res.status(404).json({ error: 'Laboratory not found' });
      
      const lab = labResult.rows[0];
      const usersResult = await db.query('SELECT * FROM users WHERE laboratory_id = $1', [lab.id]);
      const traineeIds = usersResult.rows.map(u => u.id);
      
      const validationsResult = await db.query('SELECT * FROM validations WHERE trainee_id = ANY($1)', [traineeIds]);
      const ratingsResult = await db.query('SELECT * FROM comfort_ratings WHERE trainee_id = ANY($1)', [traineeIds]);
      
      const userDetails = usersResult.rows.map(user => {
        const userRatings = ratingsResult.rows.filter(r => r.trainee_id === user.id);
        const userValidations = validationsResult.rows.filter(v => v.trainee_id === user.id);
        const avgComfort = userRatings.length > 0
          ? Math.round((userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length) * 10) / 10
          : 0;
        
        return {
          id: user.id,
          name: user.name,
          username: user.username,
          validatedCount: userValidations.length,
          ratedCount: userRatings.length,
          avgComfort,
        };
      });
      
      const allRatings = ratingsResult.rows;
      const labAvg = allRatings.length > 0
        ? Math.round((allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length) * 10) / 10
        : 0;
      
      return res.json({
        id: lab.id,
        name: lab.name,
        code: lab.code,
        userCount: usersResult.rows.length,
        avgComfort: labAvg,
        validationCount: validationsResult.rows.length,
        users: userDetails,
      });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
