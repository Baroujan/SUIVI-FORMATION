import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstrumentTabs } from "@/components/InstrumentTabs";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import type { InstrumentWithChapters } from "@shared/schema";

export default function TraineeProgress() {
  const { t, currentUser } = useApp();
  const { toast } = useToast();

  const mockInstrumentsWithProgress: InstrumentWithChapters[] = [
    {
      id: "i1",
      name: "FACS Canto II",
      description: "Cytomètre analyseur 8 couleurs",
      icon: null,
      chapters: [
        {
          id: "ch1-i1",
          instrumentId: "i1",
          name: "Démarrage de l'instrument",
          order: 1,
          subChapters: [
            {
              id: "sub1-i1",
              chapterId: "ch1-i1",
              name: "Mise en route",
              order: 1,
              elements: [
                {
                  id: "el1-i1",
                  subChapterId: "sub1-i1",
                  name: "Allumage du cytomètre",
                  description: "Procédure d'allumage",
                  facsUniversityLink: "https://facsuniversity.com/allumage",
                  order: 1,
                  validation: {
                    id: "v1",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el1-i1",
                    trainerId: "trainer1",
                    validatedAt: new Date("2026-01-15"),
                    trainingLocation: "Rungis",
                  },
                  comfortRating: {
                    id: "cr1",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el1-i1",
                    rating: 4,
                    ratedAt: new Date("2026-01-15"),
                    isRevision: false,
                  },
                },
                {
                  id: "el2-i1",
                  subChapterId: "sub1-i1",
                  name: "Vérification des fluides",
                  description: "Contrôle des niveaux",
                  facsUniversityLink: "https://facsuniversity.com/fluides",
                  order: 2,
                  validation: {
                    id: "v2",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el2-i1",
                    trainerId: "trainer1",
                    validatedAt: new Date("2026-01-15"),
                    trainingLocation: "Rungis",
                  },
                  comfortRating: {
                    id: "cr2",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el2-i1",
                    rating: 5,
                    ratedAt: new Date("2026-01-15"),
                    isRevision: false,
                  },
                },
                {
                  id: "el3-i1",
                  subChapterId: "sub1-i1",
                  name: "Lancement du logiciel",
                  description: "Démarrage de FACSDiva",
                  facsUniversityLink: null,
                  order: 3,
                  validation: {
                    id: "v3",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el3-i1",
                    trainerId: "trainer1",
                    validatedAt: new Date("2026-01-14"),
                    trainingLocation: "Rungis",
                  },
                  comfortRating: {
                    id: "cr3",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el3-i1",
                    rating: 3,
                    ratedAt: new Date("2026-01-14"),
                    isRevision: false,
                  },
                },
              ],
            },
            {
              id: "sub2-i1",
              chapterId: "ch1-i1",
              name: "Contrôle qualité",
              order: 2,
              elements: [
                {
                  id: "el4-i1",
                  subChapterId: "sub2-i1",
                  name: "CST quotidien",
                  description: "Cytometer Setup & Tracking",
                  facsUniversityLink: "https://facsuniversity.com/cst",
                  order: 1,
                  validation: {
                    id: "v4",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el4-i1",
                    trainerId: "trainer1",
                    validatedAt: new Date("2026-01-14"),
                    trainingLocation: "Rungis",
                  },
                  comfortRating: {
                    id: "cr4",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el4-i1",
                    rating: 4,
                    ratedAt: new Date("2026-01-14"),
                    isRevision: false,
                  },
                },
                {
                  id: "el5-i1",
                  subChapterId: "sub2-i1",
                  name: "Validation des résultats CST",
                  description: "Analyse des résultats",
                  facsUniversityLink: null,
                  order: 2,
                },
              ],
            },
          ],
        },
        {
          id: "ch2-i1",
          instrumentId: "i1",
          name: "Acquisition des données",
          order: 2,
          subChapters: [
            {
              id: "sub3-i1",
              chapterId: "ch2-i1",
              name: "Configuration du protocole",
              order: 1,
              elements: [
                {
                  id: "el6-i1",
                  subChapterId: "sub3-i1",
                  name: "Création d'expérience",
                  description: "Nouveau projet dans FACSDiva",
                  facsUniversityLink: "https://facsuniversity.com/experience",
                  order: 1,
                },
                {
                  id: "el7-i1",
                  subChapterId: "sub3-i1",
                  name: "Configuration des paramètres",
                  description: "Voltages et compensations",
                  facsUniversityLink: null,
                  order: 2,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "i2",
      name: "LSR Fortessa",
      description: "Cytomètre analyseur 18 couleurs",
      icon: null,
      chapters: [
        {
          id: "ch1-i2",
          instrumentId: "i2",
          name: "Démarrage de l'instrument",
          order: 1,
          subChapters: [
            {
              id: "sub1-i2",
              chapterId: "ch1-i2",
              name: "Mise en route",
              order: 1,
              elements: [
                {
                  id: "el1-i2",
                  subChapterId: "sub1-i2",
                  name: "Allumage des lasers",
                  description: "Procédure d'allumage des lasers",
                  facsUniversityLink: "https://facsuniversity.com/lasers",
                  order: 1,
                  validation: {
                    id: "v5",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el1-i2",
                    trainerId: "trainer2",
                    validatedAt: new Date("2026-01-10"),
                    trainingLocation: "En ligne",
                  },
                  comfortRating: {
                    id: "cr5",
                    traineeId: currentUser?.id || "",
                    trainingElementId: "el1-i2",
                    rating: 3,
                    ratedAt: new Date("2026-01-10"),
                    isRevision: false,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const handleRateElement = (elementId: string, rating: number) => {
    toast({
      title: "Évaluation enregistrée",
      description: `Niveau d'aisance mis à jour: ${rating}/5`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.navigation.progress}
        </h1>
        <p className="text-muted-foreground">
          Consultez et évaluez votre aisance sur chaque élément validé
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mes éléments de formation</CardTitle>
        </CardHeader>
        <CardContent>
          <InstrumentTabs
            instruments={mockInstrumentsWithProgress}
            mode="trainee"
            onRateElement={handleRateElement}
          />
        </CardContent>
      </Card>
    </div>
  );
}
