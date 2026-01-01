import { useState } from "react";
import { Check, ChevronsUpDown, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import type { Instrument } from "@shared/schema";

interface InstrumentSelectorProps {
  instruments: Instrument[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading?: boolean;
}

export function InstrumentSelector({
  instruments,
  selectedIds,
  onSelectionChange,
  isLoading,
}: InstrumentSelectorProps) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);

  const toggleInstrument = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const selectedInstruments = instruments.filter((i) =>
    selectedIds.includes(i.id)
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between min-w-[200px]"
              disabled={isLoading}
              data-testid="button-select-instruments"
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                <span>{t.trainer.selectInstruments}</span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder={t.common.search} />
              <CommandList>
                <CommandEmpty>{t.common.noResults}</CommandEmpty>
                <CommandGroup>
                  {instruments.map((instrument) => (
                    <CommandItem
                      key={instrument.id}
                      value={instrument.name}
                      onSelect={() => toggleInstrument(instrument.id)}
                      data-testid={`instrument-option-${instrument.id}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedIds.includes(instrument.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{instrument.name}</span>
                        {instrument.description && (
                          <span className="text-xs text-muted-foreground">
                            {instrument.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedIds.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedIds.length} instrument(s) sélectionné(s)
          </Badge>
        )}
      </div>

      {selectedInstruments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedInstruments.map((instrument) => (
            <Badge key={instrument.id} variant="outline" className="py-1">
              <FlaskConical className="h-3 w-3 mr-1" />
              {instrument.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
