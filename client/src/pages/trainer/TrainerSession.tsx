import { useState } from "react";
import { Save, FolderOpen, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { TraineeSelector } from "@/components/TraineeSelector";
import { InstrumentSelector } from "@/components/InstrumentSelector";
import { InstrumentTabs } from "@/components/InstrumentTabs";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import type { User, Instrument, InstrumentWithChapters } from "@shared/schema";

export default function TrainerSession() {
  const { t, currentUser } = useApp();
  const { toast } = useToast();

  const [sessionName, setSessionName] = useState("");
  const [location, setLocation] = useState<string>("rungis");
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>([]);
  const [selectedInstrumentIds, setSelectedInstrumentIds] = useState<string[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [validatingElements, setValidatingElements] = useState<Set<string>>(new Set());

  const mockTrainees: User[] = [
    { id: "t1", username: "jean.dupont", password: "", role: "trainee", name: "Jean Dupont", laboratoryId: "LAB001", email: "jean.dupont@example.com" },
    { id: "t2", username: "marie.martin", password: "", role: "trainee", name: "Marie Martin", laboratoryId: "LAB001", email: "marie.martin@example.com" },
    { id: "t3", username: "pierre.bernard", password: "", role: "trainee", name: "Pierre Bernard", laboratoryId: "LAB002", email: "pierre.bernard@example.com" },
    { id: "t4", username: "sophie.petit", password: "", role: "trainee", name: "Sophie Petit", laboratoryId: "LAB002", email: "sophie.petit@example.com" },
    { id: "t5", username: "lucas.robert", password: "", role: "trainee", name: "Lucas Robert", laboratoryId: "LAB003", email: "lucas.robert@example.com" },
  ];

  const mockInstruments: Instrument[] = [
    { id: "i1", name: "FACS Canto II", description: "Cytomètre analyseur 8 couleurs", icon: null },
    { id: "i2", name: "LSR Fortessa", description: "Cytomètre analyseur 18 couleurs", icon: null },
    { id: "i3", name: "FACS Aria III", description: "Trieur cellulaire 4 voies", icon: null },
    { id: "i4", name: "FACS Melody", description: "Trieur cellulaire compact", icon: null },
  ];

  const mockInstrumentsWithChapters: InstrumentWithChapters[] = selectedInstrumentIds.map((id) => {
    const instrument = mockInstruments.find((i) => i.id === id)!;
    return {
      ...instrument,
      chapters: [
        {
          id: `ch1-${id}`,
          instrumentId: id,
          name: "Démarrage de l'instrument",
          order: 1,
          subChapters: [
            {
              id: `sub1-${id}`,
              chapterId: `ch1-${id}`,
              name: "Mise en route",
              order: 1,
              elements: [
                { id: `el1-${id}`, subChapterId: `sub1-${id}`, name: "Allumage du cytomètre", description: "Procédure d'allumage", facsUniversityLink: "https://facsuniversity.com/allumage", order: 1 },
                { id: `el2-${id}`, subChapterId: `sub1-${id}`, name: "Vérification des fluides", description: "Contrôle des niveaux", facsUniversityLink: "https://facsuniversity.com/fluides", order: 2 },
                { id: `el3-${id}`, subChapterId: `sub1-${id}`, name: "Lancement du logiciel", description: "Démarrage de FACSDiva", facsUniversityLink: null, order: 3 },
              ],
            },
            {
              id: `sub2-${id}`,
              chapterId: `ch1-${id}`,
              name: "Contrôle qualité",
              order: 2,
              elements: [
                { id: `el4-${id}`, subChapterId: `sub2-${id}`, name: "CST quotidien", description: "Cytometer Setup & Tracking", facsUniversityLink: "https://facsuniversity.com/cst", order: 1 },
                { id: `el5-${id}`, subChapterId: `sub2-${id}`, name: "Validation des résultats CST", description: "Analyse des résultats", facsUniversityLink: null, order: 2 },
              ],
            },
          ],
        },
        {
          id: `ch2-${id}`,
          instrumentId: id,
          name: "Acquisition des données",
          order: 2,
          subChapters: [
            {
              id: `sub3-${id}`,
              chapterId: `ch2-${id}`,
              name: "Configuration du protocole",
              order: 1,
              elements: [
                { id: `el6-${id}`, subChapterId: `sub3-${id}`, name: "Création d'expérience", description: "Nouveau projet dans FACSDiva", facsUniversityLink: "https://facsuniversity.com/experience", order: 1 },
                { id: `el7-${id}`, subChapterId: `sub3-${id}`, name: "Configuration des paramètres", description: "Voltages et compensations", facsUniversityLink: null, order: 2 },
                { id: `el8-${id}`, subChapterId: `sub3-${id}`, name: "Création des portes", description: "Stratégie de gating", facsUniversityLink: "https://facsuniversity.com/gating", order: 3 },
              ],
            },
          ],
        },
        {
          id: `ch3-${id}`,
          instrumentId: id,
          name: "Arrêt de l'instrument",
          order: 3,
          subChapters: [
            {
              id: `sub4-${id}`,
              chapterId: `ch3-${id}`,
              name: "Procédure d'arrêt",
              order: 1,
              elements: [
                { id: `el9-${id}`, subChapterId: `sub4-${id}`, name: "Nettoyage fluidique", description: "Rinçage du système", facsUniversityLink: null, order: 1 },
                { id: `el10-${id}`, subChapterId: `sub4-${id}`, name: "Extinction du cytomètre", description: "Procédure d'arrêt", facsUniversityLink: null, order: 2 },
              ],
            },
          ],
        },
      ],
    };
  });

  const handleValidateElement = async (elementId: string) => {
    setValidatingElements((prev) => new Set(prev).add(elementId));
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    toast({
      title: "Élément validé",
      description: `Élément validé par ${currentUser?.name} le ${new Date().toLocaleDateString()}`,
    });
    
    setValidatingElements((prev) => {
      const next = new Set(prev);
      next.delete(elementId);
      return next;
    });
  };

  const handleSaveSession = () => {
    if (!sessionName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom de session",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Session sauvegardée",
      description: `La session "${sessionName}" a été sauvegardée`,
    });
    setSaveDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t.trainer.currentSession}
          </h1>
          <p className="text-muted-foreground">
            Validez les éléments de formation pour les stagiaires sélectionnés
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" data-testid="button-load-session">
            <FolderOpen className="h-4 w-4 mr-2" />
            {t.trainer.loadSession}
          </Button>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-save-session">
                <Save className="h-4 w-4 mr-2" />
                {t.trainer.saveSession}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.trainer.saveSession}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">Nom de la session</Label>
                  <Input
                    id="session-name"
                    placeholder="Ex: Formation FACS Canto - Groupe A"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    data-testid="input-session-name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button onClick={handleSaveSession} data-testid="button-confirm-save">
                  {t.common.save}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t.trainer.trainingLocation}</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger data-testid="select-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rungis">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t.trainer.rungis}
                    </div>
                  </SelectItem>
                  <SelectItem value="onsite">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t.trainer.onSite}
                    </div>
                  </SelectItem>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t.trainer.online}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stagiaires</Label>
              <TraineeSelector
                trainees={mockTrainees}
                selectedIds={selectedTraineeIds}
                onSelectionChange={setSelectedTraineeIds}
              />
            </div>

            <div className="space-y-2">
              <Label>Instruments</Label>
              <InstrumentSelector
                instruments={mockInstruments}
                selectedIds={selectedInstrumentIds}
                onSelectionChange={setSelectedInstrumentIds}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Éléments de formation</CardTitle>
          </CardHeader>
          <CardContent>
            <InstrumentTabs
              instruments={mockInstrumentsWithChapters}
              mode="trainer"
              onValidateElement={handleValidateElement}
              validatingElements={validatingElements}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
