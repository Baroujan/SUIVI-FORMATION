import { CheckCircle2, Star, TrendingUp, FlaskConical, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/MetricCard";
import { ProgressBar } from "@/components/ProgressBar";
import { ComfortRating } from "@/components/ComfortRating";
import { ModificationHistory } from "@/components/ModificationHistory";
import { useApp } from "@/contexts/AppContext";
import { Link } from "wouter";

export default function TraineeDashboard() {
  const { t, currentUser } = useApp();

  const recentValidations = [
    { id: "1", element: "Allumage du cytomètre", instrument: "FACS Canto II", date: "2026-01-15", trainer: "Dr. Martin" },
    { id: "2", element: "Vérification des fluides", instrument: "FACS Canto II", date: "2026-01-15", trainer: "Dr. Martin" },
    { id: "3", element: "CST quotidien", instrument: "FACS Canto II", date: "2026-01-14", trainer: "Dr. Martin" },
  ];

  const instrumentProgress = [
    { id: "i1", name: "FACS Canto II", validated: 8, total: 10, avgComfort: 4.2 },
    { id: "i2", name: "LSR Fortessa", validated: 3, total: 12, avgComfort: 3.5 },
    { id: "i3", name: "FACS Aria III", validated: 0, total: 15, avgComfort: 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.trainee.myProgress}
        </h1>
        <p className="text-muted-foreground">
          Bienvenue, {currentUser?.name}. Suivez votre progression de formation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t.trainee.validatedElements}
          value="11"
          subtitle="sur 37 éléments"
          icon={CheckCircle2}
        />
        <MetricCard
          title={t.trainee.averageComfort}
          value="3.9"
          subtitle="sur 5"
          icon={Star}
        />
        <MetricCard
          title="Instruments"
          value="3"
          subtitle="en cours de formation"
          icon={FlaskConical}
        />
        <MetricCard
          title="Progression globale"
          value="30%"
          subtitle="Objectif: 100%"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-lg">Progression par instrument</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/trainee/instruments">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {instrumentProgress.map((instrument) => (
              <div
                key={instrument.id}
                className="p-4 rounded-md bg-muted/50 space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    <span className="font-medium">{instrument.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {instrument.validated}/{instrument.total}
                  </Badge>
                </div>
                <ProgressBar
                  value={instrument.validated}
                  max={instrument.total}
                  showLabel
                  variant={
                    instrument.validated === instrument.total
                      ? "success"
                      : instrument.validated > 0
                      ? "default"
                      : "warning"
                  }
                />
                {instrument.avgComfort > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {t.trainee.averageComfort}:
                    </span>
                    <ComfortRating value={Math.round(instrument.avgComfort)} readonly size="sm" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dernières validations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentValidations.map((validation) => (
              <div
                key={validation.id}
                className="flex items-start justify-between gap-4 p-3 rounded-md bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CheckCircle2 className="h-4 w-4 text-chart-3 flex-shrink-0" />
                    <span className="font-medium text-sm">{validation.element}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {validation.instrument}
                    </Badge>
                    <span>{validation.date}</span>
                    <span>par {validation.trainer}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ressources FACSUniversity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="https://facsuniversity.com" target="_blank" rel="noopener noreferrer">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">eLearning</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Cours en ligne interactifs
                  </span>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="https://facsuniversity.com/tutoflow" target="_blank" rel="noopener noreferrer">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">TutoFlow</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Tutoriels pas à pas
                  </span>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="https://facsuniversity.com/videos" target="_blank" rel="noopener noreferrer">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">Vidéos</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Démonstrations pratiques
                  </span>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ModificationHistory showAll maxHeight="300px" />
    </div>
  );
}
