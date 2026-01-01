import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChapterAccordion } from "./ChapterAccordion";
import type { InstrumentWithChapters } from "@shared/schema";

interface InstrumentTabsProps {
  instruments: InstrumentWithChapters[];
  mode: "trainer" | "trainee";
  onValidateElement?: (elementId: string) => void;
  onRateElement?: (elementId: string, rating: number) => void;
  validatingElements?: Set<string>;
}

export function InstrumentTabs({
  instruments,
  mode,
  onValidateElement,
  onRateElement,
  validatingElements,
}: InstrumentTabsProps) {
  const calculateInstrumentProgress = (instrument: InstrumentWithChapters) => {
    let totalElements = 0;
    let validatedElements = 0;

    instrument.chapters.forEach((chapter) => {
      chapter.subChapters.forEach((sub) => {
        sub.elements.forEach((el) => {
          totalElements++;
          if (el.validation) validatedElements++;
        });
      });
    });

    return { total: totalElements, validated: validatedElements };
  };

  if (instruments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FlaskConical className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Aucun instrument sélectionné</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez des instruments pour commencer la formation
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={instruments[0]?.id} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto p-1 gap-1">
        {instruments.map((instrument) => {
          const progress = calculateInstrumentProgress(instrument);
          return (
            <TabsTrigger
              key={instrument.id}
              value={instrument.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid={`tab-instrument-${instrument.id}`}
            >
              <FlaskConical className="h-4 w-4" />
              <span>{instrument.name}</span>
              <Badge
                variant="secondary"
                className="text-xs data-[state=active]:bg-primary-foreground/20"
              >
                {progress.validated}/{progress.total}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {instruments.map((instrument) => (
        <TabsContent key={instrument.id} value={instrument.id} className="mt-6">
          <ChapterAccordion
            chapters={instrument.chapters}
            mode={mode}
            onValidateElement={onValidateElement}
            onRateElement={onRateElement}
            validatingElements={validatingElements}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
