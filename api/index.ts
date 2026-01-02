import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { eq, and, desc } from 'drizzle-orm';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const url = req.url || '';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse body if string
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  try {
    // Debug endpoint - list all users
    if (url.includes('/api/debug/users') && method === 'GET') {
      const users = await db.select().from(schema.users);
      return res.json({ count: users.length, users: users.map(u => ({ id: u.id, username: u.username, role: u.role })) });
    }

    // Authentication
    if (url.includes('/api/auth/login') && method === 'POST') {
      const { username, labCode } = body || {};
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (user.role === 'trainee') {
        if (!labCode) {
          return res.status(400).json({ error: 'Lab code is required for trainees' });
        }
        if (user.laboratoryId) {
          const [lab] = await db.select().from(schema.laboratories).where(eq(schema.laboratories.id, user.laboratoryId));
          if (!lab || lab.code !== labCode) {
            return res.status(401).json({ error: 'Invalid lab code' });
          }
        }
      }

      return res.json(user);
    }

    // Users
    if (url.includes('/api/users') && method === 'GET') {
      const id = url.match(/\/api\/users\/([^/?]+)/)?.[1];
      if (id) {
        const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json(user);
      }
      
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const role = urlParams.get('role');
      const labId = urlParams.get('laboratoryId');
      
      let users;
      if (role && labId) {
        users = await db.select().from(schema.users).where(
          and(eq(schema.users.role, role), eq(schema.users.laboratoryId, labId))
        );
      } else if (role) {
        users = await db.select().from(schema.users).where(eq(schema.users.role, role));
      } else {
        users = await db.select().from(schema.users);
      }
      return res.json(users);
    }

    // Instruments
    if (url.includes('/api/instruments') && method === 'GET') {
      const instruments = await db.select().from(schema.instruments);
      return res.json(instruments);
    }

    // Chapters
    if (url.includes('/api/chapters') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const instrumentId = urlParams.get('instrumentId');
      let chapters;
      if (instrumentId) {
        chapters = await db.select().from(schema.chapters).where(eq(schema.chapters.instrumentId, instrumentId));
      } else {
        chapters = await db.select().from(schema.chapters);
      }
      return res.json(chapters);
    }

    // Sub-chapters
    if (url.includes('/api/sub-chapters') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const chapterId = urlParams.get('chapterId');
      let subChapters;
      if (chapterId) {
        subChapters = await db.select().from(schema.subChapters).where(eq(schema.subChapters.chapterId, chapterId));
      } else {
        subChapters = await db.select().from(schema.subChapters);
      }
      return res.json(subChapters);
    }

    // Training elements
    if (url.includes('/api/training-elements') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const subChapterId = urlParams.get('subChapterId');
      let elements;
      if (subChapterId) {
        elements = await db.select().from(schema.trainingElements).where(eq(schema.trainingElements.subChapterId, subChapterId));
      } else {
        elements = await db.select().from(schema.trainingElements);
      }
      return res.json(elements);
    }

    // Validations
    if (url.includes('/api/validations') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const traineeId = urlParams.get('traineeId');
      if (!traineeId) return res.status(400).json({ error: 'traineeId is required' });
      const validations = await db.select().from(schema.validations).where(eq(schema.validations.traineeId, traineeId));
      return res.json(validations);
    }

    if (url.includes('/api/validations') && method === 'POST') {
      const { traineeId, trainingElementId, trainerId, trainingLocation } = body || {};
      const [validation] = await db.insert(schema.validations).values({
        traineeId,
        trainingElementId,
        trainerId,
        trainingLocation,
      }).returning();
      
      await db.insert(schema.modificationHistory).values({
        entityType: 'validation',
        entityId: validation.id,
        action: 'created',
        modifiedBy: trainerId,
        newValue: JSON.stringify(validation),
      });
      
      return res.status(201).json(validation);
    }

    // Comfort ratings
    if (url.includes('/api/comfort-ratings') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const traineeId = urlParams.get('traineeId');
      if (!traineeId) return res.status(400).json({ error: 'traineeId is required' });
      const ratings = await db.select().from(schema.comfortRatings).where(eq(schema.comfortRatings.traineeId, traineeId));
      return res.json(ratings);
    }

    if (url.includes('/api/comfort-ratings') && method === 'POST') {
      const { traineeId, trainingElementId, rating, isRevision } = body || {};
      
      const [existing] = await db.select().from(schema.comfortRatings).where(
        and(
          eq(schema.comfortRatings.traineeId, traineeId),
          eq(schema.comfortRatings.trainingElementId, trainingElementId)
        )
      );
      
      if (existing) {
        const [updated] = await db.update(schema.comfortRatings)
          .set({ rating, isRevision: isRevision || false })
          .where(eq(schema.comfortRatings.id, existing.id))
          .returning();
        
        await db.insert(schema.modificationHistory).values({
          entityType: 'comfort_rating',
          entityId: existing.id,
          action: 'updated',
          modifiedBy: traineeId,
          previousValue: JSON.stringify(existing),
          newValue: JSON.stringify(updated),
        });
        
        return res.json(updated);
      }
      
      const [newRating] = await db.insert(schema.comfortRatings).values({
        traineeId,
        trainingElementId,
        rating,
        isRevision: isRevision || false,
      }).returning();
      
      await db.insert(schema.modificationHistory).values({
        entityType: 'comfort_rating',
        entityId: newRating.id,
        action: 'created',
        modifiedBy: traineeId,
        newValue: JSON.stringify(newRating),
      });
      
      return res.status(201).json(newRating);
    }

    // Laboratories
    if (url.includes('/api/laboratories') && method === 'GET') {
      const labs = await db.select().from(schema.laboratories);
      return res.json(labs);
    }

    // Modification history
    if (url.includes('/api/modification-history/all') && method === 'GET') {
      const history = await db.select().from(schema.modificationHistory)
        .orderBy(desc(schema.modificationHistory.modifiedAt));
      return res.json(history);
    }

    if (url.includes('/api/modification-history') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const entityType = urlParams.get('entityType');
      const entityId = urlParams.get('entityId');
      
      let history;
      if (entityType && entityId) {
        history = await db.select().from(schema.modificationHistory)
          .where(and(
            eq(schema.modificationHistory.entityType, entityType),
            eq(schema.modificationHistory.entityId, entityId)
          ))
          .orderBy(desc(schema.modificationHistory.modifiedAt));
      } else if (entityType) {
        history = await db.select().from(schema.modificationHistory)
          .where(eq(schema.modificationHistory.entityType, entityType))
          .orderBy(desc(schema.modificationHistory.modifiedAt));
      } else {
        history = await db.select().from(schema.modificationHistory)
          .orderBy(desc(schema.modificationHistory.modifiedAt));
      }
      return res.json(history);
    }

    // Trainee progress
    const traineeProgressMatch = url.match(/\/api\/trainee\/([^/?]+)\/progress/);
    if (traineeProgressMatch && method === 'GET') {
      const traineeId = traineeProgressMatch[1];
      
      const validations = await db.select().from(schema.validations).where(eq(schema.validations.traineeId, traineeId));
      const comfortRatings = await db.select().from(schema.comfortRatings).where(eq(schema.comfortRatings.traineeId, traineeId));
      const allElements = await db.select().from(schema.trainingElements);
      
      const validatedIds = new Set(validations.map(v => v.trainingElementId));
      const ratedIds = new Set(comfortRatings.map(r => r.trainingElementId));
      
      return res.json({
        totalElements: allElements.length,
        validatedElements: validatedIds.size,
        ratedElements: ratedIds.size,
        validations,
        comfortRatings,
      });
    }

    // Training sessions
    if (url.includes('/api/training-sessions') && method === 'GET') {
      const urlParams = new URL(url, 'http://localhost').searchParams;
      const trainerId = urlParams.get('trainerId');
      if (!trainerId) return res.status(400).json({ error: 'trainerId is required' });
      const sessions = await db.select().from(schema.trainingSessions).where(eq(schema.trainingSessions.trainerId, trainerId));
      return res.json(sessions);
    }

    if (url.includes('/api/training-sessions') && method === 'POST') {
      const { trainerId, traineeIds, name, instrumentIds, location } = body || {};
      const [session] = await db.insert(schema.trainingSessions).values({
        trainerId,
        traineeIds: traineeIds || [],
        name,
        instrumentIds: instrumentIds || [],
        location,
      }).returning();
      return res.status(201).json(session);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
