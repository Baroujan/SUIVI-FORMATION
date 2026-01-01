import { useState } from "react";
import { Building2, Search, Users, TrendingUp, MoreHorizontal, Edit, Trash2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProgressBar } from "@/components/ProgressBar";
import { useApp } from "@/contexts/AppContext";

interface Laboratory {
  id: string;
  code: string;
  name: string;
  userCount: number;
  avgComfort: number;
  trainingFrequency: number;
  lastTraining: string;
}

export default function AdminLaboratories() {
  const { t } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const laboratories: Laboratory[] = [
    { id: "lab1", code: "LAB001", name: "CHU Lyon", userCount: 12, avgComfort: 4.1, trainingFrequency: 2.5, lastTraining: "2026-01-15" },
    { id: "lab2", code: "LAB002", name: "Institut Pasteur", userCount: 8, avgComfort: 3.2, trainingFrequency: 1.8, lastTraining: "2026-01-10" },
    { id: "lab3", code: "LAB003", name: "CNRS Marseille", userCount: 5, avgComfort: 2.8, trainingFrequency: 1.2, lastTraining: "2025-12-20" },
    { id: "lab4", code: "LAB004", name: "Hôpital Cochin", userCount: 15, avgComfort: 4.5, trainingFrequency: 3.0, lastTraining: "2026-01-12" },
    { id: "lab5", code: "LAB005", name: "Institut Curie", userCount: 10, avgComfort: 3.9, trainingFrequency: 2.2, lastTraining: "2026-01-08" },
  ];

  const filteredLabs = laboratories.filter(
    (lab) =>
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreVariant = (score: number): "success" | "default" | "danger" => {
    if (score >= 4) return "success";
    if (score >= 3) return "default";
    return "danger";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t.navigation.laboratories}
          </h1>
          <p className="text-muted-foreground">
            Consultez les scores et statistiques par laboratoire
          </p>
        </div>

        <Button>
          <Building2 className="h-4 w-4 mr-2" />
          Ajouter un laboratoire
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg">Liste des laboratoires</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-lab"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Laboratoire</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4" />
                    Utilisateurs
                  </div>
                </TableHead>
                <TableHead className="text-center">{t.admin.labScore}</TableHead>
                <TableHead className="text-center">{t.admin.trainingFrequency}</TableHead>
                <TableHead>Dernière formation</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLabs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun laboratoire trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredLabs.map((lab) => (
                  <TableRow key={lab.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{lab.name}</p>
                          <p className="text-xs text-muted-foreground">{lab.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{lab.userCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <ProgressBar
                          value={lab.avgComfort}
                          max={5}
                          className="w-20"
                          variant={getScoreVariant(lab.avgComfort)}
                        />
                        <span className="text-sm font-medium min-w-[2.5rem]">
                          {lab.avgComfort.toFixed(1)}/5
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{lab.trainingFrequency.toFixed(1)}/mois</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lab.lastTraining}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-lab-menu-${lab.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Générer un rapport
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
