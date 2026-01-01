import { useState } from "react";
import { FlaskConical, Plus, ChevronRight, Edit, Trash2, MoreHorizontal, BookOpen, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";

interface TrainingElement {
  id: string;
  name: string;
  description?: string;
  hasLink: boolean;
}

interface SubChapter {
  id: string;
  name: string;
  elements: TrainingElement[];
}

interface Chapter {
  id: string;
  name: string;
  subChapters: SubChapter[];
}

interface InstrumentData {
  id: string;
  name: string;
  description: string;
  chaptersCount: number;
  elementsCount: number;
  chapters: Chapter[];
}

export default function AdminInstruments() {
  const { t } = useApp();
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

  const instruments: InstrumentData[] = [
    {
      id: "i1",
      name: "FACS Canto II",
      description: "Cytomètre analyseur 8 couleurs",
      chaptersCount: 3,
      elementsCount: 10,
      chapters: [
        {
          id: "ch1",
          name: "Démarrage de l'instrument",
          subChapters: [
            {
              id: "sub1",
              name: "Mise en route",
              elements: [
                { id: "el1", name: "Allumage du cytomètre", description: "Procédure d'allumage", hasLink: true },
                { id: "el2", name: "Vérification des fluides", description: "Contrôle des niveaux", hasLink: true },
                { id: "el3", name: "Lancement du logiciel", description: "Démarrage de FACSDiva", hasLink: false },
              ],
            },
            {
              id: "sub2",
              name: "Contrôle qualité",
              elements: [
                { id: "el4", name: "CST quotidien", description: "Cytometer Setup & Tracking", hasLink: true },
                { id: "el5", name: "Validation des résultats CST", description: "Analyse des résultats", hasLink: false },
              ],
            },
          ],
        },
        {
          id: "ch2",
          name: "Acquisition des données",
          subChapters: [
            {
              id: "sub3",
              name: "Configuration du protocole",
              elements: [
                { id: "el6", name: "Création d'expérience", description: "Nouveau projet dans FACSDiva", hasLink: true },
                { id: "el7", name: "Configuration des paramètres", description: "Voltages et compensations", hasLink: false },
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
      chaptersCount: 4,
      elementsCount: 12,
      chapters: [],
    },
    {
      id: "i3",
      name: "FACS Aria III",
      description: "Trieur cellulaire 4 voies",
      chaptersCount: 5,
      elementsCount: 15,
      chapters: [],
    },
  ];

  const selectedInstrumentData = instruments.find((i) => i.id === selectedInstrument);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t.navigation.instruments}
          </h1>
          <p className="text-muted-foreground">
            Gérez les instruments et leur contenu de formation
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un instrument
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Instruments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {instruments.map((instrument) => (
              <button
                key={instrument.id}
                onClick={() => setSelectedInstrument(instrument.id)}
                className={`w-full p-3 rounded-md text-left transition-colors ${
                  selectedInstrument === instrument.id
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-muted/50 hover-elevate"
                }`}
                data-testid={`button-instrument-${instrument.id}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{instrument.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {instrument.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {instrument.chaptersCount} chapitres
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {instrument.elementsCount} éléments
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg">
              {selectedInstrumentData
                ? selectedInstrumentData.name
                : "Sélectionnez un instrument"}
            </CardTitle>
            {selectedInstrumentData && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Chapitre
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier l'instrument
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer l'instrument
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!selectedInstrumentData ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FlaskConical className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez un instrument pour voir son contenu
                </p>
              </div>
            ) : selectedInstrumentData.chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  Aucun chapitre pour cet instrument
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un chapitre
                </Button>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {selectedInstrumentData.chapters.map((chapter) => (
                  <AccordionItem
                    key={chapter.id}
                    value={chapter.id}
                    className="border rounded-md px-4"
                  >
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-medium">{chapter.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {chapter.subChapters.length} sous-chapitres
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4 pl-4">
                        {chapter.subChapters.map((subChapter) => (
                          <div key={subChapter.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-muted-foreground">
                                {subChapter.name}
                              </h4>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-3 w-3 mr-1" />
                                Élément
                              </Button>
                            </div>
                            <div className="space-y-1">
                              {subChapter.elements.map((element) => (
                                <div
                                  key={element.id}
                                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm">{element.name}</p>
                                      {element.description && (
                                        <p className="text-xs text-muted-foreground">
                                          {element.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {element.hasLink && (
                                      <Badge variant="outline" className="text-xs">
                                        Lien
                                      </Badge>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
