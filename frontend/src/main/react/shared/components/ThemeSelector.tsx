import * as React from "react";
import { Check, ChevronsUpDown, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ThemeOption } from "@/api/types";
import { cn } from "@/lib/utils";

const BRAND = {
  navy: "#264555",
  gold: "#E3BB62",
};

type ThemeSelectorProps = {
  themes: ThemeOption[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
  disabled?: boolean;
};

export function ThemeSelector({
  themes,
  selectedIds,
  onSelect,
  maxSelections = 2,
  placeholder = "Themen auswählen...",
  disabled = false,
}: ThemeSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedThemes = themes.filter((t) => selectedIds.includes(t.id));

  const filteredThemes = React.useMemo(() => {
    if (!searchQuery.trim()) return themes;
    const q = searchQuery.toLowerCase();
    return themes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.catalogName.toLowerCase().includes(q)
    );
  }, [themes, searchQuery]);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((sid) => sid !== id));
    } else if (selectedIds.length < maxSelections) {
      onSelect([...selectedIds, id]);
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(selectedIds.filter((sid) => sid !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-auto min-h-[44px] px-3 py-2",
            "border-[#e5e7eb] bg-white hover:bg-slate-50",
            "text-left font-normal"
          )}
        >
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selectedThemes.length === 0 ? (
              <span className="text-slate-400">{placeholder}</span>
            ) : (
              selectedThemes.map((t) => (
                <span
                  key={t.id}
className="inline-flex items-center gap-1 rounded-md bg-[#E3BB62]/20 px-2 py-1 text-xs font-medium text-[#264555]"
                >
                  {t.name}
                  <X
                  className="h-3 w-3 cursor-pointer hover:text-[#E3BB62]"

                    onClick={(e) => handleRemove(t.id, e)}
                  />
                </span>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        {/* Search Input */}
        <div className="border-b border-slate-200 p-3">
          <input
            type="text"
            placeholder="Thema suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
          />
          <p className="mt-2 text-xs text-slate-500">
            Maximal {maxSelections} Themen auswählbar
          </p>
        </div>

        {/* Theme List */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredThemes.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">
              Keine Themen gefunden
            </div>
          ) : (
            filteredThemes.map((theme) => {
              const isSelected = selectedIds.includes(theme.id);
              const isDisabled = !isSelected && selectedIds.length >= maxSelections;

              return (
                <div
                  key={theme.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border-b border-slate-100 px-3 py-3 transition",
                   isSelected,

                    isDisabled && "cursor-not-allowed opacity-50",
                    !isDisabled && !isSelected && "hover:bg-slate-50"
                  )}
                  onClick={() => !isDisabled && handleToggle(theme.id)}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                     isSelected
  ? "border-[#E3BB62] bg-[#E3BB62] text-white"
  : "border-slate-300 bg-white"

                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium text-sm truncate"
                      style={{ color: BRAND.navy }}
                    >
                      {theme.name}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 truncate">
                      {theme.catalogName}
                    </div>
                    <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {theme.totalSessions} Sessions
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          theme.avgScorePercent >= 70
                            ? "text-emerald-600"
                            : theme.avgScorePercent >= 50
                              ? "text-amber-600"
                              : "text-red-500"
                        )}
                      >
                        Ø {theme.avgScorePercent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
