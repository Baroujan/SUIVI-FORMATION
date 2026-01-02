import {
  Building2,
  Users,
  AlertTriangle,
  TrendingUp,
  Mail,
  Loader2,
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
import { useQuery } from "@tanstack/react-query";

interface AdminMetrics {
  labCount: number;
  traineeCount: number;
  alertCount: number;
  globalAvgComfort: number;
  alertThreshold: number;
  alertTrainees: Array<{
    id: string;
    name: string;
    lab: string;
    avgComfort: number;
    lastTraining: string | null;
  }>;
  laboratories: Array<{
    id: string;
    code: string;
    name: string;
    userCount: number;
    avgComfort: number;
    trainingCount: number;
  }>;
}

export default function AdminDashboard() {
  const { t } = useApp();
  const { toast } = useToast();

  const { data: metrics, isLoading } = useQuery<AdminMetrics>({
    queryKey: ['/api/admin/metrics'],
  });

  const handleSendAlert = (traineeId: string, traineeName: string) => {
    toast({
      title: "Alerte envoyée",
      description: `Email envoyé au support BDB France Scientific concernant ${traineeName}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const alertTrainees = metrics?.alertTrainees || [];
  const laboratories = metrics?.laboratories || [];

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
          value={metrics?.labCount?.toString() || "0"}
          subtitle="actifs"
          icon={Building2}
        />
        <MetricCard
          title="Stagiaires"
          value={metrics?.traineeCount?.toString() || "0"}
          subtitle="enregistrés"
          icon={Users}
        />
        <MetricCard
          title="Alertes actives"
          value={metrics?.alertCount?.toString() || "0"}
          subtitle={`Seuil: ${metrics?.alertThreshold || 2.5}/5`}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Moyenne globale"
          value={metrics?.globalAvgComfort?.toString() || "0"}
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
                Aucune alerte active - tous les stagiaires sont au-dessus du seuil
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
                        {trainee.lastTraining && (
                          <span>Dernière formation: {trainee.lastTraining}</span>
                        )}
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
            {laboratories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucun laboratoire enregistré
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Laboratoire</TableHead>
                    <TableHead className="text-right">Utilisateurs</TableHead>
                    <TableHead className="text-right">Moyenne</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {laboratories.slice(0, 5).map((lab) => (
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
                                : lab.avgComfort >= 2.5
                                  ? "warning"
                                  : "danger"
                            }
                          />
                          <span className="text-sm font-medium w-8">
                            {lab.avgComfort}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
