import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  value?: Date;
  onChange?: (d: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
};

const BRAND = { gold: "#E3BB62" };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const MONTHS_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export default function FancyDatePicker({
  value,
  onChange,
  placeholder = "TT.MM.JJJJ",
  disabled,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<"calendar" | "year" | "month">("calendar");
  const [month, setMonth] = React.useState<Date>(value ?? new Date());

  React.useEffect(() => {
    if (value) setMonth(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [value]);

  const currentYear = month.getFullYear();
  const initialStart = clamp(currentYear - (currentYear % 12), minYear, maxYear);
  const [startYear, setStartYear] = React.useState(initialStart);

  React.useEffect(() => {
    const y = month.getFullYear();
    const s = clamp(y - (y % 12), minYear, maxYear);
    setStartYear(s);
  }, [month, minYear, maxYear]);

  const years = React.useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 12; i++) arr.push(startYear + i);
    return arr.filter((y) => y >= minYear && y <= maxYear);
  }, [startYear, minYear, maxYear]);

  const displayLabel = value ? format(value, "dd.MM.yyyy", { locale: de }) : placeholder;

  const yearLabel = String(month.getFullYear());
  const monthLabel = format(month, "MMMM", { locale: de });

  const chipBase =
    "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold " +
    "transition border border-transparent hover:border-[#e5e7eb] hover:bg-white " +
    "active:scale-[0.98]";

  const chipActive =
    "bg-white border-[#e5e7eb] shadow-sm";

  const iconBtn =
    "h-9 w-9 rounded-xl border border-[#e5e7eb] bg-white " +
    "hover:bg-[#f8fafc] hover:border-[#d4d4d8] " +
    "inline-flex items-center justify-center transition active:scale-[0.98]";

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setView("calendar");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full group relative flex items-center justify-between rounded-xl border",
            "border-[#e5e7eb] bg-white px-4 py-3 text-left text-sm",
            "shadow-sm transition-all duration-150",
            "hover:border-[#d4d4d8] hover:shadow-md",
            "focus:outline-none focus:ring-4 focus:ring-[rgba(227,187,98,0.25)] focus:border-[rgba(227,187,98,0.9)]",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          <span className={cn("text-sm", !value && "text-[#9ca3af]")}>{displayLabel}</span>
          <CalendarIcon className="h-4 w-4 text-[#9ca3af] group-hover:text-[#6b7280] transition" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={10}
        className={cn(
          "p-0 w-[332px] max-w-[332px]",
          "rounded-2xl border border-white/60",
          "bg-slate-50 backdrop-blur-0"
,
          "shadow-[0_26px_70px_rgba(15,23,42,0.24)]"
        )}
      >
        <div className="p-3" style={{ ["--brand-gold" as any]: BRAND.gold }}>
          {/* top glow bar */}
          <div className="h-1.5 rounded-t-2xl bg-[rgba(227,187,98,0.35)]" />

          {/* HEADER */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(chipBase, view === "month" && chipActive)}
                onClick={() => setView((v) => (v === "month" ? "calendar" : "month"))}
                title="Monat auswählen"
              >
                {monthLabel}
                <ChevronsUpDown className="h-4 w-4 text-[#94a3b8]" />
              </button>

              <button
                type="button"
                className={cn(chipBase, view === "year" && chipActive)}
                onClick={() => setView((v) => (v === "year" ? "calendar" : "year"))}
                title="Jahr auswählen"
              >
                {yearLabel}
                <ChevronsUpDown className="h-4 w-4 text-[#94a3b8]" />
              </button>
            </div>

            {view === "year" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={iconBtn}
                  onClick={() => setStartYear((s) => clamp(s - 12, minYear, maxYear))}
                  aria-label="12 Jahre zurück"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={iconBtn}
                  onClick={() => setStartYear((s) => clamp(s + 12, minYear, maxYear))}
                  aria-label="12 Jahre vor"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={iconBtn}
                  onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  aria-label="Vorheriger Monat"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={iconBtn}
                  onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  aria-label="Nächster Monat"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* BODY CARD */}
          <div className="mt-3 rounded-2xl bg-white shadow-sm border border-[#eef2f7] p-2">
            {/* YEAR GRID */}
            {view === "year" && (
              <div className="grid grid-cols-3 gap-2 p-1">
                {years.map((y) => {
                  const isActive = month.getFullYear() === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      className={cn(
                        "h-10 rounded-xl text-sm font-semibold border transition",
                        "border-[#e5e7eb] bg-white hover:bg-[rgba(227,187,98,0.18)]",
                        "hover:-translate-y-[1px] hover:shadow-sm",
                        isActive &&
                          "bg-[--brand-gold] border-[--brand-gold] shadow-[0_10px_22px_rgba(227,187,98,0.35)]"
                      )}
                      onClick={() => {
                        setMonth((m) => new Date(y, m.getMonth(), 1));
                        setView("calendar");
                      }}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}

            {/* MONTH GRID */}
            {view === "month" && (
              <div className="grid grid-cols-3 gap-2 p-1">
                {MONTHS_SHORT.map((label, idx) => {
                  const isActive = month.getMonth() === idx;
                  return (
                    <button
                      key={label}
                      type="button"
                      className={cn(
                        "h-10 rounded-xl text-sm font-semibold border transition",
                        "border-[#e5e7eb] bg-white hover:bg-[rgba(227,187,98,0.18)]",
                        "hover:-translate-y-[1px] hover:shadow-sm",
                        isActive &&
                          "bg-[--brand-gold] border-[--brand-gold] shadow-[0_10px_22px_rgba(227,187,98,0.35)]"
                      )}
                      onClick={() => {
                        setMonth((m) => new Date(m.getFullYear(), idx, 1));
                        setView("calendar");
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* CALENDAR (ohne caption/nav -> kein Double-Header) */}
            {view === "calendar" && (
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={value}
                onSelect={(d) => {
                  onChange?.(d);
                  if (d) setOpen(false);
                }}
                locale={de}
                initialFocus
                className="rounded-2xl bg-white"
                classNames={{
                  caption: "hidden",
                  nav: "hidden",

                  head_cell: "w-9 text-center text-[0.7rem] font-semibold text-[#94a3b8] pb-1",
                  row: "flex w-full mt-1",
                  cell: "w-9 h-9 text-center p-0 relative",
                  day:
                    "w-9 h-9 rounded-full text-sm inline-flex items-center justify-center transition " +
                    "hover:bg-[rgba(227,187,98,0.20)] hover:-translate-y-[1px]",
                  day_selected:
                    "bg-[--brand-gold] text-[#1f2937] font-semibold " +
                    "shadow-[0_10px_22px_rgba(227,187,98,0.38)]",
                  day_today:
                    "border border-[--brand-gold] text-[#0f172a] bg-white",
                  day_outside:
                    "text-[#cbd5e1] opacity-60 hover:bg-transparent hover:translate-y-0",
                }}
              />
            )}
          </div>

          {/* FOOTER (interactive actions) */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
              <Sparkles className="h-4 w-4" />
              <span>Klick Jahr/Monat für Schnellwahl</span>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-xl text-sm text-[#0f172a]
                         border border-[#e5e7eb] bg-white
                         hover:bg-[rgba(227,187,98,0.18)] active:scale-[0.98]"
              onClick={() => {
                const today = new Date();
                onChange?.(today);
                setOpen(false);
              }}
            >
              Heute
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
