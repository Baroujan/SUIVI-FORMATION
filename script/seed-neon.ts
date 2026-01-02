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
    name: 'CHU Lyon - Centre de Cytométrie',
    code: 'LAB001',
  }).returning();
  
  const [lab2] = await db.insert(schema.laboratories).values({
    name: 'Institut Pasteur - Plateforme Cytométrie',
    code: 'LAB002',
  }).returning();

  const [lab3] = await db.insert(schema.laboratories).values({
    name: 'CNRS Marseille - UMR 7280',
    code: 'LAB003',
  }).returning();
  
  console.log('Labs created');

  await db.insert(schema.users).values([
    { username: 'trainer', password: '', role: 'trainer', name: 'Dr. Sophie Laurent', email: 'sophie.laurent@bdbfrance.com' },
    { username: 'formateur2', password: '', role: 'trainer', name: 'Marc Dubois', email: 'marc.dubois@bdbfrance.com' },
    { username: 'admin', password: '', role: 'admin', name: 'Administrateur Système', email: 'admin@bdbfrance.com' },
    { username: 'jean.dupont', password: '', role: 'trainee', name: 'Jean Dupont', email: 'jean.dupont@chu-lyon.fr', laboratoryId: lab1.id },
    { username: 'marie.martin', password: '', role: 'trainee', name: 'Marie Martin', email: 'marie.martin@chu-lyon.fr', laboratoryId: lab1.id },
    { username: 'pierre.bernard', password: '', role: 'trainee', name: 'Pierre Bernard', email: 'pierre.bernard@pasteur.fr', laboratoryId: lab2.id },
    { username: 'claire.petit', password: '', role: 'trainee', name: 'Claire Petit', email: 'claire.petit@pasteur.fr', laboratoryId: lab2.id },
    { username: 'thomas.roux', password: '', role: 'trainee', name: 'Thomas Roux', email: 'thomas.roux@cnrs.fr', laboratoryId: lab3.id },
  ]);
  console.log('Users created');

  const instruments = await db.insert(schema.instruments).values([
    {
      name: 'BD FACSCanto II',
      description: 'Cytomètre analyseur 3 lasers, 8 couleurs - Système de référence pour la recherche et le diagnostic',
      icon: 'Beaker',
    },
    {
      name: 'BD FACSLyric',
      description: 'Cytomètre clinique avec système de gestion des réactifs intégré - Idéal pour le diagnostic clinique',
      icon: 'Microscope',
    },
    {
      name: 'BD FACSCelesta',
      description: 'Cytomètre analyseur multicolore jusqu\'à 14 couleurs - Configuration flexible pour la recherche',
      icon: 'Flask',
    },
    {
      name: 'BD FACSymphony A5',
      description: 'Analyseur spectral haute performance jusqu\'à 50 paramètres - Recherche immunologique avancée',
      icon: 'Atom',
    },
    {
      name: 'BD FACSAria III',
      description: 'Trieur cellulaire haute vitesse 4 voies - Tri aseptique et récupération cellulaire',
      icon: 'Filter',
    },
    {
      name: 'BD FACSMelody',
      description: 'Trieur cellulaire compact - Solution de tri accessible pour les laboratoires de recherche',
      icon: 'Pipette',
    },
  ]).returning();
  console.log('Instruments created:', instruments.length);

  const facsCantoII = instruments[0];
  const facsLyric = instruments[1];
  const facsCelesta = instruments[2];

  const chapters = await db.insert(schema.chapters).values([
    { instrumentId: facsCantoII.id, name: 'Démarrage et Arrêt', order: 1 },
    { instrumentId: facsCantoII.id, name: 'Contrôle Qualité Quotidien', order: 2 },
    { instrumentId: facsCantoII.id, name: 'Acquisition des Données', order: 3 },
    { instrumentId: facsCantoII.id, name: 'Compensation', order: 4 },
    { instrumentId: facsCantoII.id, name: 'Analyse avec FACSDiva', order: 5 },
    { instrumentId: facsCantoII.id, name: 'Maintenance', order: 6 },
    { instrumentId: facsLyric.id, name: 'Démarrage et Arrêt', order: 1 },
    { instrumentId: facsLyric.id, name: 'Contrôle Qualité', order: 2 },
    { instrumentId: facsLyric.id, name: 'Gestion des Réactifs', order: 3 },
    { instrumentId: facsLyric.id, name: 'Acquisition Clinique', order: 4 },
    { instrumentId: facsCelesta.id, name: 'Démarrage et Arrêt', order: 1 },
    { instrumentId: facsCelesta.id, name: 'Configuration Optique', order: 2 },
    { instrumentId: facsCelesta.id, name: 'Acquisition Multicolore', order: 3 },
  ]).returning();
  console.log('Chapters created:', chapters.length);

  const subChaptersData = [
    { chapterId: chapters[0].id, name: 'Mise en route du système', order: 1 },
    { chapterId: chapters[0].id, name: 'Arrêt quotidien', order: 2 },
    { chapterId: chapters[0].id, name: 'Arrêt prolongé', order: 3 },
    { chapterId: chapters[1].id, name: 'CS&T (Cytometer Setup & Tracking)', order: 1 },
    { chapterId: chapters[1].id, name: 'Validation des performances', order: 2 },
    { chapterId: chapters[2].id, name: 'Configuration de l\'expérience', order: 1 },
    { chapterId: chapters[2].id, name: 'Réglage des voltages', order: 2 },
    { chapterId: chapters[2].id, name: 'Enregistrement des données', order: 3 },
    { chapterId: chapters[3].id, name: 'Compensation automatique', order: 1 },
    { chapterId: chapters[3].id, name: 'Compensation manuelle', order: 2 },
    { chapterId: chapters[4].id, name: 'Création de graphiques', order: 1 },
    { chapterId: chapters[4].id, name: 'Stratégie de gating', order: 2 },
    { chapterId: chapters[4].id, name: 'Statistiques et export', order: 3 },
    { chapterId: chapters[5].id, name: 'Nettoyage hebdomadaire', order: 1 },
    { chapterId: chapters[5].id, name: 'Remplacement des fluides', order: 2 },
    { chapterId: chapters[6].id, name: 'Démarrage FACSLyric', order: 1 },
    { chapterId: chapters[6].id, name: 'Arrêt FACSLyric', order: 2 },
    { chapterId: chapters[7].id, name: 'Billes de calibration', order: 1 },
    { chapterId: chapters[8].id, name: 'Chargement des réactifs', order: 1 },
    { chapterId: chapters[8].id, name: 'Gestion des lots', order: 2 },
    { chapterId: chapters[9].id, name: 'Protocoles cliniques', order: 1 },
    { chapterId: chapters[10].id, name: 'Démarrage FACSCelesta', order: 1 },
    { chapterId: chapters[11].id, name: 'Configuration des filtres', order: 1 },
    { chapterId: chapters[12].id, name: 'Panels multicolores', order: 1 },
  ];
  
  const subChapters = await db.insert(schema.subChapters).values(subChaptersData).returning();
  console.log('Sub-chapters created:', subChapters.length);

  const trainingElementsData = [
    { subChapterId: subChapters[0].id, name: 'Allumage du cytomètre', description: 'Séquence de démarrage du FACSCanto II', order: 1, facsUniversityLink: 'https://www.bdbiosciences.com/en-fr/learn/flow-cytometry' },
    { subChapterId: subChapters[0].id, name: 'Vérification des niveaux de fluides', description: 'Contrôle du liquide de gaine et des solutions de nettoyage', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[0].id, name: 'Lancement de FACSDiva', description: 'Démarrage du logiciel d\'acquisition', order: 3, facsUniversityLink: 'https://www.bdbiosciences.com/en-fr/products/software/instrument-software/bd-facsdiva-software' },
    { subChapterId: subChapters[0].id, name: 'Amorçage du système fluidique', description: 'Prime et purge du système', order: 4, facsUniversityLink: null },
    { subChapterId: subChapters[1].id, name: 'Procédure de rinçage', description: 'Nettoyage en fin de journée', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[1].id, name: 'Mise en veille du cytomètre', description: 'Arrêt sécurisé du système', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[2].id, name: 'Rinçage approfondi', description: 'Nettoyage pour arrêt prolongé', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[2].id, name: 'Stockage des capillaires', description: 'Préparation pour non-utilisation', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[3].id, name: 'Préparation des billes CS&T', description: 'Reconstitution et vortex des billes', order: 1, facsUniversityLink: 'https://www.bdbiosciences.com/en-fr/products/reagents/flow-cytometry-reagents/clinical-diagnostics/quality-control/bd-cst-beads' },
    { subChapterId: subChapters[3].id, name: 'Lancement du module CS&T', description: 'Exécution de la procédure automatique', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[3].id, name: 'Interprétation des résultats CS&T', description: 'Analyse des valeurs de performance', order: 3, facsUniversityLink: null },
    { subChapterId: subChapters[3].id, name: 'Application des paramètres', description: 'Validation et enregistrement des settings', order: 4, facsUniversityLink: null },
    { subChapterId: subChapters[4].id, name: 'Suivi des tendances', description: 'Analyse historique des performances', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[4].id, name: 'Actions correctives', description: 'Résolution des dérives de performance', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[5].id, name: 'Création d\'une nouvelle expérience', description: 'Configuration initiale du projet', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[5].id, name: 'Définition des paramètres', description: 'Sélection des fluorochromes', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[5].id, name: 'Configuration des tubes', description: 'Organisation des échantillons', order: 3, facsUniversityLink: null },
    { subChapterId: subChapters[6].id, name: 'Réglage des PMT', description: 'Optimisation des photomultiplicateurs', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[6].id, name: 'Vérification du spillover', description: 'Contrôle des débordements spectraux', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[7].id, name: 'Configuration du portoir', description: 'Chargement des échantillons', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[7].id, name: 'Paramètres d\'acquisition', description: 'Définition des critères d\'arrêt', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[7].id, name: 'Export des fichiers FCS', description: 'Sauvegarde des données brutes', order: 3, facsUniversityLink: null },
    { subChapterId: subChapters[8].id, name: 'Préparation des contrôles simples marquages', description: 'Single stain controls', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[8].id, name: 'Acquisition des compensations', description: 'Enregistrement des contrôles', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[8].id, name: 'Calcul automatique de la matrice', description: 'Génération de la compensation', order: 3, facsUniversityLink: null },
    { subChapterId: subChapters[9].id, name: 'Ajustement manuel des coefficients', description: 'Fine-tuning de la compensation', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[9].id, name: 'Validation visuelle', description: 'Contrôle qualité de la compensation', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[10].id, name: 'Types de graphiques', description: 'Dot plot, histogramme, densité', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[10].id, name: 'Personnalisation de l\'affichage', description: 'Couleurs, échelles, annotations', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[11].id, name: 'Hiérarchie des gates', description: 'Organisation logique du gating', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[11].id, name: 'Types de gates', description: 'Polygone, rectangle, quadrant', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[11].id, name: 'Gates booléennes', description: 'Combinaison de populations', order: 3, facsUniversityLink: null },
    { subChapterId: subChapters[12].id, name: 'Calcul des statistiques', description: 'Pourcentages, MFI, CV', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[12].id, name: 'Export vers Excel', description: 'Tableaux de résultats', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[12].id, name: 'Génération de rapports', description: 'Création de batch reports', order: 3, facsUniversityLink: null },
    { subChapterId: subChapters[13].id, name: 'Nettoyage de la cellule de flux', description: 'Maintenance hebdomadaire', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[13].id, name: 'Vérification des filtres optiques', description: 'Inspection du chemin optique', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[14].id, name: 'Changement du liquide de gaine', description: 'Remplacement du sheath fluid', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[14].id, name: 'Vidange des déchets', description: 'Gestion des containers', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[15].id, name: 'Démarrage du FACSLyric', description: 'Séquence d\'initialisation clinique', order: 1, facsUniversityLink: 'https://www.bdbiosciences.com/en-fr/products/instruments/flow-cytometers/clinical-cell-analyzers/bd-facslyric' },
    { subChapterId: subChapters[15].id, name: 'Connexion au LIS', description: 'Interface avec le système d\'information', order: 2, facsUniversityLink: null },
    { subChapterId: subChapters[16].id, name: 'Procédure d\'arrêt clinique', description: 'Shutdown conforme aux normes', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[17].id, name: 'QC quotidien FACSLyric', description: 'Contrôle qualité spécifique', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[18].id, name: 'Installation des cassettes', description: 'Chargement des réactifs BD', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[19].id, name: 'Traçabilité des lots', description: 'Gestion des numéros de lot', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[20].id, name: 'Lancement d\'un panel IVD', description: 'Exécution de protocoles validés', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[21].id, name: 'Démarrage FACSCelesta', description: 'Initialisation du système multicolore', order: 1, facsUniversityLink: 'https://www.bdbiosciences.com/en-fr/products/instruments/flow-cytometers/research-cell-analyzers/bd-facscelesta' },
    { subChapterId: subChapters[22].id, name: 'Sélection des filtres', description: 'Configuration optique personnalisée', order: 1, facsUniversityLink: null },
    { subChapterId: subChapters[23].id, name: 'Design de panels complexes', description: 'Stratégie 10+ couleurs', order: 1, facsUniversityLink: null },
  ];

  await db.insert(schema.trainingElements).values(trainingElementsData);
  console.log('Training elements created:', trainingElementsData.length);

  console.log('Seed completed successfully!');
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
