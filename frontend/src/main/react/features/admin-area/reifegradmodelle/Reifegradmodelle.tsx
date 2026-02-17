import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Save, Network, Loader2 } from "lucide-react";
import AdminLayout from "@/shared/app/AdminLayout";
import PageHeader from "../catalogs/PageHeader";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useToast } from "@/shared/contexts/ToastContext";
import { useScrollLock } from "@/shared/hooks/useScrollLock";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import {
  getAllReifegradModels,
  createReifegradModel,
  updateReifegradModel,
  deleteReifegradModel,
} from "@/shared/service/api/reifegradModelApi";

// ====== Style Tokens  ======
const CSS = {
  adminBg: "hsl(var(--admin-bg,0 0% 92%))",
  card: "hsl(var(--card,0 0% 98%))",
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
};

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

// Empfohlene Interval-Farben aus dem Grunddesign
const RECOMMENDED_INTERVAL_COLORS = [
  { value: BRAND.navy, label: "Navy" },
  { value: BRAND.steel, label: "Steel" },
  { value: BRAND.gold, label: "Gold" },
  { value: BRAND.sand, label: "Sand" },
  { value: BRAND.fog, label: "Fog" },
];

// ====== Types ======
type Interval = { id: number | string; start: number; end: number; name: string; color: string };
type MaturityModel = {
  id: string;
  name: string;
  description: string;
  intervals: Interval[];
};

// Default-Farben für neue Intervalle
const DEFAULT_COLORS = ["#ef4444", "#fbbf24", "#22c55e", "#3b82f6", "#a855f7", "#f472b6", "#14b8a6"];

// ====== Reusable Modal Shell ======
function GlowModalShell({
  title,
  open,
  onClose,
  children,
  footer,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  useScrollLock(open);
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl px-4 sm:px-0" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
          {/* Glows */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
            aria-hidden="true"
          />

          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Felder mit <span className="text-red-500">*</span> sind Pflichtfelder.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="relative px-6 pb-6">{children}</div>
        </div>

        {/* Abstand + Footer-Buttons*/}
        <div className="h-3" />
        <div className="mt-1 flex gap-2">{footer}</div>
      </div>
    </div>
  );
}

// ====== Create/Edit Modal Content ======
function ModelUpsertModal({
  open,
  onClose,
  onSave,
  initialData,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (model: { id?: string; name: string; description: string; intervals: Interval[] }) => void;
  initialData: MaturityModel | null;
  isLoading: boolean;
}) {
  const isEdit = !!initialData;

  const { showError } = useToast();

  // Local form state 
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [intervals, setIntervals] = useState<Interval[]>(
    initialData?.intervals || [{ id: 1, start: 0, end: 100, name: "Initial Level", color: DEFAULT_COLORS[0] }]
  );

  // Wenn initialData wechselt (Edit anderer Eintrag / Create), State aktualisieren
  React.useEffect(() => {
    setName(initialData?.name || "");
    setDescription(initialData?.description || "");
    setIntervals(initialData?.intervals || [{ id: 1, start: 0, end: 100, name: "Initial Level", color: DEFAULT_COLORS[0] }]);
  }, [initialData, open]);

  const handleIntervalChange = (index: number, newEnd: string) => {
    const updated = [...intervals];
    const current = updated[index];

    let endValue = parseInt(newEnd, 10);
    if (isNaN(endValue)) endValue = 0;
    if (endValue > 100) endValue = 100;
    if (endValue <= current.start) endValue = current.start + 1;

    current.end = endValue;

    if (index < updated.length - 1) {
      updated[index + 1].start = endValue + 1;
      if (updated[index + 1].end <= updated[index + 1].start) {
        updated[index + 1].end = 100;
      }
    }

    setIntervals(updated);
  };

  const addInterval = () => {
    const last = intervals[intervals.length - 1];
    if (last.end >= 100) {
      showError("Der letzte Bereich endet bereits bei 100%. Bitte kürzen Sie diesen zuerst.");
      return;
    }
    const newStart = last.end + 1;
    const newColor = DEFAULT_COLORS[intervals.length % DEFAULT_COLORS.length];
    setIntervals([
      ...intervals,
      { id: Date.now(), start: newStart, end: 100, name: `Level ${intervals.length + 1}`, color: newColor },
    ]);
  };

  const removeInterval = (index: number) => {
    if (intervals.length === 1) return;

    // korrektes Entfernen per Index
    const updated = intervals.filter((_, i) => i !== index);

    // Startwerte nachziehen
    if (index > 0 && updated[index]) {
      updated[index].start = updated[index - 1].end + 1;
    } else if (updated[0]) {
      updated[0].start = 0;
    }
    setIntervals(updated);
  };

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && intervals.length > 0 && intervals[intervals.length - 1].end === 100;
  }, [name, intervals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (intervals[intervals.length - 1].end !== 100) {
      showError("Das Modell muss 100% abdecken.");
      return;
    }

    onSave({
      id: initialData?.id,
      name: name.trim(),
      description: description.trim(),
      intervals,
    });
  };

  return (
    <GlowModalShell
      open={open}
      onClose={onClose}
      title={isEdit ? "Reifegradmodell bearbeiten" : "Neues Reifegradmodell erstellen"}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              flex-1 h-12
              text-sm font-medium
              text-slate-800
              bg-[#f3f3f3]
              hover:bg-[#e5e5e5]
              border border-slate-200
              rounded-xl
              disabled:opacity-60
            "
          >
            Abbrechen
          </button>

          <button
            type="submit"
            form="model-upsert-form"
            disabled={!canSubmit || isLoading}
            className="
              flex-1 h-12
              text-sm font-semibold
              rounded-xl
              bg-[#E3BB62]
              text-[#264555]
              hover:bg-[#d8ac55]
              shadow-[0_10px_30px_rgba(0,0,0,0.18)]
              transition
              hover:-translate-y-[1px]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Speichern...
              </span>
            ) : isEdit ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Save size={16} /> Speichern
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Plus size={16} /> Erstellen
              </span>
            )}
          </button>
        </>
      }
    >
      <form id="model-upsert-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Name des Modells <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="
              w-full rounded-xl border px-3 py-2.5 text-sm
              bg-slate-50 border-slate-200
              outline-none
              focus:bg-white
              focus:border-[#E3BB62]
              focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
              transition
            "
            placeholder="z.B. IT Security Model"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="
              w-full rounded-xl border px-3 py-2.5 text-sm
              bg-slate-50 border-slate-200
              outline-none
              focus:bg-white
              focus:border-[#E3BB62]
              focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
              transition
            "
            placeholder="Beschreibung des Modells..."
          />
        </div>

        <div className="h-px bg-slate-100" />

        {/* Interval Editor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold" style={{ color: BRAND.navy }}>
              Intervalle definieren
            </h4>

            <button
              type="button"
              onClick={addInterval}
              className="
                inline-flex items-center gap-2
                rounded-full border px-3 py-1.5
                text-xs font-semibold
                bg-white
                hover:bg-[#fff9ec]
                transition
              "
              style={{ borderColor: BRAND.sand, color: BRAND.navy }}
            >
              <Plus size={14} />
              Add Interval
            </button>
          </div>

          <div className="rounded-2xl border bg-white p-3 sm:p-4 space-y-3" style={{ borderColor: BRAND.sand }}>
            {intervals.map((interval, idx) => (
              <div
                key={interval.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border p-3"
                style={{ borderColor: "rgba(210,201,185,0.65)", background: "linear-gradient(to bottom, #ffffff, #fafafa)" }}
              >
                {/* Start */}
                <div className="min-w-[86px]">
                  <div className="text-[11px] text-slate-500">Von</div>
                  <div className="font-mono font-bold" style={{ color: BRAND.navy }}>
                    {interval.start}%
                  </div>
                </div>

                <div className="hidden sm:block text-slate-300">→</div>

                {/* End */}
                <div className="min-w-[110px]">
                  <div className="text-[11px] text-slate-500">Bis</div>
                  <div className="relative">
                    <input
                      type="number"
                      value={interval.end}
                      onChange={(e) => handleIntervalChange(idx, e.target.value)}
                      className="
                        w-full rounded-xl border px-3 py-2 text-sm
                        bg-slate-50 border-slate-200
                        outline-none
                        focus:bg-white
                        focus:border-[#E3BB62]
                        focus:ring-2 focus:ring-[rgba(227,187,98,0.35)]
                        transition
                        font-mono font-bold
                      "
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                  </div>
                </div>

                {/* Name */}
                <div className="flex-1">
                  <div className="text-[11px] text-slate-500">Bezeichnung</div>
                  <input
                    type="text"
                    value={interval.name}
                    onChange={(e) => {
                      const next = [...intervals];
                      next[idx].name = e.target.value;
                      setIntervals(next);
                    }}
                    className="
                      w-full rounded-xl border px-3 py-2 text-sm
                      bg-slate-50 border-slate-200
                      outline-none
                      focus:bg-white
                      focus:border-[#E3BB62]
                      focus:ring-2 focus:ring-[rgba(227,187,98,0.35)]
                      transition
                    "
                  />
                </div>

                {/* Farbe */}
                <div className="min-w-[120px]">
                  <div className="text-[11px] text-slate-500 mb-1">Farbe</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 w-full justify-start px-2 py-1.5 text-xs"
                      >
                        <span
                          className="inline-block w-5 h-5 rounded-full border border-white shadow-sm"
                          style={{
                            backgroundColor: interval.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                          }}
                        />
                        <span className="font-mono text-[11px] text-slate-700">
                          {interval.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 z-[1200]" align="start">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[11px] font-medium text-slate-600 mb-2">
                            Empfohlene Farben (Grunddesign)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {RECOMMENDED_INTERVAL_COLORS.map((c) => (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => {
                                  const next = [...intervals];
                                  next[idx].color = c.value;
                                  setIntervals(next);
                                }}
                                className="w-7 h-7 rounded-full border-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring"
                                style={{
                                  backgroundColor: c.value,
                                  borderColor:
                                    (interval.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]) === c.value
                                      ? "#00000066"
                                      : "#ffffff",
                                }}
                                aria-label={c.label}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[11px] font-medium text-slate-600 mb-1">Benutzerdefinierte Farbe</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={interval.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                              onChange={(e) => {
                                const next = [...intervals];
                                next[idx].color = e.target.value;
                                setIntervals(next);
                              }}
                              className="w-9 h-9 rounded-md border border-slate-200 bg-white cursor-pointer"
                              style={{ padding: 0 }}
                            />
                            <input
                              type="text"
                              value={interval.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                              onChange={(e) => {
                                const value = e.target.value;
                                const next = [...intervals];
                                next[idx].color = value;
                                setIntervals(next);
                              }}
                              className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono outline-none focus:bg-white focus:border-[#E3BB62] focus:ring-1 focus:ring-[rgba(227,187,98,0.5)]"
                              placeholder="#264555"
                            />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Delete Interval */}
                {intervals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInterval(idx)}
                    className="
                      inline-flex items-center justify-center
                      rounded-full border
                      px-3 py-2
                      hover:bg-[#fff1f1]
                      transition
                    "
                    style={{ borderColor: "rgba(248,113,113,0.6)", color: "rgb(185,28,28)" }}
                    title="Intervall löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            * Ändern Sie den „Bis"-Wert, um einen neuen Bereich zu ermöglichen. Der nächste Bereich startet automatisch bei (Wert + 1).
          </p>
        </div>
      </form>
    </GlowModalShell>
  );
}

export default function MaturityModelPage() {
  const { showSuccess, showError } = useToast();

  // State
  const [models, setModels] = useState<MaturityModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Create/Edit modal state
  const [openUpsert, setOpenUpsert] = useState(false);
  const [editingModel, setEditingModel] = useState<MaturityModel | null>(null);

  // Delete confirm state
  const [openDelete, setOpenDelete] = useState(false);
  const [target, setTarget] = useState<MaturityModel | null>(null);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const data = await getAllReifegradModels();
      // Convert API response to local format with interval IDs
      const converted: MaturityModel[] = data.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description || "",
        intervals: m.intervals.map((interval, idx) => ({
          id: idx + 1,
          name: interval.name,
          start: interval.start,
          end: interval.end,
          color: interval.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        })),
      }));
      setModels(converted);
    } catch (error) {
      console.error("Fehler beim Laden der Reifegradmodelle:", error);
      showError("Fehler beim Laden der Reifegradmodelle");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingModel(null);
    setOpenUpsert(true);
  };

  const openEdit = (m: MaturityModel) => {
    setEditingModel(m);
    setOpenUpsert(true);
  };

  const askDelete = (m: MaturityModel) => {
    setTarget(m);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!target) return;
    try {
      setIsSaving(true);
      await deleteReifegradModel(target.id);
      setModels((prev) => prev.filter((x) => x.id !== target.id));
      showSuccess(`Modell "${target.name}" wurde gelöscht`);
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      showError("Fehler beim Löschen des Modells");
    } finally {
      setIsSaving(false);
      setOpenDelete(false);
      setTarget(null);
    }
  };

  const handleSaveModel = async (data: { id?: string; name: string; description: string; intervals: Interval[] }) => {
    try {
      setIsSaving(true);

      // Convert intervals to API format (without local IDs)
      const apiIntervals = data.intervals.map((i) => ({
        name: i.name,
        start: i.start,
        end: i.end,
        color: i.color,
      }));

      if (data.id) {
        // Update existing
        const updated = await updateReifegradModel(data.id, {
          name: data.name,
          description: data.description,
          intervals: apiIntervals,
        });

        setModels((prev) =>
          prev.map((m) =>
            m.id === data.id
              ? {
                  id: updated.id,
                  name: updated.name,
                  description: updated.description || "",
                  intervals: updated.intervals.map((interval, idx) => ({
                    id: idx + 1,
                    name: interval.name,
                    start: interval.start,
                    end: interval.end,
                    color: interval.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                  })),
                }
              : m
          )
        );
        showSuccess(`Modell "${updated.name}" wurde aktualisiert`);
      } else {
        // Create new
        const created = await createReifegradModel({
          name: data.name,
          description: data.description,
          intervals: apiIntervals,
        });

        const newModel: MaturityModel = {
          id: created.id,
          name: created.name,
          description: created.description || "",
          intervals: created.intervals.map((interval, idx) => ({
            id: idx + 1,
            name: interval.name,
            start: interval.start,
            end: interval.end,
            color: interval.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
          })),
        };

        setModels((prev) => [newModel, ...prev]);
        showSuccess(`Modell "${created.name}" wurde erstellt`);
      }

      setOpenUpsert(false);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      showError("Fehler beim Speichern des Modells");
    } finally {
      setIsSaving(false);
    }
  };

  useScrollLock(openUpsert || (openDelete && !!target));

  return (
    <AdminLayout>
      <PageHeader
        title=" Reifegradmodelle Administration"
        subtitle=" Verwalten Sie hier die Bewertungsschemata für Reifegradmodelle"
        icon={<Network size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
        center={false}
      />

      <main
        className="min-h-[calc(100vh-64px)] mt-0 px-6 pb-8 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4 flex items-center justify-between">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 bg-white/80 backdrop-blur-[2px] shadow-[0_4px_10px_rgba(0,0,0,0.06)]"
            style={{ borderColor: BRAND.sand, color: CSS.mutedFg }}
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: "rgba(38,69,85,0.06)", color: BRAND.navy }}
            >
              <Network size={14} />
            </span>
            <span className="font-semibold" style={{ color: CSS.fg }}>
              Reifegradmodelle
            </span>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="
              inline-flex items-center gap-2
              rounded-full px-4 py-2
              text-sm font-semibold
              transition hover:-translate-y-[1px]
            "
            style={{
              background: BRAND.gold,
              color: BRAND.navy,
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            <Plus size={16} />
            Modell erstellen
          </button>
        </div>

        {/* Table Card  */}
        <section
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto
            rounded-[12px] border
            shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
            overflow-hidden
          "
          style={{ borderColor: CSS.border, background: BRAND.fog }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead
                className="text-left text-xs font-semibold uppercase tracking-[0.04em]"
                style={{
                  background: "linear-gradient(to right, #ebebec, #ffffff)",
                  borderBottom: `2px solid ${BRAND.sand}`,
                  color: BRAND.navy,
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-[0.85rem]" style={{ color: CSS.fg }}>
                    Name des Modells
                  </th>
                  <th className="px-4 py-3 text-[0.85rem]" style={{ color: CSS.fg }}>
                    Beschreibung
                  </th>
                  <th className="px-4 py-3 text-[0.85rem]" style={{ color: CSS.fg }}>
                    Intervalle
                  </th>
                  <th className="px-4 py-3 text-[0.85rem] text-center" style={{ color: CSS.fg }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 bg-white text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        Lade Reifegradmodelle...
                      </div>
                    </td>
                  </tr>
                ) : models.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 bg-white text-center text-slate-500">
                      Keine Modelle gefunden. Erstellen Sie ein neues Modell.
                    </td>
                  </tr>
                ) : (
                  models.map((m) => (
                    <tr
                      key={m.id}
                      className="
                        bg-white transition border-l-[4px] border-transparent
                        hover:border-[#E3BB62]
                        hover:bg-[#fff9ec]
                        hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
                      "
                    >
                      <td className="px-4 py-4 font-semibold" style={{ color: CSS.fg, borderBottom: `1px solid ${CSS.border}` }}>
                        {m.name}
                      </td>
                      <td className="px-4 py-4 text-[0.875rem]" style={{ color: CSS.mutedFg, borderBottom: `1px solid ${CSS.border}` }}>
                        {m.description || "—"}
                      </td>
                      <td className="px-4 py-4" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                        <div className="flex flex-wrap gap-2">
                          {m.intervals.map((it) => (
                            <span
                              key={it.id}
                              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                              style={{ 
                                backgroundColor: it.color || DEFAULT_COLORS[0],
                                textShadow: "0 1px 2px rgba(0,0,0,0.2)"
                              }}
                            >
                              {it.name} ({it.start}–{it.end}%)
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center whitespace-nowrap" style={{ borderBottom: `1px solid ${CSS.border}` }}>
                        <div className="inline-flex items-center justify-center gap-2">
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEdit(m)}
                            className="
                              inline-flex items-center justify-center
                              rounded-full px-2.5 py-1.5
                              text-[11px] font-medium
                              border transition
                              hover:bg-[#f5f0e4]
                            "
                            style={{
                              borderColor: BRAND.sand,
                              color: BRAND.navy,
                              background: "#ffffff",
                            }}
                            title="Edit"
                          >
                            Edit
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => askDelete(m)}
                            className="
                              inline-flex items-center justify-center
                              rounded-full px-2.5 py-1.5
                              text-[11px] font-medium
                              border transition
                              hover:bg-[#fff1f1]
                            "
                            style={{
                              borderColor: "rgba(248,113,113,0.8)",
                              color: "rgb(185,28,28)",
                              background: "#ffffff",
                            }}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Create/Edit Modal */}
      <ModelUpsertModal
        open={openUpsert}
        onClose={() => setOpenUpsert(false)}
        onSave={handleSaveModel}
        initialData={editingModel}
        isLoading={isSaving}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={openDelete && !!target}
        title="Reifegradmodell löschen?"
        description={
          <>
            Willst du das Modell{" "}
            <span className="font-semibold">{target?.name}</span>{" "}
            wirklich löschen?
          </>
        }
        hintTitle="Wichtiger Hinweis"
        hintText={
          <>
            <span className="font-semibold text-red-700">Dieses Modell wird von allen Katalogen entfernt</span>, die es verwenden.{" "}
            Diese Aktion kann{" "}
            <span className="font-semibold text-red-700">nicht rückgängig gemacht</span>{" "}
            werden.
          </>
        }
        cancelLabel="Abbrechen"
        confirmLabel="Ja, löschen"
        onCancel={() => {
          setOpenDelete(false);
          setTarget(null);
        }}
        onConfirm={confirmDelete}
        icon={<Trash2 className="text-red-500" />}
      />
    </AdminLayout>
  );
}
