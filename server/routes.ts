import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertInstrumentSchema,
  insertChapterSchema,
  insertSubChapterSchema,
  insertTrainingElementSchema,
  insertValidationSchema,
  insertComfortRatingSchema,
  insertTrainingSessionSchema,
  insertLaboratorySchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await storage.seedDatabase();

  // ========== USERS ==========
  app.get("/api/users", async (req, res) => {
    try {
      const role = req.query.role as string | undefined;
      const labId = req.query.laboratoryId as string | undefined;
      
      let users;
      if (role) {
        users = await storage.getUsersByRole(role);
      } else if (labId) {
        users = await storage.getUsersByLaboratory(labId);
      } else {
        users = await storage.getUsers();
      }
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const user = await storage.createUser(parsed);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ========== INSTRUMENTS ==========
  app.get("/api/instruments", async (req, res) => {
    try {
      const instruments = await storage.getInstruments();
      res.json(instruments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch instruments" });
    }
  });

  app.get("/api/instruments/:id", async (req, res) => {
    try {
      const instrument = await storage.getInstrument(req.params.id);
      if (!instrument) {
        return res.status(404).json({ error: "Instrument not found" });
      }
      res.json(instrument);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch instrument" });
    }
  });

  app.get("/api/instruments/:id/full", async (req, res) => {
    try {
      const instrument = await storage.getInstrument(req.params.id);
      if (!instrument) {
        return res.status(404).json({ error: "Instrument not found" });
      }

      const chapters = await storage.getChaptersByInstrument(req.params.id);
      const chaptersWithContent = await Promise.all(
        chapters.map(async (chapter) => {
          const subChapters = await storage.getSubChaptersByChapter(chapter.id);
          const subChaptersWithElements = await Promise.all(
            subChapters.map(async (subChapter) => {
              const elements = await storage.getTrainingElementsBySubChapter(subChapter.id);
              return { ...subChapter, elements };
            })
          );
          return { ...chapter, subChapters: subChaptersWithElements };
        })
      );

      res.json({ ...instrument, chapters: chaptersWithContent });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch instrument details" });
    }
  });

  app.post("/api/instruments", async (req, res) => {
    try {
      const parsed = insertInstrumentSchema.parse(req.body);
      const instrument = await storage.createInstrument(parsed);
      res.status(201).json(instrument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create instrument" });
    }
  });

  app.patch("/api/instruments/:id", async (req, res) => {
    try {
      const instrument = await storage.updateInstrument(req.params.id, req.body);
      if (!instrument) {
        return res.status(404).json({ error: "Instrument not found" });
      }
      res.json(instrument);
    } catch (error) {
      res.status(500).json({ error: "Failed to update instrument" });
    }
  });

  app.delete("/api/instruments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInstrument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Instrument not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete instrument" });
    }
  });

  // ========== CHAPTERS ==========
  app.get("/api/chapters", async (req, res) => {
    try {
      const instrumentId = req.query.instrumentId as string;
      if (!instrumentId) {
        return res.status(400).json({ error: "instrumentId is required" });
      }
      const chapters = await storage.getChaptersByInstrument(instrumentId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  app.post("/api/chapters", async (req, res) => {
    try {
      const parsed = insertChapterSchema.parse(req.body);
      const chapter = await storage.createChapter(parsed);
      res.status(201).json(chapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create chapter" });
    }
  });

  app.patch("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.updateChapter(req.params.id, req.body);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ error: "Failed to update chapter" });
    }
  });

  app.delete("/api/chapters/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChapter(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete chapter" });
    }
  });

  // ========== SUB-CHAPTERS ==========
  app.get("/api/sub-chapters", async (req, res) => {
    try {
      const chapterId = req.query.chapterId as string;
      if (!chapterId) {
        return res.status(400).json({ error: "chapterId is required" });
      }
      const subChapters = await storage.getSubChaptersByChapter(chapterId);
      res.json(subChapters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sub-chapters" });
    }
  });

  app.post("/api/sub-chapters", async (req, res) => {
    try {
      const parsed = insertSubChapterSchema.parse(req.body);
      const subChapter = await storage.createSubChapter(parsed);
      res.status(201).json(subChapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create sub-chapter" });
    }
  });

  app.patch("/api/sub-chapters/:id", async (req, res) => {
    try {
      const subChapter = await storage.updateSubChapter(req.params.id, req.body);
      if (!subChapter) {
        return res.status(404).json({ error: "Sub-chapter not found" });
      }
      res.json(subChapter);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sub-chapter" });
    }
  });

  app.delete("/api/sub-chapters/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSubChapter(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Sub-chapter not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sub-chapter" });
    }
  });

  // ========== TRAINING ELEMENTS ==========
  app.get("/api/training-elements", async (req, res) => {
    try {
      const subChapterId = req.query.subChapterId as string;
      if (!subChapterId) {
        return res.status(400).json({ error: "subChapterId is required" });
      }
      const elements = await storage.getTrainingElementsBySubChapter(subChapterId);
      res.json(elements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training elements" });
    }
  });

  app.post("/api/training-elements", async (req, res) => {
    try {
      const parsed = insertTrainingElementSchema.parse(req.body);
      const element = await storage.createTrainingElement(parsed);
      
      const modifiedBy = req.headers["x-user-id"] as string || "system";
      await storage.createModificationHistory({
        entityType: "training_element",
        entityId: element.id,
        action: "created",
        modifiedBy,
        previousValue: null,
        newValue: JSON.stringify(element),
      });
      
      res.status(201).json(element);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create training element" });
    }
  });

  app.patch("/api/training-elements/:id", async (req, res) => {
    try {
      const previousElement = await storage.getTrainingElement(req.params.id);
      const element = await storage.updateTrainingElement(req.params.id, req.body);
      if (!element) {
        return res.status(404).json({ error: "Training element not found" });
      }
      
      const modifiedBy = req.headers["x-user-id"] as string || "system";
      await storage.createModificationHistory({
        entityType: "training_element",
        entityId: element.id,
        action: "updated",
        modifiedBy,
        previousValue: previousElement ? JSON.stringify(previousElement) : null,
        newValue: JSON.stringify(element),
      });
      
      res.json(element);
    } catch (error) {
      res.status(500).json({ error: "Failed to update training element" });
    }
  });

  app.delete("/api/training-elements/:id", async (req, res) => {
    try {
      const previousElement = await storage.getTrainingElement(req.params.id);
      const deleted = await storage.deleteTrainingElement(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Training element not found" });
      }
      
      const modifiedBy = req.headers["x-user-id"] as string || "system";
      await storage.createModificationHistory({
        entityType: "training_element",
        entityId: req.params.id,
        action: "deleted",
        modifiedBy,
        previousValue: previousElement ? JSON.stringify(previousElement) : null,
        newValue: null,
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete training element" });
    }
  });

  // ========== VALIDATIONS ==========
  app.get("/api/validations", async (req, res) => {
    try {
      const traineeId = req.query.traineeId as string;
      const elementId = req.query.elementId as string;
      
      if (traineeId) {
        const validations = await storage.getValidationsByTrainee(traineeId);
        return res.json(validations);
      }
      if (elementId) {
        const validations = await storage.getValidationsByElement(elementId);
        return res.json(validations);
      }
      res.status(400).json({ error: "traineeId or elementId is required" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch validations" });
    }
  });

  app.post("/api/validations", async (req, res) => {
    try {
      const parsed = insertValidationSchema.parse(req.body);
      
      const existing = await storage.getValidationByTraineeAndElement(
        parsed.traineeId,
        parsed.trainingElementId
      );
      if (existing) {
        return res.status(409).json({ error: "Validation already exists" });
      }
      
      const validation = await storage.createValidation(parsed);
      
      const modifiedBy = req.headers["x-user-id"] as string || parsed.trainerId;
      await storage.createModificationHistory({
        entityType: "validation",
        entityId: validation.id,
        action: "created",
        modifiedBy,
        previousValue: null,
        newValue: JSON.stringify(validation),
      });
      
      res.status(201).json(validation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create validation" });
    }
  });

  app.delete("/api/validations/:id", async (req, res) => {
    try {
      const previousValidation = await storage.getValidation(req.params.id);
      const deleted = await storage.deleteValidation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Validation not found" });
      }
      
      const modifiedBy = req.headers["x-user-id"] as string || "system";
      await storage.createModificationHistory({
        entityType: "validation",
        entityId: req.params.id,
        action: "deleted",
        modifiedBy,
        previousValue: previousValidation ? JSON.stringify(previousValidation) : null,
        newValue: null,
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete validation" });
    }
  });

  // ========== COMFORT RATINGS ==========
  app.get("/api/comfort-ratings", async (req, res) => {
    try {
      const traineeId = req.query.traineeId as string;
      if (!traineeId) {
        return res.status(400).json({ error: "traineeId is required" });
      }
      const ratings = await storage.getComfortRatingsByTrainee(traineeId);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comfort ratings" });
    }
  });

  app.post("/api/comfort-ratings", async (req, res) => {
    try {
      const parsed = insertComfortRatingSchema.parse(req.body);
      const modifiedBy = req.headers["x-user-id"] as string || parsed.traineeId;
      
      const existing = await storage.getComfortRatingByTraineeAndElement(
        parsed.traineeId,
        parsed.trainingElementId
      );
      
      if (existing) {
        const updated = await storage.updateComfortRating(existing.id, {
          rating: parsed.rating,
          isRevision: parsed.isRevision,
        });
        
        await storage.createModificationHistory({
          entityType: "comfort_rating",
          entityId: existing.id,
          action: "updated",
          modifiedBy,
          previousValue: JSON.stringify(existing),
          newValue: JSON.stringify(updated),
        });
        
        return res.json(updated);
      }
      
      const rating = await storage.createComfortRating(parsed);
      
      await storage.createModificationHistory({
        entityType: "comfort_rating",
        entityId: rating.id,
        action: "created",
        modifiedBy,
        previousValue: null,
        newValue: JSON.stringify(rating),
      });
      
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create comfort rating" });
    }
  });

  // ========== TRAINING SESSIONS ==========
  app.get("/api/training-sessions", async (req, res) => {
    try {
      const trainerId = req.query.trainerId as string;
      if (!trainerId) {
        return res.status(400).json({ error: "trainerId is required" });
      }
      const sessions = await storage.getTrainingSessionsByTrainer(trainerId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training sessions" });
    }
  });

  app.get("/api/training-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getTrainingSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Training session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training session" });
    }
  });

  app.post("/api/training-sessions", async (req, res) => {
    try {
      const parsed = insertTrainingSessionSchema.parse(req.body);
      const session = await storage.createTrainingSession(parsed);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create training session" });
    }
  });

  app.patch("/api/training-sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateTrainingSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Training session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update training session" });
    }
  });

  app.delete("/api/training-sessions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTrainingSession(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Training session not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete training session" });
    }
  });

  // ========== LABORATORIES ==========
  app.get("/api/laboratories", async (req, res) => {
    try {
      const laboratories = await storage.getLaboratories();
      res.json(laboratories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch laboratories" });
    }
  });

  app.get("/api/laboratories/:id", async (req, res) => {
    try {
      const lab = await storage.getLaboratory(req.params.id);
      if (!lab) {
        return res.status(404).json({ error: "Laboratory not found" });
      }
      res.json(lab);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch laboratory" });
    }
  });

  app.get("/api/laboratories/:id/stats", async (req, res) => {
    try {
      const lab = await storage.getLaboratory(req.params.id);
      if (!lab) {
        return res.status(404).json({ error: "Laboratory not found" });
      }

      const users = await storage.getUsersByLaboratory(lab.code);
      let totalComfort = 0;
      let ratingCount = 0;

      for (const user of users) {
        const ratings = await storage.getComfortRatingsByTrainee(user.id);
        ratings.forEach((r) => {
          totalComfort += r.rating;
          ratingCount++;
        });
      }

      const avgComfort = ratingCount > 0 ? totalComfort / ratingCount : 0;

      res.json({
        laboratory: lab,
        userCount: users.length,
        averageComfort: Math.round(avgComfort * 10) / 10,
        trainingFrequency: 2.0, // Would be calculated from actual session data
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch laboratory stats" });
    }
  });

  app.post("/api/laboratories", async (req, res) => {
    try {
      const parsed = insertLaboratorySchema.parse(req.body);
      const lab = await storage.createLaboratory(parsed);
      res.status(201).json(lab);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create laboratory" });
    }
  });

  app.patch("/api/laboratories/:id", async (req, res) => {
    try {
      const lab = await storage.updateLaboratory(req.params.id, req.body);
      if (!lab) {
        return res.status(404).json({ error: "Laboratory not found" });
      }
      res.json(lab);
    } catch (error) {
      res.status(500).json({ error: "Failed to update laboratory" });
    }
  });

  app.delete("/api/laboratories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLaboratory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Laboratory not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete laboratory" });
    }
  });

  // ========== TRAINEE PROGRESS ==========
  app.get("/api/trainee/:id/progress", async (req, res) => {
    try {
      const traineeId = req.params.id;
      const trainee = await storage.getUser(traineeId);
      if (!trainee) {
        return res.status(404).json({ error: "Trainee not found" });
      }

      const validations = await storage.getValidationsByTrainee(traineeId);
      const ratings = await storage.getComfortRatingsByTrainee(traineeId);

      const avgComfort =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      res.json({
        trainee,
        validatedCount: validations.length,
        ratings,
        averageComfort: Math.round(avgComfort * 10) / 10,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trainee progress" });
    }
  });

  // ========== AUTHENTICATION ==========
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, labCode } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (user.role === "trainee" && user.laboratoryId && labCode) {
        const lab = await storage.getLaboratoryByCode(labCode);
        if (!lab || user.laboratoryId !== lab.id) {
          return res.status(401).json({ error: "Invalid laboratory code" });
        }
      }

      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // ========== MODIFICATION HISTORY ==========
  app.get("/api/modification-history", async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      if (!entityType || !entityId) {
        return res.status(400).json({ error: "entityType and entityId are required" });
      }
      const history = await storage.getModificationHistory(
        entityType as string,
        entityId as string
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch modification history" });
    }
  });

  app.get("/api/modification-history/all", async (req, res) => {
    try {
      const history = await storage.getAllModificationHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch modification history" });
    }
  });

  return httpServer;
}
