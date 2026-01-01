import { useState } from "react";
import { Check, ChevronsUpDown, X, QrCode, Users } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import type { User } from "@shared/schema";

interface TraineeSelectorProps {
  trainees: User[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading?: boolean;
}

export function TraineeSelector({
  trainees,
  selectedIds,
  onSelectionChange,
  isLoading,
}: TraineeSelectorProps) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const toggleTrainee = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const removeTrainee = (id: string) => {
    onSelectionChange(selectedIds.filter((i) => i !== id));
  };

  const selectedTrainees = trainees.filter((t) => selectedIds.includes(t.id));

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
              data-testid="button-select-trainees"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{t.trainer.selectTrainees}</span>
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
                  {trainees.map((trainee) => (
                    <CommandItem
                      key={trainee.id}
                      value={trainee.name}
                      onSelect={() => toggleTrainee(trainee.id)}
                      data-testid={`trainee-option-${trainee.id}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedIds.includes(trainee.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{trainee.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {trainee.laboratoryId || trainee.username}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" data-testid="button-scan-qr">
              <QrCode className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.trainer.scanQR}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center py-8">
              <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Scanner QR code à venir
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {selectedIds.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedIds.length} stagiaire(s) sélectionné(s)
          </Badge>
        )}
      </div>

      {selectedTrainees.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTrainees.map((trainee) => (
            <Badge
              key={trainee.id}
              variant="outline"
              className="pl-3 pr-1 py-1 flex items-center gap-1"
            >
              <span>{trainee.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-transparent"
                onClick={() => removeTrainee(trainee.id)}
                data-testid={`button-remove-trainee-${trainee.id}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {selectedIds.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t.trainer.noTraineesSelected}
        </p>
      )}
    </div>
  );
}
