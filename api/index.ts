import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Users
app.get('/api/users', async (req, res) => {
  try {
    const role = req.query.role as string;
    const labId = req.query.laboratoryId as string;
    
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
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, labCode } = req.body;
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

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Instruments
app.get('/api/instruments', async (req, res) => {
  try {
    const instruments = await db.select().from(schema.instruments);
    res.json(instruments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instruments' });
  }
});

// Chapters
app.get('/api/chapters', async (req, res) => {
  try {
    const instrumentId = req.query.instrumentId as string;
    let chapters;
    if (instrumentId) {
      chapters = await db.select().from(schema.chapters).where(eq(schema.chapters.instrumentId, instrumentId));
    } else {
      chapters = await db.select().from(schema.chapters);
    }
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Sub-chapters
app.get('/api/sub-chapters', async (req, res) => {
  try {
    const chapterId = req.query.chapterId as string;
    let subChapters;
    if (chapterId) {
      subChapters = await db.select().from(schema.subChapters).where(eq(schema.subChapters.chapterId, chapterId));
    } else {
      subChapters = await db.select().from(schema.subChapters);
    }
    res.json(subChapters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sub-chapters' });
  }
});

// Training elements
app.get('/api/training-elements', async (req, res) => {
  try {
    const subChapterId = req.query.subChapterId as string;
    let elements;
    if (subChapterId) {
      elements = await db.select().from(schema.trainingElements).where(eq(schema.trainingElements.subChapterId, subChapterId));
    } else {
      elements = await db.select().from(schema.trainingElements);
    }
    res.json(elements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch training elements' });
  }
});

// Validations
app.get('/api/validations', async (req, res) => {
  try {
    const traineeId = req.query.traineeId as string;
    if (!traineeId) return res.status(400).json({ error: 'traineeId is required' });
    const validations = await db.select().from(schema.validations).where(eq(schema.validations.traineeId, traineeId));
    res.json(validations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch validations' });
  }
});

app.post('/api/validations', async (req, res) => {
  try {
    const { traineeId, trainingElementId, trainerId, trainingLocation } = req.body;
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
    
    res.status(201).json(validation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create validation' });
  }
});

// Comfort ratings
app.get('/api/comfort-ratings', async (req, res) => {
  try {
    const traineeId = req.query.traineeId as string;
    if (!traineeId) return res.status(400).json({ error: 'traineeId is required' });
    const ratings = await db.select().from(schema.comfortRatings).where(eq(schema.comfortRatings.traineeId, traineeId));
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comfort ratings' });
  }
});

app.post('/api/comfort-ratings', async (req, res) => {
  try {
    const { traineeId, trainingElementId, rating, isRevision } = req.body;
    
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
    
    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comfort rating' });
  }
});

// Laboratories
app.get('/api/laboratories', async (req, res) => {
  try {
    const labs = await db.select().from(schema.laboratories);
    res.json(labs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch laboratories' });
  }
});

// Modification history
app.get('/api/modification-history', async (req, res) => {
  try {
    const entityType = req.query.entityType as string;
    const entityId = req.query.entityId as string;
    
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
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch modification history' });
  }
});

app.get('/api/modification-history/all', async (req, res) => {
  try {
    const history = await db.select().from(schema.modificationHistory)
      .orderBy(desc(schema.modificationHistory.modifiedAt));
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch modification history' });
  }
});

// Trainee progress
app.get('/api/trainee/:id/progress', async (req, res) => {
  try {
    const traineeId = req.params.id;
    
    const validations = await db.select().from(schema.validations).where(eq(schema.validations.traineeId, traineeId));
    const comfortRatings = await db.select().from(schema.comfortRatings).where(eq(schema.comfortRatings.traineeId, traineeId));
    const allElements = await db.select().from(schema.trainingElements);
    
    const validatedIds = new Set(validations.map(v => v.trainingElementId));
    const ratedIds = new Set(comfortRatings.map(r => r.trainingElementId));
    
    res.json({
      totalElements: allElements.length,
      validatedElements: validatedIds.size,
      ratedElements: ratedIds.size,
      validations,
      comfortRatings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trainee progress' });
  }
});

// Training sessions
app.get('/api/training-sessions', async (req, res) => {
  try {
    const trainerId = req.query.trainerId as string;
    if (!trainerId) return res.status(400).json({ error: 'trainerId is required' });
    const sessions = await db.select().from(schema.trainingSessions).where(eq(schema.trainingSessions.trainerId, trainerId));
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch training sessions' });
  }
});

app.post('/api/training-sessions', async (req, res) => {
  try {
    const { trainerId, traineeIds, name, instrumentIds, location } = req.body;
    const [session] = await db.insert(schema.trainingSessions).values({
      trainerId,
      traineeIds: traineeIds || [],
      name,
      instrumentIds: instrumentIds || [],
      location,
    }).returning();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create training session' });
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return new Promise((resolve) => {
    app(req as any, res as any, () => {
      resolve(undefined);
    });
  });
}
