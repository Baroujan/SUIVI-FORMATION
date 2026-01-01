import { useState } from "react";
import { Calendar, Users, MoreHorizontal, Play, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Link } from "wouter";

interface Session {
  id: string;
  name: string;
  location: string;
  trainees: string[];
  instruments: string[];
  createdAt: string;
  updatedAt: string;
  progress: number;
}

export default function TrainerSessions() {
  const { t } = useApp();

  const [sessions] = useState<Session[]>([
    {
      id: "s1",
      name: "Formation FACS Canto II - Groupe A",
      location: "Rungis",
      trainees: ["Jean Dupont", "Marie Martin", "Pierre Bernard"],
      instruments: ["FACS Canto II"],
      createdAt: "2026-01-15",
      updatedAt: "2026-01-15",
      progress: 75,
    },
    {
      id: "s2",
      name: "Formation LSR Fortessa - Avancé",
      location: "En ligne",
      trainees: ["Sophie Petit", "Lucas Robert"],
      instruments: ["LSR Fortessa", "FACS Aria III"],
      createdAt: "2026-01-10",
      updatedAt: "2026-01-12",
      progress: 100,
    },
    {
      id: "s3",
      name: "Initiation FACS Aria",
      location: "Sur site",
      trainees: ["Jean Dupont", "Marie Martin", "Pierre Bernard", "Sophie Petit", "Lucas Robert"],
      instruments: ["FACS Aria III"],
      createdAt: "2026-01-08",
      updatedAt: "2026-01-08",
      progress: 45,
    },
  ]);

  const getLocationBadge = (location: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      "Rungis": "default",
      "Sur site": "secondary",
      "En ligne": "outline",
    };
    return variants[location] || "secondary";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t.navigation.sessions}
          </h1>
          <p className="text-muted-foreground">
            Gérez vos sessions de formation sauvegardées
          </p>
        </div>

        <Button asChild>
          <Link href="/trainer/session">
            <Calendar className="h-4 w-4 mr-2" />
            Nouvelle session
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sessions sauvegardées</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Stagiaires</TableHead>
                <TableHead>Instruments</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Dernière modification</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.name}</TableCell>
                  <TableCell>
                    <Badge variant={getLocationBadge(session.location)}>
                      {session.location}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{session.trainees.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {session.instruments.map((inst) => (
                        <Badge key={inst} variant="outline" className="text-xs">
                          {inst}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={session.progress}
                        className="w-20"
                        variant={session.progress === 100 ? "success" : "default"}
                      />
                      <span className="text-sm text-muted-foreground">
                        {session.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {session.updatedAt}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-session-menu-${session.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Reprendre
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
