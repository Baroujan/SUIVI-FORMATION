import { FlaskConical, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ProgressBar";
import { ComfortRating } from "@/components/ComfortRating";
import { useApp } from "@/contexts/AppContext";
import { Link } from "wouter";

interface InstrumentProgress {
  id: string;
  name: string;
  description: string;
  validated: number;
  total: number;
  avgComfort: number;
  lastTraining: string;
}

export default function TraineeInstruments() {
  const { t } = useApp();

  const instruments: InstrumentProgress[] = [
    {
      id: "i1",
      name: "FACS Canto II",
      description: "Cytomètre analyseur 8 couleurs",
      validated: 8,
      total: 10,
      avgComfort: 4.2,
      lastTraining: "2026-01-15",
    },
    {
      id: "i2",
      name: "LSR Fortessa",
      description: "Cytomètre analyseur 18 couleurs",
      validated: 3,
      total: 12,
      avgComfort: 3.5,
      lastTraining: "2026-01-10",
    },
    {
      id: "i3",
      name: "FACS Aria III",
      description: "Trieur cellulaire 4 voies",
      validated: 0,
      total: 15,
      avgComfort: 0,
      lastTraining: "-",
    },
    {
      id: "i4",
      name: "FACS Melody",
      description: "Trieur cellulaire compact",
      validated: 0,
      total: 8,
      avgComfort: 0,
      lastTraining: "-",
    },
  ];

  const getProgressVariant = (validated: number, total: number) => {
    const percentage = (validated / total) * 100;
    if (percentage === 100) return "success";
    if (percentage > 0) return "default";
    return "warning";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.navigation.instruments}
        </h1>
        <p className="text-muted-foreground">
          Consultez votre progression par instrument
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instruments.map((instrument) => {
          const progressPercent = Math.round(
            (instrument.validated / instrument.total) * 100
          );
          const isComplete = instrument.validated === instrument.total;
          const hasStarted = instrument.validated > 0;

          return (
            <Card key={instrument.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{instrument.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {instrument.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <Badge
                      variant={isComplete ? "default" : hasStarted ? "secondary" : "outline"}
                    >
                      {instrument.validated}/{instrument.total}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={instrument.validated}
                    max={instrument.total}
                    variant={getProgressVariant(instrument.validated, instrument.total)}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {progressPercent}% complété
                  </p>
                </div>

                {hasStarted && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t.trainee.averageComfort}
                      </span>
                      <span className="text-sm font-medium">
                        {instrument.avgComfort.toFixed(1)}/5
                      </span>
                    </div>
                    <ComfortRating
                      value={Math.round(instrument.avgComfort)}
                      readonly
                      size="sm"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Dernière formation</span>
                  <span>{instrument.lastTraining}</span>
                </div>

                <Button
                  variant={hasStarted ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link href="/trainee/progress">
                    {hasStarted ? "Voir les détails" : "Pas encore commencé"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
