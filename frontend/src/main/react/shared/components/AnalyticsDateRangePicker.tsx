import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isAfter, isBefore, addMonths } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { TimeBucket } from "@/api/types";

const BRAND = {
  navy: "#264555",
  gold: "#E3BB62",
};

// Max 2 years back
const MIN_DATE = subYears(new Date(), 2);
const MAX_DATE = new Date();

type DateRangeValue = {
  start: Date;
  end: Date;
};

type AnalyticsDateRangePickerProps = {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  timeBucket: TimeBucket;
  onTimeBucketChange: (bucket: TimeBucket) => void;
  disabled?: boolean;
};

const PRESETS = [
  {
    label: "Diese Woche",
    getValue: () => ({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }),
      end: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "Dieser Monat",
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
  },
  {
    label: "Letzte 3 Monate",
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 2)),
      end: new Date(),
    }),
  },
  {
    label: "Letzte 6 Monate",
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 5)),
      end: new Date(),
    }),
  },
  {
    label: "Letztes Jahr",
    getValue: () => ({
      start: subYears(new Date(), 1),
      end: new Date(),
    }),
  },
  {
    label: "Letzte 2 Jahre",
    getValue: () => ({
      start: subYears(new Date(), 2),
      end: new Date(),
    }),
  },
];

const TIME_BUCKETS: { value: TimeBucket; label: string }[] = [
  { value: "DAY", label: "Tag" },
  { value: "WEEK", label: "Woche" },
  { value: "MONTH", label: "Monat" },
];

export function AnalyticsDateRangePicker({
  value,
  onChange,
  timeBucket,
  onTimeBucketChange,
  disabled = false,
}: AnalyticsDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectingStart, setSelectingStart] = React.useState(true);
  const [tempStart, setTempStart] = React.useState<Date | undefined>(value.start);
  const [tempEnd, setTempEnd] = React.useState<Date | undefined>(value.end);
  const [month, setMonth] = React.useState(value.start);

  // Validate date is within range
  const validateDate = (date: Date): Date => {
    if (isBefore(date, MIN_DATE)) return MIN_DATE;
    if (isAfter(date, MAX_DATE)) return MAX_DATE;
    return date;
  };

  const handlePresetClick = (preset: (typeof PRESETS)[number]) => {
    const range = preset.getValue();
    const validatedRange = {
      start: validateDate(range.start),
      end: validateDate(range.end),
    };
    onChange(validatedRange);
    setTempStart(validatedRange.start);
    setTempEnd(validatedRange.end);
    setOpen(false);
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;
    const validDate = validateDate(date);

    if (selectingStart) {
      setTempStart(validDate);
      setTempEnd(undefined);
      setSelectingStart(false);
    } else {
      if (tempStart && isBefore(validDate, tempStart)) {
        // User clicked a date before start, swap
        setTempEnd(tempStart);
        setTempStart(validDate);
      } else {
        setTempEnd(validDate);
      }
      setSelectingStart(true);
    }
  };

  const handleApply = () => {
    if (tempStart && tempEnd) {
      onChange({ start: tempStart, end: tempEnd });
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setTempStart(value.start);
    setTempEnd(value.end);
    setSelectingStart(true);
    setOpen(false);
  };

  const displayValue = `${format(value.start, "dd.MM.yyyy", { locale: de })} – ${format(value.end, "dd.MM.yyyy", { locale: de })}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date Range Picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              "border-[#e5e7eb] bg-white hover:bg-slate-50"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
            <span style={{ color: BRAND.navy }}>{displayValue}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets */}
            <div className="border-r border-slate-200 p-3">
              <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                Schnellauswahl
              </p>
              <div className="flex flex-col gap-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className="rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 transition"
                    style={{ color: BRAND.navy }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Max. 2 Jahre zurück
              </div>
            </div>

            {/* Calendar */}
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <button
                  onClick={() => setMonth(addMonths(month, -1))}
                  className="rounded-lg p-1.5 hover:bg-slate-100"
                  disabled={isBefore(addMonths(month, -1), MIN_DATE)}
                >
                  <ChevronLeft className="h-4 w-4 text-slate-500" />
                </button>
                <span className="text-sm font-medium" style={{ color: BRAND.navy }}>
                  {format(month, "MMMM yyyy", { locale: de })}
                </span>
                <button
                  onClick={() => setMonth(addMonths(month, 1))}
                  className="rounded-lg p-1.5 hover:bg-slate-100"
                  disabled={isAfter(addMonths(month, 1), MAX_DATE)}
                >
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              <Calendar
                mode="single"
                selected={selectingStart ? tempStart : tempEnd}
                onSelect={handleDaySelect}
                month={month}
                onMonthChange={setMonth}
                disabled={(date) => isBefore(date, MIN_DATE) || isAfter(date, MAX_DATE)}
                modifiers={{
                  range_start: tempStart ? [tempStart] : [],
                  range_end: tempEnd ? [tempEnd] : [],
                  in_range:
                    tempStart && tempEnd
                      ? { from: tempStart, to: tempEnd }
                      : undefined,
                }}
                modifiersClassNames={{
                  range_start: "bg-sky-500 text-white rounded-l-full",
                  range_end: "bg-sky-500 text-white rounded-r-full",
                  in_range: "bg-sky-100",
                }}
                className="rounded-md"
              />

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <div className="text-xs text-slate-500">
                  {selectingStart ? "Startdatum wählen" : "Enddatum wählen"}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Abbrechen
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={!tempStart || !tempEnd}
                    className="bg-[#E3BB62] hover:bg-[#d9ad45] text-[#264555]"

                  >
                    Anwenden
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Time Bucket Selector */}
      <div className="flex rounded-lg border border-[#e5e7eb] bg-white p-1">
        {TIME_BUCKETS.map((bucket) => (
          <button
            key={bucket.value}
            onClick={() => onTimeBucketChange(bucket.value)}
            disabled={disabled}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
             timeBucket === bucket.value
  ? "bg-[#E3BB62] text-[#264555] shadow-sm"
  : "text-slate-600 hover:bg-amber-50"

            )}
          >
            {bucket.label}
          </button>
        ))}
      </div>
    </div>
  );
}
