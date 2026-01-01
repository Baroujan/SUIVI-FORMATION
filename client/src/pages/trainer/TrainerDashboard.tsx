import { Users, ClipboardCheck, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { ProgressBar } from "@/components/ProgressBar";
import { ModificationHistory } from "@/components/ModificationHistory";
import { useApp } from "@/contexts/AppContext";
import { Link } from "wouter";

export default function TrainerDashboard() {
  const { t, currentUser } = useApp();

  const recentSessions = [
    { id: "1", name: "Session FACS Canto II - Groupe A", date: "2026-01-15", traineesCount: 5, progress: 75 },
    { id: "2", name: "Session LSR Fortessa - Groupe B", date: "2026-01-10", traineesCount: 3, progress: 100 },
    { id: "3", name: "Session FACS Aria - Initiation", date: "2026-01-08", traineesCount: 8, progress: 45 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.navigation.dashboard}
        </h1>
        <p className="text-muted-foreground">
          Bienvenue, {currentUser?.name}. Gérez vos sessions de formation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Sessions actives"
          value="3"
          subtitle="Cette semaine"
          icon={Calendar}
        />
        <MetricCard
          title="Stagiaires formés"
          value="16"
          subtitle="Ce mois"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Éléments validés"
          value="142"
          subtitle="Total"
          icon={ClipboardCheck}
        />
        <MetricCard
          title="Taux de progression"
          value="78%"
          subtitle="Moyenne"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-lg">Sessions récentes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/trainer/sessions">{t.common.add}</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{session.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{session.date}</span>
                    <span>{session.traineesCount} stagiaires</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressBar
                    value={session.progress}
                    max={100}
                    className="w-20"
                    variant={session.progress === 100 ? "success" : "default"}
                  />
                  <span className="text-sm font-medium min-w-[3rem] text-right">
                    {session.progress}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/trainer/session">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Nouvelle session de formation
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/trainer/sessions">
                <Calendar className="h-4 w-4 mr-2" />
                Voir toutes les sessions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ModificationHistory showAll maxHeight="300px" />
    </div>
  );
}
