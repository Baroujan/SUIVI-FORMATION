import { ExternalLink, Check, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComfortRating } from "./ComfortRating";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import type { TrainingElementWithDetails } from "@shared/schema";

interface TrainingElementCardProps {
  element: TrainingElementWithDetails;
  mode: "trainer" | "trainee";
  onValidate?: () => void;
  onRateComfort?: (rating: number) => void;
  isValidating?: boolean;
}

export function TrainingElementCard({
  element,
  mode,
  onValidate,
  onRateComfort,
  isValidating,
}: TrainingElementCardProps) {
  const { t } = useApp();
  const isValidated = !!element.validation;

  return (
    <Card
      className={cn(
        "transition-all",
        isValidated && "border-chart-3/30 bg-chart-3/5"
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-sm">{element.name}</h4>
                {isValidated && (
                  <Badge variant="outline" className="text-chart-3 border-chart-3/30">
                    <Check className="h-3 w-3 mr-1" />
                    {t.trainer.validated}
                  </Badge>
                )}
              </div>
              {element.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {element.description}
                </p>
              )}
            </div>

            {mode === "trainer" && !isValidated && (
              <Button
                size="sm"
                onClick={onValidate}
                disabled={isValidating}
                data-testid={`button-validate-${element.id}`}
              >
                {isValidating ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span className="ml-1">{t.trainer.validateElement}</span>
              </Button>
            )}
          </div>

          {isValidated && element.validation && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                {t.trainer.validatedBy}: {element.validation.trainerId}
              </span>
              <span>
                {t.trainer.validatedOn}:{" "}
                {new Date(element.validation.validatedAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {mode === "trainee" && isValidated && (
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {t.trainee.comfortLevel}
                </span>
                <ComfortRating
                  value={element.comfortRating?.rating || 0}
                  onChange={onRateComfort}
                  size="sm"
                />
              </div>

              {element.facsUniversityLink && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid={`link-facs-${element.id}`}
                >
                  <a
                    href={element.facsUniversityLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {t.trainee.facsUniversity}
                  </a>
                </Button>
              )}
            </div>
          )}

          {element.comfortRating && (
            <div className="text-xs text-muted-foreground">
              {t.trainee.lastRated}:{" "}
              {new Date(element.comfortRating.ratedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
