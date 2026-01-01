import {
  type User,
  type InsertUser,
  type Instrument,
  type InsertInstrument,
  type Chapter,
  type InsertChapter,
  type SubChapter,
  type InsertSubChapter,
  type TrainingElement,
  type InsertTrainingElement,
  type Validation,
  type InsertValidation,
  type ComfortRating,
  type InsertComfortRating,
  type TrainingSession,
  type InsertTrainingSession,
  type Laboratory,
  type InsertLaboratory,
  type ModificationHistory,
  type InsertModificationHistory,
  users,
  instruments,
  chapters,
  subChapters,
  trainingElements,
  validations,
  comfortRatings,
  trainingSessions,
  laboratories,
  modificationHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByLaboratory(labId: string): Promise<User[]>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getInstrument(id: string): Promise<Instrument | undefined>;
  getInstruments(): Promise<Instrument[]>;
  createInstrument(instrument: InsertInstrument): Promise<Instrument>;
  updateInstrument(id: string, instrument: Partial<InsertInstrument>): Promise<Instrument | undefined>;
  deleteInstrument(id: string): Promise<boolean>;

  getChapter(id: string): Promise<Chapter | undefined>;
  getChaptersByInstrument(instrumentId: string): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: Partial<InsertChapter>): Promise<Chapter | undefined>;
  deleteChapter(id: string): Promise<boolean>;

  getSubChapter(id: string): Promise<SubChapter | undefined>;
  getSubChaptersByChapter(chapterId: string): Promise<SubChapter[]>;
  createSubChapter(subChapter: InsertSubChapter): Promise<SubChapter>;
  updateSubChapter(id: string, subChapter: Partial<InsertSubChapter>): Promise<SubChapter | undefined>;
  deleteSubChapter(id: string): Promise<boolean>;

  getTrainingElement(id: string): Promise<TrainingElement | undefined>;
  getTrainingElementsBySubChapter(subChapterId: string): Promise<TrainingElement[]>;
  createTrainingElement(element: InsertTrainingElement): Promise<TrainingElement>;
  updateTrainingElement(id: string, element: Partial<InsertTrainingElement>): Promise<TrainingElement | undefined>;
  deleteTrainingElement(id: string): Promise<boolean>;

  getValidation(id: string): Promise<Validation | undefined>;
  getValidationsByTrainee(traineeId: string): Promise<Validation[]>;
  getValidationsByElement(elementId: string): Promise<Validation[]>;
  getValidationByTraineeAndElement(traineeId: string, elementId: string): Promise<Validation | undefined>;
  createValidation(validation: InsertValidation): Promise<Validation>;
  deleteValidation(id: string): Promise<boolean>;

  getComfortRating(id: string): Promise<ComfortRating | undefined>;
  getComfortRatingsByTrainee(traineeId: string): Promise<ComfortRating[]>;
  getComfortRatingByTraineeAndElement(traineeId: string, elementId: string): Promise<ComfortRating | undefined>;
  createComfortRating(rating: InsertComfortRating): Promise<ComfortRating>;
  updateComfortRating(id: string, rating: Partial<InsertComfortRating>): Promise<ComfortRating | undefined>;

  getTrainingSession(id: string): Promise<TrainingSession | undefined>;
  getTrainingSessionsByTrainer(trainerId: string): Promise<TrainingSession[]>;
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  updateTrainingSession(id: string, session: Partial<InsertTrainingSession>): Promise<TrainingSession | undefined>;
  deleteTrainingSession(id: string): Promise<boolean>;

  getLaboratory(id: string): Promise<Laboratory | undefined>;
  getLaboratoryByCode(code: string): Promise<Laboratory | undefined>;
  getLaboratories(): Promise<Laboratory[]>;
  createLaboratory(lab: InsertLaboratory): Promise<Laboratory>;
  updateLaboratory(id: string, lab: Partial<InsertLaboratory>): Promise<Laboratory | undefined>;
  deleteLaboratory(id: string): Promise<boolean>;

  getModificationHistory(entityType: string, entityId: string): Promise<ModificationHistory[]>;
  getAllModificationHistory(): Promise<ModificationHistory[]>;
  createModificationHistory(history: InsertModificationHistory): Promise<ModificationHistory>;

  seedDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role));
  }

  async getUsersByLaboratory(labId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.laboratoryId, labId));
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getInstrument(id: string): Promise<Instrument | undefined> {
    const [instrument] = await db.select().from(instruments).where(eq(instruments.id, id));
    return instrument || undefined;
  }

  async getInstruments(): Promise<Instrument[]> {
    return db.select().from(instruments);
  }

  async createInstrument(insert: InsertInstrument): Promise<Instrument> {
    const [instrument] = await db.insert(instruments).values(insert).returning();
    return instrument;
  }

  async updateInstrument(id: string, updates: Partial<InsertInstrument>): Promise<Instrument | undefined> {
    const [instrument] = await db.update(instruments).set(updates).where(eq(instruments.id, id)).returning();
    return instrument || undefined;
  }

  async deleteInstrument(id: string): Promise<boolean> {
    const result = await db.delete(instruments).where(eq(instruments.id, id)).returning();
    return result.length > 0;
  }

  async getChapter(id: string): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter || undefined;
  }

  async getChaptersByInstrument(instrumentId: string): Promise<Chapter[]> {
    return db.select().from(chapters).where(eq(chapters.instrumentId, instrumentId)).orderBy(asc(chapters.order));
  }

  async createChapter(insert: InsertChapter): Promise<Chapter> {
    const [chapter] = await db.insert(chapters).values(insert).returning();
    return chapter;
  }

  async updateChapter(id: string, updates: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const [chapter] = await db.update(chapters).set(updates).where(eq(chapters.id, id)).returning();
    return chapter || undefined;
  }

  async deleteChapter(id: string): Promise<boolean> {
    const result = await db.delete(chapters).where(eq(chapters.id, id)).returning();
    return result.length > 0;
  }

  async getSubChapter(id: string): Promise<SubChapter | undefined> {
    const [subChapter] = await db.select().from(subChapters).where(eq(subChapters.id, id));
    return subChapter || undefined;
  }

  async getSubChaptersByChapter(chapterId: string): Promise<SubChapter[]> {
    return db.select().from(subChapters).where(eq(subChapters.chapterId, chapterId)).orderBy(asc(subChapters.order));
  }

  async createSubChapter(insert: InsertSubChapter): Promise<SubChapter> {
    const [subChapter] = await db.insert(subChapters).values(insert).returning();
    return subChapter;
  }

  async updateSubChapter(id: string, updates: Partial<InsertSubChapter>): Promise<SubChapter | undefined> {
    const [subChapter] = await db.update(subChapters).set(updates).where(eq(subChapters.id, id)).returning();
    return subChapter || undefined;
  }

  async deleteSubChapter(id: string): Promise<boolean> {
    const result = await db.delete(subChapters).where(eq(subChapters.id, id)).returning();
    return result.length > 0;
  }

  async getTrainingElement(id: string): Promise<TrainingElement | undefined> {
    const [element] = await db.select().from(trainingElements).where(eq(trainingElements.id, id));
    return element || undefined;
  }

  async getTrainingElementsBySubChapter(subChapterId: string): Promise<TrainingElement[]> {
    return db.select().from(trainingElements).where(eq(trainingElements.subChapterId, subChapterId)).orderBy(asc(trainingElements.order));
  }

  async createTrainingElement(insert: InsertTrainingElement): Promise<TrainingElement> {
    const [element] = await db.insert(trainingElements).values(insert).returning();
    return element;
  }

  async updateTrainingElement(id: string, updates: Partial<InsertTrainingElement>): Promise<TrainingElement | undefined> {
    const [element] = await db.update(trainingElements).set(updates).where(eq(trainingElements.id, id)).returning();
    return element || undefined;
  }

  async deleteTrainingElement(id: string): Promise<boolean> {
    const result = await db.delete(trainingElements).where(eq(trainingElements.id, id)).returning();
    return result.length > 0;
  }

  async getValidation(id: string): Promise<Validation | undefined> {
    const [validation] = await db.select().from(validations).where(eq(validations.id, id));
    return validation || undefined;
  }

  async getValidationsByTrainee(traineeId: string): Promise<Validation[]> {
    return db.select().from(validations).where(eq(validations.traineeId, traineeId));
  }

  async getValidationsByElement(elementId: string): Promise<Validation[]> {
    return db.select().from(validations).where(eq(validations.trainingElementId, elementId));
  }

  async getValidationByTraineeAndElement(traineeId: string, elementId: string): Promise<Validation | undefined> {
    const [validation] = await db.select().from(validations).where(
      and(eq(validations.traineeId, traineeId), eq(validations.trainingElementId, elementId))
    );
    return validation || undefined;
  }

  async createValidation(insert: InsertValidation): Promise<Validation> {
    const [validation] = await db.insert(validations).values(insert).returning();
    return validation;
  }

  async deleteValidation(id: string): Promise<boolean> {
    const result = await db.delete(validations).where(eq(validations.id, id)).returning();
    return result.length > 0;
  }

  async getComfortRating(id: string): Promise<ComfortRating | undefined> {
    const [rating] = await db.select().from(comfortRatings).where(eq(comfortRatings.id, id));
    return rating || undefined;
  }

  async getComfortRatingsByTrainee(traineeId: string): Promise<ComfortRating[]> {
    return db.select().from(comfortRatings).where(eq(comfortRatings.traineeId, traineeId));
  }

  async getComfortRatingByTraineeAndElement(traineeId: string, elementId: string): Promise<ComfortRating | undefined> {
    const [rating] = await db.select().from(comfortRatings).where(
      and(eq(comfortRatings.traineeId, traineeId), eq(comfortRatings.trainingElementId, elementId))
    );
    return rating || undefined;
  }

  async createComfortRating(insert: InsertComfortRating): Promise<ComfortRating> {
    const [rating] = await db.insert(comfortRatings).values(insert).returning();
    return rating;
  }

  async updateComfortRating(id: string, updates: Partial<InsertComfortRating>): Promise<ComfortRating | undefined> {
    const [rating] = await db.update(comfortRatings).set(updates).where(eq(comfortRatings.id, id)).returning();
    return rating || undefined;
  }

  async getTrainingSession(id: string): Promise<TrainingSession | undefined> {
    const [session] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, id));
    return session || undefined;
  }

  async getTrainingSessionsByTrainer(trainerId: string): Promise<TrainingSession[]> {
    return db.select().from(trainingSessions).where(eq(trainingSessions.trainerId, trainerId));
  }

  async createTrainingSession(insert: InsertTrainingSession): Promise<TrainingSession> {
    const [session] = await db.insert(trainingSessions).values(insert).returning();
    return session;
  }

  async updateTrainingSession(id: string, updates: Partial<InsertTrainingSession>): Promise<TrainingSession | undefined> {
    const [session] = await db.update(trainingSessions).set(updates).where(eq(trainingSessions.id, id)).returning();
    return session || undefined;
  }

  async deleteTrainingSession(id: string): Promise<boolean> {
    const result = await db.delete(trainingSessions).where(eq(trainingSessions.id, id)).returning();
    return result.length > 0;
  }

  async getLaboratory(id: string): Promise<Laboratory | undefined> {
    const [lab] = await db.select().from(laboratories).where(eq(laboratories.id, id));
    return lab || undefined;
  }

  async getLaboratoryByCode(code: string): Promise<Laboratory | undefined> {
    const [lab] = await db.select().from(laboratories).where(eq(laboratories.code, code));
    return lab || undefined;
  }

  async getLaboratories(): Promise<Laboratory[]> {
    return db.select().from(laboratories);
  }

  async createLaboratory(insert: InsertLaboratory): Promise<Laboratory> {
    const [lab] = await db.insert(laboratories).values(insert).returning();
    return lab;
  }

  async updateLaboratory(id: string, updates: Partial<InsertLaboratory>): Promise<Laboratory | undefined> {
    const [lab] = await db.update(laboratories).set(updates).where(eq(laboratories.id, id)).returning();
    return lab || undefined;
  }

  async deleteLaboratory(id: string): Promise<boolean> {
    const result = await db.delete(laboratories).where(eq(laboratories.id, id)).returning();
    return result.length > 0;
  }

  async getModificationHistory(entityType: string, entityId: string): Promise<ModificationHistory[]> {
    return db.select().from(modificationHistory).where(
      and(eq(modificationHistory.entityType, entityType), eq(modificationHistory.entityId, entityId))
    );
  }

  async getAllModificationHistory(): Promise<ModificationHistory[]> {
    return db.select().from(modificationHistory).orderBy(modificationHistory.modifiedAt);
  }

  async createModificationHistory(insert: InsertModificationHistory): Promise<ModificationHistory> {
    const [history] = await db.insert(modificationHistory).values(insert).returning();
    return history;
  }

  async seedDatabase(): Promise<void> {
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      return;
    }

    const labsData = [
      { code: "LAB001", name: "CHU Lyon" },
      { code: "LAB002", name: "Institut Pasteur" },
      { code: "LAB003", name: "CNRS Marseille" },
    ];
    const insertedLabs = await db.insert(laboratories).values(labsData).returning();
    const lab1 = insertedLabs.find(l => l.code === "LAB001");
    const lab2 = insertedLabs.find(l => l.code === "LAB002");

    const usersData: InsertUser[] = [
      { username: "trainer", password: "pass", role: "trainer", name: "Dr. Sophie Laurent", laboratoryId: null, email: "sophie.laurent@bdbfrance.com" },
      { username: "admin", password: "pass", role: "admin", name: "Admin System", laboratoryId: null, email: "admin@bdbfrance.com" },
      { username: "jean.dupont", password: "pass", role: "trainee", name: "Jean Dupont", laboratoryId: lab1?.id || null, email: "jean.dupont@chu-lyon.fr" },
      { username: "marie.martin", password: "pass", role: "trainee", name: "Marie Martin", laboratoryId: lab1?.id || null, email: "marie.martin@chu-lyon.fr" },
      { username: "pierre.bernard", password: "pass", role: "trainee", name: "Pierre Bernard", laboratoryId: lab2?.id || null, email: "pierre.bernard@pasteur.fr" },
    ];
    const insertedUsers = await db.insert(users).values(usersData).returning();
    const trainer = insertedUsers.find(u => u.username === "trainer");
    const trainee1 = insertedUsers.find(u => u.username === "jean.dupont");

    const instrumentsData: InsertInstrument[] = [
      { name: "FACS Canto II", description: "Cytometre analyseur 8 couleurs", icon: null },
      { name: "LSR Fortessa", description: "Cytometre analyseur 18 couleurs", icon: null },
      { name: "FACS Aria III", description: "Trieur cellulaire 4 voies", icon: null },
      { name: "FACS Melody", description: "Trieur cellulaire compact", icon: null },
    ];
    const insertedInstruments = await db.insert(instruments).values(instrumentsData).returning();
    const inst1 = insertedInstruments.find(i => i.name === "FACS Canto II");

    if (!inst1) return;

    const chaptersData: InsertChapter[] = [
      { instrumentId: inst1.id, name: "Demarrage de l'instrument", order: 1 },
      { instrumentId: inst1.id, name: "Acquisition des donnees", order: 2 },
      { instrumentId: inst1.id, name: "Arret de l'instrument", order: 3 },
    ];
    const insertedChapters = await db.insert(chapters).values(chaptersData).returning();
    const ch1 = insertedChapters[0];
    const ch2 = insertedChapters[1];
    const ch3 = insertedChapters[2];

    const subChaptersData: InsertSubChapter[] = [
      { chapterId: ch1.id, name: "Mise en route", order: 1 },
      { chapterId: ch1.id, name: "Controle qualite", order: 2 },
      { chapterId: ch2.id, name: "Configuration du protocole", order: 1 },
      { chapterId: ch3.id, name: "Procedure d'arret", order: 1 },
    ];
    const insertedSubChapters = await db.insert(subChapters).values(subChaptersData).returning();
    const sub1 = insertedSubChapters[0];
    const sub2 = insertedSubChapters[1];
    const sub3 = insertedSubChapters[2];
    const sub4 = insertedSubChapters[3];

    const elementsData: InsertTrainingElement[] = [
      { subChapterId: sub1.id, name: "Allumage du cytometre", description: "Procedure d'allumage", facsUniversityLink: "https://facsuniversity.com/allumage", order: 1 },
      { subChapterId: sub1.id, name: "Verification des fluides", description: "Controle des niveaux", facsUniversityLink: "https://facsuniversity.com/fluides", order: 2 },
      { subChapterId: sub1.id, name: "Lancement du logiciel", description: "Demarrage de FACSDiva", facsUniversityLink: null, order: 3 },
      { subChapterId: sub2.id, name: "CST quotidien", description: "Cytometer Setup & Tracking", facsUniversityLink: "https://facsuniversity.com/cst", order: 1 },
      { subChapterId: sub2.id, name: "Validation des resultats CST", description: "Analyse des resultats", facsUniversityLink: null, order: 2 },
      { subChapterId: sub3.id, name: "Creation d'experience", description: "Nouveau projet dans FACSDiva", facsUniversityLink: "https://facsuniversity.com/experience", order: 1 },
      { subChapterId: sub3.id, name: "Configuration des parametres", description: "Voltages et compensations", facsUniversityLink: null, order: 2 },
      { subChapterId: sub3.id, name: "Creation des portes", description: "Strategie de gating", facsUniversityLink: "https://facsuniversity.com/gating", order: 3 },
      { subChapterId: sub4.id, name: "Nettoyage fluidique", description: "Rincage du systeme", facsUniversityLink: null, order: 1 },
      { subChapterId: sub4.id, name: "Extinction du cytometre", description: "Procedure d'arret", facsUniversityLink: null, order: 2 },
    ];
    const insertedElements = await db.insert(trainingElements).values(elementsData).returning();

    if (trainer && trainee1) {
      const validationsData: InsertValidation[] = [
        { traineeId: trainee1.id, trainingElementId: insertedElements[0].id, trainerId: trainer.id, trainingLocation: "Rungis" },
        { traineeId: trainee1.id, trainingElementId: insertedElements[1].id, trainerId: trainer.id, trainingLocation: "Rungis" },
        { traineeId: trainee1.id, trainingElementId: insertedElements[2].id, trainerId: trainer.id, trainingLocation: "Rungis" },
        { traineeId: trainee1.id, trainingElementId: insertedElements[3].id, trainerId: trainer.id, trainingLocation: "Rungis" },
      ];
      await db.insert(validations).values(validationsData);

      const ratingsData: InsertComfortRating[] = [
        { traineeId: trainee1.id, trainingElementId: insertedElements[0].id, rating: 4, isRevision: false },
        { traineeId: trainee1.id, trainingElementId: insertedElements[1].id, rating: 5, isRevision: false },
        { traineeId: trainee1.id, trainingElementId: insertedElements[2].id, rating: 3, isRevision: false },
        { traineeId: trainee1.id, trainingElementId: insertedElements[3].id, rating: 4, isRevision: false },
      ];
      await db.insert(comfortRatings).values(ratingsData);
    }
  }
}

export const storage = new DatabaseStorage();
