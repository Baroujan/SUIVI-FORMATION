import { useState } from "react";
import { useLocation } from "wouter";
import { GraduationCap, ClipboardCheck, Shield, BookOpen, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { t, setCurrentUser } = useApp();
  const [username, setUsername] = useState("");
  const [labCode, setLabCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username.trim()) {
      setError(t.login.userNotFound);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username: username.trim().toLowerCase(),
        labCode: labCode.trim().toUpperCase() || undefined,
      });

      const user = await response.json();
      setCurrentUser(user);

      if (user.role === "trainer") {
        setLocation("/trainer");
      } else if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/trainee");
      }
    } catch (err) {
      setError(t.login.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoRoleSelect = (role: "trainer" | "trainee" | "admin") => {
    const demoUsers: Record<string, string> = {
      trainer: "trainer",
      trainee: "jean.dupont",
      admin: "admin",
    };
    setUsername(demoUsers[role]);
    if (role === "trainee") {
      setLabCode("LAB001");
    } else {
      setLabCode("");
    }
  };

  const roles = [
    {
      id: "trainer" as const,
      label: t.roles.trainer,
      description: "Gérer les sessions de formation et valider les éléments",
      icon: ClipboardCheck,
      color: "bg-chart-1/10 text-chart-1",
    },
    {
      id: "trainee" as const,
      label: t.roles.trainee,
      description: "Suivre votre progression et évaluer votre aisance",
      icon: GraduationCap,
      color: "bg-chart-3/10 text-chart-3",
    },
    {
      id: "admin" as const,
      label: t.roles.admin,
      description: "Gérer les utilisateurs, laboratoires et rapports",
      icon: Shield,
      color: "bg-chart-4/10 text-chart-4",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Training Tracker</span>
            <span className="text-xs text-muted-foreground">BDB France Scientific</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
            <a href="https://facsuniversity.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              FACSUniversity
            </a>
          </Button>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {t.login.welcome}
            </h1>
            <p className="text-muted-foreground">
              {t.login.subtitle}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.login.connect}</CardTitle>
              <CardDescription>
                {t.login.facsUniversityLink}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t.login.userId}</Label>
                <Input
                  id="username"
                  placeholder={t.login.userIdPlaceholder}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  data-testid="input-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="labCode">{t.login.labCode}</Label>
                <Input
                  id="labCode"
                  placeholder={t.login.labCodePlaceholder}
                  value={labCode}
                  onChange={(e) => {
                    setLabCode(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  data-testid="input-labcode"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" data-testid="text-error">
                  {error}
                </p>
              )}

              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.login.connecting}
                  </>
                ) : (
                  t.login.connect
                )}
              </Button>

              <Separator className="my-4" />

              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  {t.login.orSelectRole}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((role) => (
                    <Button
                      key={role.id}
                      variant="outline"
                      size="sm"
                      className="flex flex-col h-auto py-2 gap-1"
                      onClick={() => handleDemoRoleSelect(role.id)}
                      data-testid={`button-demo-${role.id}`}
                    >
                      <role.icon className="h-4 w-4" />
                      <span className="text-xs">{role.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Utilisateurs de test: trainer, admin, jean.dupont (LAB001)
          </p>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; 2026 BDB France Scientific. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
