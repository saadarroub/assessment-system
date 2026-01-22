import React from "react";
import { Layers, Edit3, Trash2, ArrowRight, Copy, Info } from "lucide-react";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useToast } from "@/shared/contexts/ToastContext";
import { deleteThema, updateThema } from "@/api/questionApi";

type Topic = {
  id: string;
  title: string;
  subtitle: string;
  questions: number;
  status: "active" | "inactive";
};

type TopicCardProps = {
  t: Topic;
  loading?: boolean; // HINZUFÜGEN!
  onDelete?: (t: Topic) => void;
  onDeleteSuccess: (t: Topic) => void;
  onEdit?: (t: Topic) => void;
  onEditSuccess: (t: Topic) => void;
  onManage: (t: Topic) => void;
  onDuplicate: (t: Topic) => void;
  onStatusChange: () => void;
};

const TopicCard = ({
  t,
  onDeleteSuccess,
  onEditSuccess,
  onManage,
  onDuplicate,
  onStatusChange,
}: TopicCardProps) => {
  const { showSuccess, showError } = useToast();
  const titleRef = React.useRef<HTMLHeadingElement | null>(null);
  const descRefFull = React.useRef<HTMLParagraphElement | null>(null);
  const hoverTimeout = React.useRef<any>(null);

  const [showInfoIcon, setShowInfoIcon] = React.useState(false);
  const [showTooltipFull, setShowTooltipFull] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(t.title);
  const [editSubtitle, setEditSubtitle] = React.useState(t.subtitle);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    function checkOverflow() {
      function isOverflow(el: HTMLElement | null) {
        if (!el) return false;
        return (
          el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
        );
      }

      const titleOverflow = isOverflow(titleRef.current);
      const subtitleOverflow = isOverflow(descRefFull.current);

      setShowInfoIcon(titleOverflow || subtitleOverflow);
    }

    checkOverflow();

    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [t.title, t.subtitle]);

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      function isOverflow(el: HTMLElement | null) {
        if (!el) return false;
        return (
          el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
        );
      }

      const titleOverflow = isOverflow(titleRef.current);
      const subtitleOverflow = isOverflow(descRefFull.current);

      setShowInfoIcon(titleOverflow || subtitleOverflow);
    });

    if (titleRef.current) observer.observe(titleRef.current);
    if (descRefFull.current) observer.observe(descRefFull.current);

    return () => observer.disconnect();
  }, []);

  /* ============== Delete ============== */
  const askDelete = () => {
    setOpenDelete(true);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setOpenDelete(false);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteThema(t.id);
      onDeleteSuccess(t);
      setOpenDelete(false);
      showSuccess(`Thema "${t.title}" erfolgreich gelöscht.`);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      showError(`Fehler beim Löschen: ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  /* ============== Edit ============== */
  const askEdit = () => {
    setEditTitle(t.title);
    setEditSubtitle(t.subtitle);
    setOpenEdit(true);
  };

  const cancelEdit = () => {
    if (updating) return;
    setOpenEdit(false);
  };

  const confirmEdit = async () => {
    if (!editTitle.trim()) {
      showError("Titel darf nicht leer sein!");
      return;
    }
    setUpdating(true);
    try {
      const updated = await updateThema(t.id, {
        name: editTitle,
        description: editSubtitle,
      });
      onEditSuccess({
        ...t,
        title: updated.name,
        subtitle: updated.description,
      });
      setOpenEdit(false);
      showSuccess(`Thema "${editTitle}" erfolgreich aktualisiert.`);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      showError(`Fehler beim Aktualisieren: ${msg}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div
        className="
    group relative flex flex-col rounded-2xl overflow-hidden
    
    p-6
    transition-shadow duration-300
    hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]
  "
        style={{
          background: "#ffffff",
          border: "1px solid #e9ebe5ff",
        }}
      >
        {/* ✨ HOVER GLOW LAYER */}
        <div
          className="
    pointer-events-none
    absolute inset-0
    opacity-0
    group-hover:opacity-100
    transition-opacity duration-500
  "
        >
          <div
            className="
      absolute inset-0
      bg-[radial-gradient(circle_at_top_right,rgba(227,187,98,0.18),transparent_55%)]
    "
          />
          <div
            className="
      absolute inset-0
      bg-[radial-gradient(circle_at_bottom_left,rgba(227,187,98,0.18),transparent_55%)]
    "
          />
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          {/* ICON + STATUS */}
          <div className="flex items-center justify-between">
            <div
              className="
    h-12 w-12 rounded-2xl
    flex items-center justify-center
    bg-[hsl(45_80%_55%_/_0.2)]
    
    transition-all duration-300 ease-out
    group-hover:scale-[1.06]
    group-hover:shadow-[0_6px_18px_rgba(227,187,98,0.35)]
  "
            >
              <Layers
                className="
    text-[hsl(45_80%_55%)]
    transition-transform duration-300 ease-out
    group-hover:-translate-y-[1px]
  "
                size={26}
                strokeWidth={2}
              />
            </div>

            {/* ⭐ Status Badge + Toggle */}
            {/* ⭐ Status Badge + Toggle */}
            <div className="flex items-center gap-2 -mt-6">
              {/* Status Badge */}
              <span
                className={`
      px-2 py-1 rounded-full text-xs font-medium
      ${t.status === "active"
                    ? "bg-[hsl(142_71%_85%)] text-[hsl(142_71%_30%)]"
                    : "bg-[hsl(45_30%_88%)] text-[hsl(30_8%_45%)]"
                  }
    `}
              >
                {t.status === "active" ? "aktiv" : "inaktiv"}
              </span>

              {/* Toggle Switch */}
              <div
                onClick={() => onStatusChange()}
                className={`
      relative w-12 h-6 rounded-full cursor-pointer
      flex items-center
      transition-colors duration-150 ease-linear
      ${t.status === "active" ? "bg-emerald-500" : "bg-[hsl(45_30%_88%)]"}
    `}
              >
                <div
                  className={`
        h-5 w-5 bg-white rounded-full
        shadow-[0_1px_4px_rgba(0,0,0,0.25)]
        transition-transform duration-150 ease-out
        ${t.status === "active" ? "translate-x-[26px]" : "translate-x-[2px]"}
      `}
                />
              </div>
            </div>
          </div>
          {/* TITLE */}
          <div className="flex flex-col gap-2 min-h-[80px]">
            {/* TITLE + INFO ICON */}
            <div className="flex items-start justify-between relative">
              <h4
                ref={titleRef}
                className={`text-[20px] font-semibold leading-snug
    text-[hsl(30_10%_15%)]
    whitespace-nowrap overflow-hidden text-ellipsis flex-1
  `}
              >
                {t.title}
              </h4>

              {/* INFO ICON */}
              {showInfoIcon && (
                <div
                  className="ml-2 mt-0.5"
                  onMouseEnter={() => {
                    hoverTimeout.current = setTimeout(() => {
                      setShowTooltipFull(true);
                    }, 350); // ⏳ 350ms Delay bevor Tooltip öffnet
                  }}
                  onMouseLeave={() => {
                    clearTimeout(hoverTimeout.current);
                    setShowTooltipFull(false);
                  }}
                >
                  <div
                    className="
      w-6 h-6 flex items-center justify-center rounded-full 
      bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer
    "
                  >
                    <Info
                      className="w-[17px] h-[17px] text-gray-500"
                      strokeWidth={2}
                    />
                  </div>

                  <div
                    className={`
    ${showTooltipFull ? "opacity-100 visible" : "opacity-0 invisible"}
    absolute right-0 top-9 w-80
    rounded-xl p-3 text-xs
    transition-all duration-200 z-50

    bg-[#fffaf0]
    text-[#264555]
    border border-[#e6dcc8]
    shadow-[0_10px_30px_rgba(38,69,85,0.18)]

    break-words
    overflow-wrap-anywhere
    whitespace-normal
  `}
                  >


                    <b>{t.title}</b>
                    <br />
                    {t.subtitle || "Keine Beschreibung vorhanden"}
                  </div>
                </div>
              )}
            </div>
            <p
              ref={descRefFull}
              className={`text-[15px] font-medium leading-relaxed line-clamp-2
    text-[hsl(30_8%_45%)]
    break-words overflow-wrap-anywhere
  `}
            >
              {t.subtitle || "Keine Beschreibung vorhanden"}
            </p>
          </div>

          {/* FRAGENANZAHL */}
          <div
            className="
    inline-flex items-center gap-2
    h-[32px] px-3
    rounded-full
    w-fit
  "
            style={{
              background: "#f5f0e6",
            }}
          >
            <span
              className="
    text-sm font-semibold 
    text-[hsl(30_10%_25%)]
  "
            >
              Anzahl der Fragen:
            </span>

            <span
              className="
    text-sm font-bold
    text-[hsl(30_10%_25%)]
  "
            >
              {t.questions}
            </span>
          </div>

          {/* BUTTONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={askDelete}
              className="
    w-11 h-10 rounded-xl
    flex items-center justify-center
    transition-colors duration-200
    bg-[#f7f3ea]                       /* Hintergrund wie Fragenanzahl */
    border border-[#f7cfcf] 
     hover:border-[#e88a8a]         /* helleres Rot für Rahmen */
    hover:bg-[#fde8e8]                 /* Hover bleibt rot (sanft) */
  "
            >
              <Trash2 size={18} color="#e74c3c" strokeWidth={2.2} />
            </button>

            <button
              onClick={() => onDuplicate(t)}
              className="
    w-11 h-10 rounded-xl
    flex items-center justify-center
    transition-all duration-200
    bg-[#f7f3ea]                 /* wie Anzahl der Fragen */
    border border-[#c9ddf0]      /* sehr helles Blau (unhover) */
    hover:bg-[#eef5fb]           /* zartes Blau beim Hover */
    hover:border-[#9cc4e8]       /* Rahmen wird stärker beim Hover */
  "
            >
              <Copy size={18} color="#5b8db8" strokeWidth={2.2} />
            </button>

            <button
              onClick={askEdit}
              className="
    w-11 h-10 rounded-xl
    flex items-center justify-center
    transition-all duration-200
    bg-[#f7f3ea]                 /* wie Anzahl der Fragen */
    border border-[#c4e5d6]      /* sehr helles Grün (unhover) */
    hover:bg-[#eaf7f0]           /* zartes Grün beim Hover */
    hover:border-[#8fd1b3]       /* Rahmen wird stärker beim Hover */
  "
            >
              <Edit3 size={18} color="#27ae60" strokeWidth={2.2} />
            </button>

            <button
              onClick={() => onManage(t)}
              className="
    group/manage flex-1 ml-3
    flex items-center justify-center gap-3
    h-10 px-4
    rounded-xl
    font-semibold text-[14.5px]
    transition-colors duration-200
    bg-[hsl(45_80%_55%_/_0.2)]
    hover:bg-[hsl(45_80%_55%_/_0.28)]
    text-[hsl(30_10%_20%)]
    whitespace-nowrap
  "
            >
              <span className="whitespace-nowrap">Fragen Verwalten</span>

              <ArrowRight
                size={16}
                strokeWidth={2.5}
                className="
      transition-transform duration-200
      group-hover/manage:translate-x-2
      shrink-0
    "
              />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Edit Modal ===== */}
      {openEdit && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelEdit();
          }}
        >
          <div
            className="w-full max-w-xl px-4 sm:px-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
              {/* Deko-Glows */}
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-24 -bottom-24 h-52 w-52 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
                aria-hidden="true"
              />

              {/* Inhalt */}
              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">
                  Thema bearbeiten
                </h3>

                <form className="space-y-4">
                  {/* Titel */}
                  <div>
                    <label
                      htmlFor="edit-title"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Titel <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="edit-title"
                      rows={1}
                      maxLength={70}
                      value={editTitle}
                      onChange={(e) => {
                        setEditTitle(e.target.value);

                        // ⭐ Auto-Resize
                        e.currentTarget.style.height = "auto";
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                      }}
                      className="
    w-full
    rounded-xl
    border
    px-3 py-2.5
    text-sm
    bg-slate-50
    border-slate-200
    outline-none
    resize-none
    overflow-hidden
    leading-snug
    break-words
    overflow-wrap-anywhere
    focus:bg-white
    focus:border-[#E3BB62]
    focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
    transition
  "
                    />

                  </div>

                  {/* Beschreibung */}
                  <div>
                    <label
                      htmlFor="edit-subtitle"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Beschreibung
                    </label>
                    <textarea
                      id="edit-subtitle"
                      className="
                      w-full rounded-xl border px-3 py-2.5 text-sm
                      bg-slate-50
                      border-slate-200
                      outline-none
                      focus:bg-white
                      focus:border-[#E3BB62]
                      focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                      transition
                    "
                      rows={3}
                      value={editSubtitle}
                      onChange={(e) => setEditSubtitle(e.target.value)}
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Buttons außerhalb des Modals */}
            <div className="h-3" />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={updating}
                className="
                flex-1
                h-12
                text-sm font-medium
                text-slate-800
                bg-[#f3f3f3]
                hover:bg-[#e5e5e5]
                border border-slate-200
                rounded-xl
                disabled:opacity-60
                transition
              "
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={confirmEdit}
                disabled={updating}
                className="
                flex-1
                h-12
                text-sm font-semibold
                rounded-xl
                bg-[#E3BB62]
                text-[#264555]
                hover:bg-[#d8ac55]
                shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                transition
                hover:-translate-y-[1px]
                disabled:opacity-60
              "
              >
                {updating ? "Speichere…" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirm Modal ===== */}
      <ConfirmModal
        open={openDelete}
        title="Thema löschen?"
        description={
          <>
            Willst du das Thema{" "}
            <span className="font-semibold break-words overflow-wrap-anywhere ">
              {t.title}
            </span>{" "}
            wirklich löschen?
          </>
        }
        hintTitle="Hinweis"
        hintText={
          <>
            Diese Aktion kann{" "}
            <span className="font-semibold text-red-700">
              nicht rückgängig gemacht
            </span>{" "}
            werden.
          </>
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmLabel="Löschen"
        cancelLabel="Abbrechen"
        icon={<Trash2 className="text-red-500" />}
      />
    </>
  );
};

export default React.memo(TopicCard);
