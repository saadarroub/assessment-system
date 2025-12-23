import * as React from "react";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number | "";
  onChange: (v: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
};

export default function SimpleNumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder = "0",
}: Props) {
  return (
    <div className="w-full">
      <div
        className={cn(
          "group flex items-center gap-3 rounded-xl border bg-white px-4 py-3",
          "border-[#e5e7eb] shadow-sm transition-all duration-150",
          "hover:border-[#d4d4d8] hover:shadow-md",
          "focus-within:ring-4 focus-within:ring-[rgba(227,187,98,0.22)]",
          "focus-within:border-[rgba(227,187,98,0.9)]"
        )}
      >
        <Hash className="h-4 w-4 text-[#9ca3af] group-focus-within:text-[#6b7280]" />

        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw === "" ? "" : Number(raw));
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#9ca3af]"
        />
      </div>

      {(min != null || max != null) && (
        <div className="mt-1 text-xs text-[#94a3b8]">
          {min != null && <>min {min}</>}
          {min != null && max != null && " · "}
          {max != null && <>max {max}</>}
        </div>
      )}
    </div>
  );
}
