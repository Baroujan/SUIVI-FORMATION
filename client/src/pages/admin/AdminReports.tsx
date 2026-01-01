import { useState } from "react";
import { FileText, Download, Send, Calendar, User, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminReports() {
  const { t } = useApp();
  const { toast } = useToast();

  const [reportType, setReportType] = useState<"individual" | "laboratory">("individual");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLab, setSelectedLab] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const users = [
    { id: "u1", name: "Jean Dupont", lab: "LAB001" },
    { id: "u2", name: "Marie Martin", lab: "LAB001" },
    { id: "u3", name: "Pierre Bernard", lab: "LAB002" },
    { id: "u4", name: "Sophie Petit", lab: "LAB002" },
  ];

  const laboratories = [
    { id: "lab1", code: "LAB001", name: "CHU Lyon" },
    { id: "lab2", code: "LAB002", name: "Institut Pasteur" },
    { id: "lab3", code: "LAB003", name: "CNRS Marseille" },
  ];

  const recentReports = [
    { id: "r1", type: "Individuel", target: "Jean Dupont", date: "2026-01-15", format: "PDF" },
    { id: "r2", type: "Laboratoire", target: "CHU Lyon", date: "2026-01-14", format: "Excel" },
    { id: "r3", type: "Individuel", target: "Marie Martin", date: "2026-01-12", format: "PDF" },
  ];

  const handleGenerateReport = () => {
    const target = reportType === "individual" 
      ? users.find(u => u.id === selectedUser)?.name 
      : laboratories.find(l => l.id === selectedLab)?.name;

    if (!target) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une cible pour le rapport",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Rapport généré",
      description: `Le rapport pour ${target} a été généré avec succès`,
    });
  };

  const handleSendReport = () => {
    toast({
      title: "Rapport envoyé",
      description: "Le rapport a été envoyé par email",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.navigation.reports}
        </h1>
        <p className="text-muted-foreground">
          Générez et exportez des rapports de formation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{t.admin.generateReport}</CardTitle>
            <CardDescription>
              Créez un rapport personnalisé pour un stagiaire ou un laboratoire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={reportType} onValueChange={(v) => setReportType(v as "individual" | "laboratory")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="individual" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t.admin.individualReport}
                </TabsTrigger>
                <TabsTrigger value="laboratory" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {t.admin.labReport}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Sélectionner un stagiaire</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger data-testid="select-user">
                      <SelectValue placeholder="Choisir un stagiaire..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.lab})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="laboratory" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Sélectionner un laboratoire</Label>
                  <Select value={selectedLab} onValueChange={setSelectedLab}>
                    <SelectTrigger data-testid="select-lab">
                      <SelectValue placeholder="Choisir un laboratoire..." />
                    </SelectTrigger>
                    <SelectContent>
                      {laboratories.map((lab) => (
                        <SelectItem key={lab.id} value={lab.id}>
                          {lab.name} ({lab.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date-from">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date de début
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  data-testid="input-date-from"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date de fin
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  data-testid="input-date-to"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={handleGenerateReport} data-testid="button-generate-report">
                <FileText className="h-4 w-4 mr-2" />
                Générer le rapport
              </Button>
              <Button variant="outline" data-testid="button-download-report">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="outline" onClick={handleSendReport} data-testid="button-send-report">
                <Send className="h-4 w-4 mr-2" />
                Envoyer par email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rapports récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{report.target}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {report.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {report.date}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
