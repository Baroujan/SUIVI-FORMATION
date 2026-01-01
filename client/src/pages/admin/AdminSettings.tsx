import { useState } from "react";
import { Settings, Globe, Bell, Mail, Shield, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { t, language, setLanguage } = useApp();
  const { toast } = useToast();

  const [alertThreshold, setAlertThreshold] = useState("2.5");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoAlerts, setAutoAlerts] = useState(true);
  const [supportEmail, setSupportEmail] = useState("support@bdbfrance.com");

  const handleSaveSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Les modifications ont été enregistrées avec succès",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {t.navigation.settings}
        </h1>
        <p className="text-muted-foreground">
          Configurez les paramètres de la plateforme
        </p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t.admin.changeLanguage}</CardTitle>
            </div>
            <CardDescription>
              Changez la langue de l'interface utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Langue de l'interface</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as "fr" | "en")}>
                <SelectTrigger className="w-[200px]" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">
                    <div className="flex items-center gap-2">
                      <span>Français</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>English</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Alertes</CardTitle>
            </div>
            <CardDescription>
              Configurez le système d'alertes automatiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Alertes automatiques</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer automatiquement une alerte quand un stagiaire descend sous le seuil
                </p>
              </div>
              <Switch
                checked={autoAlerts}
                onCheckedChange={setAutoAlerts}
                data-testid="switch-auto-alerts"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="threshold">{t.admin.alertThreshold}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="threshold"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-24"
                  data-testid="input-threshold"
                />
                <span className="text-sm text-muted-foreground">sur 5</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Une alerte sera déclenchée si la moyenne d'aisance d'un stagiaire descend sous ce seuil
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Notifications email</CardTitle>
            </div>
            <CardDescription>
              Configurez les notifications par email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Activer les notifications email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des emails pour les alertes et rapports
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                data-testid="switch-email-notifications"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="support-email">Email de support BDB France</Label>
              <Input
                id="support-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                data-testid="input-support-email"
              />
              <p className="text-xs text-muted-foreground">
                Les alertes automatiques seront envoyées à cette adresse
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Sécurité</CardTitle>
            </div>
            <CardDescription>
              Paramètres de sécurité et d'accès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Traçabilité des modifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enregistrer toutes les modifications apportées aux éléments de formation
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <p className="text-xs text-muted-foreground">
              Cette fonctionnalité est toujours activée pour assurer la conformité
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
}
