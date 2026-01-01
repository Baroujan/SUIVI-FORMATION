import { useState } from "react";
import {
  Building2,
  Users,
  AlertTriangle,
  TrendingUp,
  Mail,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetricCard } from "@/components/MetricCard";
import { ProgressBar } from "@/components/ProgressBar";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { t } = useApp();
  const { toast } = useToast();

  const alertThreshold = 2.5;

  const alertTrainees = [
    { id: "t1", name: "Pierre Bernard", lab: "LAB002", avgComfort: 2.1, lastTraining: "2025-12-20" },
    { id: "t2", name: "Lucas Robert", lab: "LAB003", avgComfort: 1.8, lastTraining: "2025-12-15" },
  ];

  const laboratories = [
    { id: "lab1", code: "LAB001", name: "CHU Lyon", userCount: 12, avgComfort: 4.1, trainingFreq: 2.5 },
    { id: "lab2", code: "LAB002", name: "Institut Pasteur", userCount: 8, avgComfort: 3.2, trainingFreq: 1.8 },
    { id: "lab3", code: "LAB003", name: "CNRS Marseille", userCount: 5, avgComfort: 2.8, trainingFreq: 1.2 },
  ];

  const handleSendAlert = (traineeId: string, traineeName: string) => {
    toast({
      title: "Alerte envoyée",
      description: `Email envoyé au support BDB France Scientific concernant ${traineeName}`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.admin.globalMetrics}
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble des formations et alertes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Laboratoires"
          value="25"
          subtitle="actifs"
          icon={Building2}
        />
        <MetricCard
          title="Stagiaires"
          value="156"
          subtitle="formés"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Alertes actives"
          value={alertTrainees.length.toString()}
          subtitle={`Seuil: ${alertThreshold}/5`}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Moyenne globale"
          value="3.8"
          subtitle="d'aisance"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t.admin.belowThreshold}
            </CardTitle>
            <Badge variant="destructive">
              {alertTrainees.length} alerte(s)
            </Badge>
          </CardHeader>
          <CardContent>
            {alertTrainees.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucune alerte active
              </p>
            ) : (
              <div className="space-y-3">
                {alertTrainees.map((trainee) => (
                  <div
                    key={trainee.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-md bg-destructive/5 border border-destructive/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{trainee.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <Badge variant="outline">{trainee.lab}</Badge>
                        <span>
                          Moyenne: <strong className="text-destructive">{trainee.avgComfort}/5</strong>
                        </span>
                        <span>Dernière formation: {trainee.lastTraining}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleSendAlert(trainee.id, trainee.name)}
                      data-testid={`button-send-alert-${trainee.id}`}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      {t.admin.sendAlert}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-lg">Scores laboratoires</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/laboratories">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Laboratoire</TableHead>
                  <TableHead className="text-right">Utilisateurs</TableHead>
                  <TableHead className="text-right">Moyenne</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laboratories.map((lab) => (
                  <TableRow key={lab.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{lab.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {lab.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{lab.userCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ProgressBar
                          value={lab.avgComfort}
                          max={5}
                          className="w-16"
                          variant={
                            lab.avgComfort >= 4
                              ? "success"
                              : lab.avgComfort >= 3
                              ? "default"
                              : "danger"
                          }
                        />
                        <span className="text-sm font-medium min-w-[2.5rem]">
                          {lab.avgComfort.toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto p-4 justify-start" asChild>
            <Link href="/admin/reports">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{t.admin.individualReport}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Générer un rapport par stagiaire
                </span>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto p-4 justify-start" asChild>
            <Link href="/admin/reports">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{t.admin.labReport}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Générer un rapport par laboratoire
                </span>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto p-4 justify-start" asChild>
            <Link href="/admin/users">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Gérer les utilisateurs</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Ajouter, modifier ou supprimer
                </span>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto p-4 justify-start" asChild>
            <Link href="/admin/instruments">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Gérer le contenu</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Instruments, chapitres, éléments
                </span>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
