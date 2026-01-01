import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  const existingUsers = await db.select().from(schema.users);
  if (existingUsers.length > 0) {
    console.log('Data already exists, skipping seed');
    await pool.end();
    return;
  }

  const [lab1] = await db.insert(schema.laboratories).values({
    name: 'CHU Lyon',
    code: 'LAB001',
  }).returning();
  
  const [lab2] = await db.insert(schema.laboratories).values({
    name: 'Institut Pasteur',
    code: 'LAB002',
  }).returning();
  
  console.log('Labs created');

  await db.insert(schema.users).values([
    { username: 'trainer', password: '', role: 'trainer', name: 'Dr. Sophie Laurent', email: 'sophie.laurent@bdbfrance.com' },
    { username: 'admin', password: '', role: 'admin', name: 'Admin User', email: 'admin@bdbfrance.com' },
    { username: 'jean.dupont', password: '', role: 'trainee', name: 'Jean Dupont', email: 'jean.dupont@chu-lyon.fr', laboratoryId: lab1.id },
    { username: 'marie.martin', password: '', role: 'trainee', name: 'Marie Martin', email: 'marie.martin@chu-lyon.fr', laboratoryId: lab1.id },
    { username: 'pierre.bernard', password: '', role: 'trainee', name: 'Pierre Bernard', email: 'pierre.bernard@pasteur.fr', laboratoryId: lab2.id },
  ]);
  console.log('Users created');

  const [inst1] = await db.insert(schema.instruments).values({
    name: 'FACSCanto II',
    description: '3-laser, 8-color flow cytometer',
    icon: 'Beaker',
  }).returning();
  
  const [inst2] = await db.insert(schema.instruments).values({
    name: 'FACSLyric',
    description: 'Clinical flow cytometer',
    icon: 'Microscope',
  }).returning();
  console.log('Instruments created');

  const [ch1] = await db.insert(schema.chapters).values({
    instrumentId: inst1.id,
    name: 'Startup and Shutdown',
    order: 1,
  }).returning();
  
  const [ch2] = await db.insert(schema.chapters).values({
    instrumentId: inst1.id,
    name: 'Daily QC',
    order: 2,
  }).returning();
  console.log('Chapters created');

  const [sc1] = await db.insert(schema.subChapters).values({
    chapterId: ch1.id,
    name: 'Startup Procedures',
    order: 1,
  }).returning();
  
  const [sc2] = await db.insert(schema.subChapters).values({
    chapterId: ch2.id,
    name: 'CS&T Setup',
    order: 1,
  }).returning();
  console.log('Sub-chapters created');

  await db.insert(schema.trainingElements).values([
    { subChapterId: sc1.id, name: 'Power on instrument', description: 'How to power on the cytometer', order: 1 },
    { subChapterId: sc1.id, name: 'Launch FACSDiva', description: 'Start FACSDiva software', order: 2 },
    { subChapterId: sc1.id, name: 'Prime fluidics', description: 'Prime the fluidics system', order: 3 },
    { subChapterId: sc2.id, name: 'Load CS&T beads', description: 'Load cytometer setup and tracking beads', order: 1 },
    { subChapterId: sc2.id, name: 'Run CS&T', description: 'Execute CS&T procedure', order: 2 },
  ]);
  console.log('Training elements created');

  console.log('Seed completed successfully!');
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
