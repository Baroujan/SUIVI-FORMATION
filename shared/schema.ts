import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - supports trainer, trainee, and admin roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("trainee"), // trainer, trainee, admin
  laboratoryId: text("laboratory_id"),
  name: text("name").notNull(),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Instruments table
export const instruments = pgTable("instruments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
});

export const insertInstrumentSchema = createInsertSchema(instruments).omit({ id: true });
export type InsertInstrument = z.infer<typeof insertInstrumentSchema>;
export type Instrument = typeof instruments.$inferSelect;

// Chapters table
export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instrumentId: text("instrument_id").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
});

export const insertChapterSchema = createInsertSchema(chapters).omit({ id: true });
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;

// Sub-chapters table
export const subChapters = pgTable("sub_chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chapterId: text("chapter_id").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
});

export const insertSubChapterSchema = createInsertSchema(subChapters).omit({ id: true });
export type InsertSubChapter = z.infer<typeof insertSubChapterSchema>;
export type SubChapter = typeof subChapters.$inferSelect;

// Training elements table
export const trainingElements = pgTable("training_elements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subChapterId: text("sub_chapter_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  facsUniversityLink: text("facs_university_link"),
  order: integer("order").notNull().default(0),
});

export const insertTrainingElementSchema = createInsertSchema(trainingElements).omit({ id: true });
export type InsertTrainingElement = z.infer<typeof insertTrainingElementSchema>;
export type TrainingElement = typeof trainingElements.$inferSelect;

// Validations table - tracks trainer validations
export const validations = pgTable("validations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  traineeId: text("trainee_id").notNull(),
  trainingElementId: text("training_element_id").notNull(),
  trainerId: text("trainer_id").notNull(),
  validatedAt: timestamp("validated_at").notNull().defaultNow(),
  trainingLocation: text("training_location"), // Rungis, on-site, online
});

export const insertValidationSchema = createInsertSchema(validations).omit({ id: true, validatedAt: true });
export type InsertValidation = z.infer<typeof insertValidationSchema>;
export type Validation = typeof validations.$inferSelect;

// Comfort ratings table - tracks trainee self-assessments
export const comfortRatings = pgTable("comfort_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  traineeId: text("trainee_id").notNull(),
  trainingElementId: text("training_element_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 scale
  ratedAt: timestamp("rated_at").notNull().defaultNow(),
  isRevision: boolean("is_revision").default(false),
});

export const insertComfortRatingSchema = createInsertSchema(comfortRatings).omit({ id: true, ratedAt: true });
export type InsertComfortRating = z.infer<typeof insertComfortRatingSchema>;
export type ComfortRating = typeof comfortRatings.$inferSelect;

// Training sessions table
export const trainingSessions = pgTable("training_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainerId: text("trainer_id").notNull(),
  name: text("name").notNull(),
  traineeIds: text("trainee_ids").array().notNull(),
  instrumentIds: text("instrument_ids").array().notNull(),
  location: text("location"), // Rungis, on-site, online
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;

// Laboratories table
export const laboratories = pgTable("laboratories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
});

export const insertLaboratorySchema = createInsertSchema(laboratories).omit({ id: true });
export type InsertLaboratory = z.infer<typeof insertLaboratorySchema>;
export type Laboratory = typeof laboratories.$inferSelect;

// Modification history table for traceability
export const modificationHistory = pgTable("modification_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // training_element, chapter, etc.
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // created, updated, deleted
  modifiedBy: text("modified_by").notNull(),
  modifiedAt: timestamp("modified_at").notNull().defaultNow(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
});

export const insertModificationHistorySchema = createInsertSchema(modificationHistory).omit({ id: true, modifiedAt: true });
export type InsertModificationHistory = z.infer<typeof insertModificationHistorySchema>;
export type ModificationHistory = typeof modificationHistory.$inferSelect;

// Extended types for frontend use
export type TrainingElementWithDetails = TrainingElement & {
  validation?: Validation;
  comfortRating?: ComfortRating;
};

export type ChapterWithContent = Chapter & {
  subChapters: (SubChapter & {
    elements: TrainingElementWithDetails[];
  })[];
};

export type InstrumentWithChapters = Instrument & {
  chapters: ChapterWithContent[];
};

export type TraineeProgress = {
  trainee: User;
  validatedCount: number;
  totalElements: number;
  averageComfort: number;
};

export type LaboratoryStats = {
  laboratory: Laboratory;
  userCount: number;
  averageComfort: number;
  trainingFrequency: number;
};
