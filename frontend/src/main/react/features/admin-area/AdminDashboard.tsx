import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import myLogo from "@/assets/Zero-6-icons-05.webp";
import { Plus, ArrowRight, MinusSquare } from "lucide-react";

type Stat = { label: string; value: string; tone?: "positive" | "neutral" };
const STATS: Stat[] = [
  { label: "Themenschwerpunkte", value: "4", tone: "positive" },
  { label: "Gesamtfragen", value: "250", tone: "positive" },
  { label: "Aktive Nutzer", value: "89", tone: "positive" },
  { label: "Letzte Änderung", value: "Heute", tone: "neutral" },
];

type Topic = {
  id: string;
  title: string;
  subtitle: string;
  catalog: string;
  questions: number;
  kind: "strategy" | "project" | "sourcing" | "business";
  slug: string;
};

const TOPICS: Topic[] = [
  { id: "t4", title: "IT Operating Model", subtitle: "Organisationsstrukturen und Prozesse", catalog: "Katalog 4", questions: 40, kind: "business", slug: "operating-model" },
  { id: "t1", title: "Enterprise Architecture Management", subtitle: "Strategische IT-Planung und -Ausrichtung", catalog: "Katalog 1", questions: 30, kind: "strategy", slug: "eam" },
  { id: "t2", title: "IT Sourcing", subtitle: "Beschaffung und Lieferantenmanagement", catalog: "Katalog 3", questions: 50, kind: "sourcing", slug: "sourcing" },
  { id: "t3", title: "IT Project Management", subtitle: "Projektplanung und -durchführung", catalog: "Katalog 2", questions: 50, kind: "project", slug: "project-management" },
];

const EMOJI: Record<Topic["kind"], string> = { strategy: "🎯", project: "📊", sourcing: "🤝", business: "⚙️" };

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      {/* ===== Hero ===== */}
      <header className="relative bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] pt-4 pb-4 px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0"
          style={{ top: "calc(var(--header-height) - 1px)", height: 0, boxShadow: "0 10px 16px -14px rgba(15,23,42,.18)" }}
        />

        <div className="flex items-center justify-center gap-4">
          <img
            src={myLogo}
            alt="Dein Logo"
            className="h-[200px] w-[200px] object-contain shrink-0"
            width={200}
            height={200}
          />
          <div className="text-center">
            <h1 className="text-[clamp(28px,6vw,56px)] font-extrabold tracking-[-0.02em] mb-2 leading-[1.05] text-[#264555]">
              Fragenkatalog Administration
            </h1>
            <p className="mt-0 text-[#334155]/90 text-[clamp(14px,1.6vw,18px)]">
              Verwalten Sie Ihre Themenschwerpunkte und erstellen Sie finale Kataloge für Kunden
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-8 mt-1">
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#264555] text-white text-sm font-semibold shadow-md hover:bg-[#223e4c] focus:outline-none focus:ring-2 focus:ring-white/30 active:translate-y-px"
            onClick={() => navigate("/admin/adminPanel")}
          >
            <MinusSquare size={16} />
            <span>Admin-Panal</span>
          </button>
        </div>
      </header>

      {/* ===== Content ===== */}
      <div className="p-8">
        {/* Stats */}
        <section className="mt-5 mb-8">
          {/* 1 Spalte (mobile), 2 Spalten ab md, 3 Spalten ab 1200px (arbitrary breakpoint) */}
          <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-3 gap-4">
            {STATS.map((s, i) => {
              const topBars = [
                "linear-gradient(90deg,#4F6B7E,#7B93A6)",
                "linear-gradient(90deg,#3B82F6,#60A5FA)",
                "linear-gradient(90deg,#16A34A,#34D399)",
                "linear-gradient(90deg,#F59E0B,#FBBF24)",
              ];
              return (
                <div
                  key={i}
                  className="relative bg-white border border-[hsl(var(--border))] rounded-[12px] shadow-[0_10px_20px_-15px_rgba(15,23,42,.18)] overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-[3px] opacity-70" style={{ background: topBars[i] ?? topBars[0] }} />
                  <div className="flex items-center justify-between py-[1.1rem] px-5">
                    <div className="flex flex-col items-start">
                      <p className="text-[0.9rem] font-semibold tracking-[.01em] text-[#64748B]">{s.label}</p>
                      <p className="text-[2rem] leading-[1.1] font-extrabold tracking-[-.01em] text-[#0F172A] mt-1 -translate-x-[4px] md:-translate-x-[2px]">
                        {s.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Topics */}
        <section className="mb-8">
          <div className="flex items-center justify-between gap-3 flex-nowrap mb-6">
            <h2 className="text-[1.25rem] font-semibold">Themenschwerpunkte</h2>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-[var(--shadow-elegant)] whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, hsl(var(--caramel)), hsl(var(--caramel-2)))", transition: "var(--transition-smooth)" }}
            >
              <Plus size={16} />
              <span>Neues Thema hinzufügen</span>
            </button>
          </div>

          {/* 1 Spalte mobil, 2 Spalten ab 1200px */}
          <div className="grid grid-cols-1 min-[1200px]:grid-cols-2 gap-7">
            {TOPICS.map((t) => {
              const accents: Record<Topic["kind"], { card: string; btn: string }> = {
                strategy: { card: "linear-gradient(90deg,#5F7D92,#4F6B7E)", btn: "linear-gradient(135deg,#5F7D92,#4F6B7E)" },
                project: { card: "linear-gradient(90deg,#D1C7B8,#C6BBAA)", btn: "linear-gradient(135deg,#D1C7B8,#C6BBAA)" },
                sourcing: { card: "linear-gradient(90deg,#24414C,#1B3541)", btn: "linear-gradient(135deg,#24414C,#1B3541)" },
                business: { card: "linear-gradient(90deg,#7B7D7F,#6F7173)", btn: "linear-gradient(135deg,#7B7D7F,#6F7173)" },
              };

              return (
                <div
                  key={t.id}
                  className="relative bg-white border border-[hsl(var(--border))] rounded-[12px] shadow-[0_10px_20px_-15px_rgba(15,23,42,.18)] p-5 pt-[1.25rem] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(.4,0,.2,1)] hover:shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.3)] hover:-translate-y-[1px]"
                >
                  <div className="absolute inset-x-0 top-0 h-[10px] rounded-t-[12px]" style={{ background: accents[t.kind].card }} />
                  <ArrowRight className="absolute right-[18px] top-[14px] text-[hsl(var(--muted-foreground))] opacity-60" size={20} />

                  <div className="flex items-center gap-2 mt-[.25rem]">
                    <span aria-hidden className="text-[20px] leading-none w-7 h-7 flex items-center justify-center rounded-[6px] bg-[hsl(var(--muted))]">
                      {EMOJI[t.kind]}
                    </span>
                    <h3 className="text-[1.125rem] font-bold text-[hsl(var(--foreground))]">{t.title}</h3>
                  </div>

                  <ul className="list-disc text-[hsl(var(--muted-foreground))] ml-5 my-2 mb-4">
                    <li>{t.subtitle}</li>
                  </ul>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 text-[hsl(var(--muted-foreground))]">
                      <span className="text-[hsl(var(--foreground))]">{t.catalog}</span>{" "}
                      <span>
                        Fragen: <strong className="font-semibold text-[hsl(var(--foreground))]">{t.questions}</strong>
                      </span>
                    </div>

                    <Link
                      to={`/admin/topics/${t.slug}`}
                      className="inline-flex items-center gap-[.45rem] px-[.9rem] py-[.55rem] rounded-lg font-semibold text-white whitespace-nowrap shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.3)]"
                      style={{ background: accents[t.kind].btn }}
                    >
                      Verwalten <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
