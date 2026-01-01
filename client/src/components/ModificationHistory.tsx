import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { History, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/contexts/AppContext";
import type { ModificationHistory as ModificationHistoryType } from "@shared/schema";

interface ModificationHistoryProps {
  entityType?: string;
  entityId?: string;
  showAll?: boolean;
  maxHeight?: string;
}

export function ModificationHistory({ 
  entityType, 
  entityId, 
  showAll = false,
  maxHeight = "400px" 
}: ModificationHistoryProps) {
  const { t, language } = useApp();
  const dateLocale = language === "fr" ? fr : enUS;

  const { data: history = [], isLoading } = useQuery<ModificationHistoryType[]>({
    queryKey: showAll 
      ? ["/api/modification-history/all"] 
      : ["/api/modification-history", entityType, entityId],
    enabled: showAll || (!!entityType && !!entityId),
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-3 w-3" />;
      case "updated":
        return <Pencil className="h-3 w-3" />;
      case "deleted":
        return <Trash2 className="h-3 w-3" />;
      default:
        return <History className="h-3 w-3" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "created":
        return t.history.created;
      case "updated":
        return t.history.updated;
      case "deleted":
        return t.history.deleted;
      default:
        return action;
    }
  };

  const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case "created":
        return "default";
      case "updated":
        return "secondary";
      case "deleted":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatEntityType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            {t.history.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            {t.history.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.history.noHistory}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          {t.history.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight }} className="pr-4">
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 p-3 rounded-md bg-muted/50 border"
                data-testid={`history-item-${item.id}`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant={getActionVariant(item.action)} className="gap-1">
                      {getActionIcon(item.action)}
                      {getActionLabel(item.action)}
                    </Badge>
                    {showAll && (
                      <span className="text-xs text-muted-foreground">
                        {formatEntityType(item.entityType)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.modifiedAt), "PPpp", { locale: dateLocale })}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">{t.history.modifiedBy}: </span>
                  <span className="font-medium">{item.modifiedBy}</span>
                </div>
                {item.previousValue && item.action === "updated" && (
                  <details className="text-xs mt-1">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      {t.history.previousValue}
                    </summary>
                    <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(JSON.parse(item.previousValue), null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
