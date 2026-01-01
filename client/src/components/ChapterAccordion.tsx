import { ChevronDown, CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TrainingElementCard } from "./TrainingElementCard";
import { ProgressBar } from "./ProgressBar";
import type { ChapterWithContent, TrainingElementWithDetails } from "@shared/schema";

interface ChapterAccordionProps {
  chapters: ChapterWithContent[];
  mode: "trainer" | "trainee";
  onValidateElement?: (elementId: string) => void;
  onRateElement?: (elementId: string, rating: number) => void;
  validatingElements?: Set<string>;
}

export function ChapterAccordion({
  chapters,
  mode,
  onValidateElement,
  onRateElement,
  validatingElements = new Set(),
}: ChapterAccordionProps) {
  const calculateChapterProgress = (chapter: ChapterWithContent) => {
    let totalElements = 0;
    let validatedElements = 0;

    chapter.subChapters.forEach((sub) => {
      sub.elements.forEach((el) => {
        totalElements++;
        if (el.validation) validatedElements++;
      });
    });

    return { total: totalElements, validated: validatedElements };
  };

  const calculateSubChapterProgress = (
    subChapter: ChapterWithContent["subChapters"][0]
  ) => {
    const total = subChapter.elements.length;
    const validated = subChapter.elements.filter((el) => el.validation).length;
    return { total, validated };
  };

  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {chapters.map((chapter) => {
        const chapterProgress = calculateChapterProgress(chapter);
        const isChapterComplete =
          chapterProgress.validated === chapterProgress.total &&
          chapterProgress.total > 0;

        return (
          <AccordionItem
            key={chapter.id}
            value={chapter.id}
            className="border rounded-md px-4"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  {isChapterComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0" />
                  )}
                  <span className="font-medium text-left">{chapter.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {chapterProgress.validated}/{chapterProgress.total}
                  </Badge>
                  <ProgressBar
                    value={chapterProgress.validated}
                    max={chapterProgress.total}
                    className="w-24"
                    variant={isChapterComplete ? "success" : "default"}
                  />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4 pl-8">
                {chapter.subChapters.map((subChapter) => {
                  const subProgress = calculateSubChapterProgress(subChapter);
                  const isSubComplete =
                    subProgress.validated === subProgress.total &&
                    subProgress.total > 0;

                  return (
                    <div key={subChapter.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isSubComplete ? (
                            <CheckCircle2 className="h-4 w-4 text-chart-3" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted" />
                          )}
                          <h4 className="text-sm font-medium text-muted-foreground">
                            {subChapter.name}
                          </h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {subProgress.validated}/{subProgress.total}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {subChapter.elements.map((element) => (
                          <TrainingElementCard
                            key={element.id}
                            element={element}
                            mode={mode}
                            onValidate={() => onValidateElement?.(element.id)}
                            onRateComfort={(rating) =>
                              onRateElement?.(element.id, rating)
                            }
                            isValidating={validatingElements.has(element.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
