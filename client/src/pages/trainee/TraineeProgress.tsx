import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, ExternalLink, Star, Check, RefreshCw } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Instrument, Chapter, SubChapter, TrainingElement, Validation, ComfortRating } from "@shared/schema";

interface TraineeProgressData {
  totalElements: number;
  validatedElements: number;
  ratedElements: number;
  validations: Validation[];
  comfortRatings: ComfortRating[];
}

export default function TraineeProgress() {
  const { t, currentUser } = useApp();
  const { toast } = useToast();
  const [activeInstrumentTab, setActiveInstrumentTab] = useState<string>("");

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

  const { data: progressData, isLoading: loadingProgress } = useQuery<TraineeProgressData>({
    queryKey: ['/api/trainee', currentUser?.id, 'progress'],
    enabled: !!currentUser?.id,
  });

  const validationsMap = useMemo(() => {
    const map = new Map<string, Validation>();
    progressData?.validations?.forEach(v => map.set(v.trainingElementId, v));
    return map;
  }, [progressData?.validations]);

  const ratingsMap = useMemo(() => {
    const map = new Map<string, ComfortRating>();
    progressData?.comfortRatings?.forEach(r => map.set(r.trainingElementId, r));
    return map;
  }, [progressData?.comfortRatings]);

  const rateMutation = useMutation({
    mutationFn: async ({ elementId, rating }: { elementId: string; rating: number }) => {
      const response = await apiRequest('POST', '/api/comfort-ratings', {
        traineeId: currentUser?.id,
        trainingElementId: elementId,
        rating,
        isRevision: ratingsMap.has(elementId),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trainee', currentUser?.id, 'progress'] });
      toast({
        title: "Note enregistrée",
        description: "Votre niveau d'aisance a été sauvegardé",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la note",
        variant: "destructive",
      });
    },
  });

  const instrumentsWithChapters = useMemo(() => {
    return instruments.map(instrument => {
      const instrumentChapters = chapters
        .filter(c => c.instrumentId === instrument.id)
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
                .filter(te => validationsMap.has(te.id))
                .sort((a, b) => a.order - b.order),
            }))
            .filter(sc => sc.elements.length > 0),
        }))
        .filter(ch => ch.subChapters.length > 0);

      return {
        ...instrument,
        chapters: instrumentChapters,
      };
    }).filter(i => i.chapters.length > 0);
  }, [instruments, chapters, subChapters, trainingElements, validationsMap]);

  const totalValidated = progressData?.validatedElements || 0;
  const totalRated = progressData?.ratedElements || 0;

  const avgComfort = useMemo(() => {
    if (!progressData?.comfortRatings?.length) return 0;
    const sum = progressData.comfortRatings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / progressData.comfortRatings.length).toFixed(1);
  }, [progressData?.comfortRatings]);

  if (loadingInstruments || loadingProgress) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderStarRating = (elementId: string) => {
    const currentRating = ratingsMap.get(elementId)?.rating || 0;
    const isRevision = ratingsMap.has(elementId);

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Button
            key={star}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => rateMutation.mutate({ elementId, rating: star })}
            disabled={rateMutation.isPending}
            data-testid={`button-rate-${elementId}-${star}`}
          >
            <Star
              className={`h-4 w-4 ${
                star <= currentRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        ))}
        {isRevision && (
          <Badge variant="outline" className="ml-2 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Révisé
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.trainee.myProgress}
        </h1>
        <p className="text-muted-foreground">
          Consultez vos éléments validés et notez votre niveau d'aisance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Éléments validés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-validated-count">
              {totalValidated}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Éléments notés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-rated-count">
              {totalRated} / {totalValidated}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moyenne d'aisance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2" data-testid="text-avg-comfort">
              {avgComfort}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {instrumentsWithChapters.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun élément validé pour le moment. Les éléments apparaîtront ici lorsque votre formateur les validera.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mes éléments de formation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeInstrumentTab || instrumentsWithChapters[0]?.id}
              onValueChange={setActiveInstrumentTab}
            >
              <TabsList className="mb-4 flex-wrap">
                {instrumentsWithChapters.map(instrument => (
                  <TabsTrigger
                    key={instrument.id}
                    value={instrument.id}
                    data-testid={`tab-instrument-${instrument.id}`}
                  >
                    {instrument.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {instrumentsWithChapters.map(instrument => (
                <TabsContent key={instrument.id} value={instrument.id}>
                  <ScrollArea className="h-[500px]">
                    <Accordion type="multiple" className="w-full">
                      {instrument.chapters.map(chapter => (
                        <AccordionItem key={chapter.id} value={chapter.id}>
                          <AccordionTrigger className="text-left">
                            <span className="font-medium">{chapter.name}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pl-4">
                              {chapter.subChapters.map(subChapter => (
                                <div key={subChapter.id} className="space-y-2">
                                  <h4 className="text-sm font-medium text-muted-foreground">
                                    {subChapter.name}
                                  </h4>
                                  <div className="space-y-2">
                                    {subChapter.elements.map(element => {
                                      const validation = validationsMap.get(element.id);
                                      return (
                                        <div
                                          key={element.id}
                                          className="flex flex-col gap-2 p-3 rounded-md bg-muted/30 border"
                                          data-testid={`element-card-${element.id}`}
                                        >
                                          <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-green-500 shrink-0" />
                                                <span className="font-medium text-sm">
                                                  {element.name}
                                                </span>
                                              </div>
                                              {element.description && (
                                                <p className="text-xs text-muted-foreground mt-1 ml-6">
                                                  {element.description}
                                                </p>
                                              )}
                                              {validation && (
                                                <p className="text-xs text-muted-foreground mt-1 ml-6">
                                                  Validé le {new Date(validation.validatedAt).toLocaleDateString('fr-FR')}
                                                  {validation.trainingLocation && ` - ${validation.trainingLocation}`}
                                                </p>
                                              )}
                                            </div>
                                            {element.facsUniversityLink && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                              >
                                                <a
                                                  href={element.facsUniversityLink}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  <ExternalLink className="h-4 w-4 mr-1" />
                                                  FACSUniversity
                                                </a>
                                              </Button>
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between gap-4 ml-6">
                                            <span className="text-xs text-muted-foreground">
                                              Notez votre aisance :
                                            </span>
                                            {renderStarRating(element.id)}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
