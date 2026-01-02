import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Save, FolderOpen, MapPin, Loader2, Check, ExternalLink, QrCode } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueries } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Instrument, Chapter, SubChapter, TrainingElement, Validation } from "@shared/schema";

interface ChapterWithContent extends Chapter {
  subChapters: (SubChapter & { elements: TrainingElement[] })[];
}

interface InstrumentWithChapters extends Instrument {
  chapters: ChapterWithContent[];
}

export default function TrainerSession() {
  const { t, currentUser } = useApp();
  const { toast } = useToast();

  const [sessionName, setSessionName] = useState("");
  const [location, setLocation] = useState<string>("rungis");
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>([]);
  const [selectedInstrumentIds, setSelectedInstrumentIds] = useState<string[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [activeInstrumentTab, setActiveInstrumentTab] = useState<string>("");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [traineeIdInput, setTraineeIdInput] = useState("");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrScannerRef = useRef<HTMLDivElement>(null);

  const { data: trainees = [], isLoading: loadingTrainees } = useQuery<User[]>({
    queryKey: ['/api/users?role=trainee'],
  });

  const { data: instruments = [], isLoading: loadingInstruments } = useQuery<Instrument[]>({
    queryKey: ['/api/instruments'],
  });

  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters'],
  });

  const { data: subChapters = [] } = useQuery<SubChapter[]>({
    queryKey: ['/api/sub-chapters'],
  });

  const { data: trainingElements = [] } = useQuery<TrainingElement[]>({
    queryKey: ['/api/training-elements'],
  });

  const { data: savedSessions = [] } = useQuery<any[]>({
    queryKey: [`/api/training-sessions?trainerId=${currentUser?.id}`],
    enabled: !!currentUser?.id,
  });

  const validationQueries = useQueries({
    queries: selectedTraineeIds.map(traineeId => ({
      queryKey: [`/api/validations?traineeId=${traineeId}`],
      enabled: selectedTraineeIds.length > 0,
    })),
  });

  const validatedElements = useMemo(() => {
    const result = new Map<string, Map<string, Validation>>();
    selectedTraineeIds.forEach((traineeId, index) => {
      const queryResult = validationQueries[index];
      if (queryResult?.data) {
        const traineeMap = new Map<string, Validation>();
        (queryResult.data as Validation[]).forEach(v => traineeMap.set(v.trainingElementId, v));
        result.set(traineeId, traineeMap);
      }
    });
    return result;
  }, [selectedTraineeIds, validationQueries]);

  const instrumentsWithChapters: InstrumentWithChapters[] = selectedInstrumentIds.map(instrumentId => {
    const instrument = instruments.find(i => i.id === instrumentId);
    if (!instrument) return null;

    const instrumentChapters = chapters
      .filter(c => c.instrumentId === instrumentId)
      .sort((a, b) => a.order - b.order)
      .map(chapter => ({
        ...chapter,
        subChapters: subChapters
          .filter(sc => sc.chapterId === chapter.id)
          .sort((a, b) => a.order - b.order)
          .map(subChapter => ({
            ...subChapter,
            elements: trainingElements
              .filter(te => te.subChapterId === subChapter.id)
              .sort((a, b) => a.order - b.order),
          })),
      }));

    return {
      ...instrument,
      chapters: instrumentChapters,
    };
  }).filter(Boolean) as InstrumentWithChapters[];

  useEffect(() => {
    if (instrumentsWithChapters.length > 0 && !activeInstrumentTab) {
      setActiveInstrumentTab(instrumentsWithChapters[0].id);
    }
  }, [instrumentsWithChapters, activeInstrumentTab]);

  const validateMutation = useMutation({
    mutationFn: async ({ traineeId, elementId }: { traineeId: string; elementId: string }) => {
      const response = await apiRequest('POST', '/api/validations', {
        traineeId,
        trainingElementId: elementId,
        trainerId: currentUser?.id,
        trainingLocation: location,
      });
      return response.json();
    },
    onSuccess: (_validation, { traineeId }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/validations?traineeId=${traineeId}`] });
      toast({
        title: "Element validé",
        description: `Validé par ${currentUser?.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de valider l'élément",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/training-sessions', {
        trainerId: currentUser?.id,
        traineeIds: selectedTraineeIds,
        name: sessionName,
        instrumentIds: selectedInstrumentIds,
        location,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session sauvegardée",
        description: `La session "${sessionName}" a été sauvegardée`,
      });
      setSaveDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/training-sessions?trainerId=${currentUser?.id}`] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la session",
        variant: "destructive",
      });
    },
  });

  const handleValidateElement = (elementId: string) => {
    selectedTraineeIds.forEach(traineeId => {
      const traineeValidations = validatedElements.get(traineeId);
      if (!traineeValidations?.has(elementId)) {
        validateMutation.mutate({ traineeId, elementId });
      }
    });
  };

  const isElementValidated = (elementId: string): boolean => {
    if (selectedTraineeIds.length === 0) return false;
    return selectedTraineeIds.every(traineeId => {
      const traineeValidations = validatedElements.get(traineeId);
      return traineeValidations?.has(elementId);
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
    saveMutation.mutate();
  };

  const handleLoadSession = (session: any) => {
    setSessionName(session.name);
    setSelectedTraineeIds(session.traineeIds || []);
    setSelectedInstrumentIds(session.instrumentIds || []);
    setLocation(session.location || 'rungis');
    setLoadDialogOpen(false);
    toast({
      title: "Session chargée",
      description: `La session "${session.name}" a été chargée`,
    });
  };

  const handleTraineeToggle = (traineeId: string) => {
    setSelectedTraineeIds(prev =>
      prev.includes(traineeId)
        ? prev.filter(id => id !== traineeId)
        : [...prev, traineeId]
    );
  };

  const handleInstrumentToggle = (instrumentId: string) => {
    setSelectedInstrumentIds(prev => {
      const newIds = prev.includes(instrumentId)
        ? prev.filter(id => id !== instrumentId)
        : [...prev, instrumentId];
      
      if (newIds.length > 0 && !newIds.includes(activeInstrumentTab)) {
        setActiveInstrumentTab(newIds[0]);
      }
      return newIds;
    });
  };

  const stopQrScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.log('Scanner already stopped');
      }
      html5QrCodeRef.current = null;
    }
  }, []);

  const addTraineeById = useCallback((traineeId: string, fromScanner = false) => {
    const trainee = trainees.find(t => t.id === traineeId || t.username === traineeId);
    if (trainee) {
      if (!selectedTraineeIds.includes(trainee.id)) {
        setSelectedTraineeIds(prev => [...prev, trainee.id]);
        toast({
          title: "Stagiaire ajouté",
          description: trainee.name,
        });
        if (fromScanner) {
          stopQrScanner();
        }
      }
      return true;
    } else {
      toast({
        title: "Stagiaire non trouvé",
        description: `Aucun stagiaire avec l'ID "${traineeId}"`,
        variant: "destructive",
      });
      return false;
    }
  }, [trainees, selectedTraineeIds, toast, stopQrScanner]);

  const handleAddTraineeManually = () => {
    if (traineeIdInput.trim()) {
      if (addTraineeById(traineeIdInput.trim())) {
        setTraineeIdInput("");
      }
    }
  };

  const startQrScanner = useCallback(async () => {
    if (!qrScannerRef.current) return;
    
    await stopQrScanner();
    
    const scanner = new Html5Qrcode("qr-scanner-container");
    html5QrCodeRef.current = scanner;
    
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          addTraineeById(decodedText, true);
        },
        () => {}
      );
    } catch (err) {
      console.error("Erreur démarrage caméra:", err);
      toast({
        title: "Erreur caméra",
        description: "Impossible d'accéder à la caméra. Vous pouvez entrer l'ID manuellement.",
        variant: "destructive",
      });
    }
  }, [addTraineeById, stopQrScanner, toast]);

  useEffect(() => {
    if (qrDialogOpen) {
      const timer = setTimeout(() => {
        startQrScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopQrScanner();
      };
    }
    return () => {
      stopQrScanner();
    };
  }, [qrDialogOpen, startQrScanner, stopQrScanner]);

  if (loadingTrainees || loadingInstruments) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-card border-b px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">
                {t.trainer.currentSession}
              </h1>
              {selectedTraineeIds.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedTraineeIds.length} stagiaire{selectedTraineeIds.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Validez les éléments de formation pour les stagiaires sélectionnés
            </p>
          </div>

          <div className="flex items-center gap-2">
          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-load-session">
                <FolderOpen className="h-4 w-4 mr-2" />
                {t.trainer.loadSession}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Charger une session</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2 py-4">
                  {savedSessions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune session sauvegardée
                    </p>
                  ) : (
                    savedSessions.map((session: any) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover-elevate cursor-pointer"
                        onClick={() => handleLoadSession(session)}
                      >
                        <div>
                          <p className="font-medium">{session.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.traineeIds?.length || 0} stagiaires
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          Charger
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

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
                <Button 
                  onClick={handleSaveSession} 
                  disabled={saveMutation.isPending}
                  data-testid="button-confirm-save"
                >
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t.common.save}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>

      <div className="flex-1 overflow-auto p-6">
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
              <div className="flex items-center justify-between gap-2">
                <Label>Stagiaires ({selectedTraineeIds.length} sélectionnés)</Label>
                <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-qr-scanner">
                      <QrCode className="h-4 w-4 mr-1" />
                      Scanner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ajouter un stagiaire</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div 
                        id="qr-scanner-container" 
                        ref={qrScannerRef}
                        className="w-full aspect-square bg-muted rounded-md overflow-hidden"
                      />
                      <div className="text-center text-sm text-muted-foreground">
                        Scannez le QR code du badge stagiaire
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            ou entrez l'ID manuellement
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="ID ou nom d'utilisateur"
                          value={traineeIdInput}
                          onChange={(e) => setTraineeIdInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTraineeManually()}
                          data-testid="input-trainee-id"
                        />
                        <Button onClick={handleAddTraineeManually} data-testid="button-add-trainee">
                          Ajouter
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setQrDialogOpen(false)}>
                        Fermer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <ScrollArea className="h-[150px] border rounded-md p-2">
                <div className="space-y-2">
                  {trainees.map((trainee) => (
                    <div
                      key={trainee.id}
                      className="flex items-center gap-2 p-2 rounded-md hover-elevate"
                    >
                      <Checkbox
                        id={`trainee-${trainee.id}`}
                        checked={selectedTraineeIds.includes(trainee.id)}
                        onCheckedChange={() => handleTraineeToggle(trainee.id)}
                        data-testid={`checkbox-trainee-${trainee.id}`}
                      />
                      <label
                        htmlFor={`trainee-${trainee.id}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        {trainee.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({trainee.username})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label>Instruments ({selectedInstrumentIds.length} sélectionnés)</Label>
              <ScrollArea className="h-[150px] border rounded-md p-2">
                <div className="space-y-2">
                  {instruments.map((instrument) => (
                    <div
                      key={instrument.id}
                      className="flex items-center gap-2 p-2 rounded-md hover-elevate"
                    >
                      <Checkbox
                        id={`instrument-${instrument.id}`}
                        checked={selectedInstrumentIds.includes(instrument.id)}
                        onCheckedChange={() => handleInstrumentToggle(instrument.id)}
                        data-testid={`checkbox-instrument-${instrument.id}`}
                      />
                      <label
                        htmlFor={`instrument-${instrument.id}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        {instrument.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Éléments de formation</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInstrumentIds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Sélectionnez au moins un instrument pour voir les éléments de formation
              </div>
            ) : selectedTraineeIds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Sélectionnez au moins un stagiaire pour valider les éléments
              </div>
            ) : (
              <Tabs value={activeInstrumentTab} onValueChange={setActiveInstrumentTab}>
                <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
                  {instrumentsWithChapters.map((instrument) => (
                    <TabsTrigger key={instrument.id} value={instrument.id}>
                      {instrument.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {instrumentsWithChapters.map((instrument) => (
                  <TabsContent key={instrument.id} value={instrument.id}>
                    <ScrollArea className="h-[500px]">
                      <Accordion type="multiple" className="space-y-2">
                        {instrument.chapters.map((chapter) => (
                          <AccordionItem key={chapter.id} value={chapter.id} className="border rounded-md px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <span className="font-medium">{chapter.name}</span>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              {chapter.subChapters.map((subChapter) => (
                                <div key={subChapter.id} className="space-y-2">
                                  <h4 className="text-sm font-medium text-muted-foreground">
                                    {subChapter.name}
                                  </h4>
                                  <div className="space-y-2 pl-4">
                                    {subChapter.elements.map((element) => {
                                      const isValidated = isElementValidated(element.id);
                                      return (
                                        <div
                                          key={element.id}
                                          className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <p className="font-medium text-sm">{element.name}</p>
                                              {isValidated && (
                                                <Badge variant="secondary" className="text-xs">
                                                  <Check className="h-3 w-3 mr-1" />
                                                  Validé
                                                </Badge>
                                              )}
                                            </div>
                                            {element.description && (
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {element.description}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {element.facsUniversityLink && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                              >
                                                <a
                                                  href={element.facsUniversityLink}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  <ExternalLink className="h-4 w-4" />
                                                </a>
                                              </Button>
                                            )}
                                            <Button
                                              size="sm"
                                              variant={isValidated ? "secondary" : "default"}
                                              onClick={() => handleValidateElement(element.id)}
                                              disabled={isValidated || validateMutation.isPending}
                                              data-testid={`button-validate-${element.id}`}
                                            >
                                              {validateMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : isValidated ? (
                                                <>
                                                  <Check className="h-4 w-4 mr-1" />
                                                  Validé
                                                </>
                                              ) : (
                                                "Valider"
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
}
