// src/apps/landing/HelpFaqPublic.tsx
import React, { useMemo, useState } from "react";
import AppHeader from "@/shared/app/AppHeader";
import patternUrl from "@/assets/footer-pattern.svg";
import {
  Search,
  HelpCircle,
  ChevronDown,
  LifeBuoy,
  ShieldCheck,
  Lock,
  FileText,
  BarChart3,
  Users,
  Settings,
  Link as LinkIcon,
} from "lucide-react";

type FaqCategory =
  | "Allgemein"
  | "Login & Zugang"
  | "Assessment"
  | "Themen & Kataloge"
  | "Ergebnisse"
  | "Rollen & Rechte"
  | "Technik"
  | "Datenschutz";

type FaqItem = {
  id: string;
  category: FaqCategory;
  q: string;
  a: React.ReactNode;
  keywords?: string[];
};

const CATEGORY_META: Record<FaqCategory, { icon: React.ReactNode; hint: string }> = {
  Allgemein: { icon: <HelpCircle className="h-5 w-5" />, hint: "Überblick, Zweck und Basics" },
  "Login & Zugang": { icon: <Lock className="h-5 w-5" />, hint: "Einladung, Passwort, Zugriff" },
  Assessment: { icon: <FileText className="h-5 w-5" />, hint: "Beantworten, Speichern, Ablauf" },
  "Themen & Kataloge": { icon: <Settings className="h-5 w-5" />, hint: "Zuweisung, Struktur, Inhalte" },
  Ergebnisse: { icon: <BarChart3 className="h-5 w-5" />, hint: "Scores, Diagramme, Export" },
  "Rollen & Rechte": { icon: <Users className="h-5 w-5" />, hint: "Berechtigungen, Sichtbarkeit" },
  Technik: { icon: <LifeBuoy className="h-5 w-5" />, hint: "Fehlerbilder, Browser, Cache" },
  Datenschutz: { icon: <ShieldCheck className="h-5 w-5" />, hint: "Daten, Zugriff, Aufbewahrung" },
};

const FAQ: FaqItem[] = [
  {
    id: "gen-what",
    category: "Allgemein",
    q: "Was ist ICA³?",
    a: (
      <p className="leading-relaxed">
        ICA³ ist eine Plattform für strukturierte Assessments (z. B. digitale Reifegrade)
        inklusive Auswertung und Analytics.
      </p>
    ),
    keywords: ["ica3", "assessment", "analytics", "reifegrad"],
  },
  {
    id: "login-invite",
    category: "Login & Zugang",
    q: "Ich habe einen Einladungslink – wie starte ich?",
    a: (
      <div className="space-y-2 leading-relaxed">
        <p>Öffne den Einladungslink und folge dem Flow bis zur ersten Frage.</p>
        <p className="text-sm opacity-80">Hinweis: Einladungen können ablaufen.</p>
      </div>
    ),
    keywords: ["einladung", "invite", "token", "link"],
  },
  {
    id: "assess-pause",
    category: "Assessment",
    q: "Kann ich ein Assessment unterbrechen und später fortsetzen?",
    a: (
      <p className="leading-relaxed">
        In der Regel ja: der Fortschritt wird gespeichert und später fortgesetzt (abhängig von eurer Konfiguration).
      </p>
    ),
    keywords: ["fortsetzen", "pause", "progress", "save"],
  },
  {
    id: "results-export",
    category: "Ergebnisse",
    q: "Kann ich Ergebnisse als PDF exportieren?",
    a: (
      <p className="leading-relaxed">
        Wenn der Export aktiviert ist, findest du ihn im Ergebnisbereich über „Export/PDF“.
      </p>
    ),
    keywords: ["pdf", "export"],
  },
  {
    id: "tech-white",
    category: "Technik",
    q: "Die Seite bleibt weiß oder lädt endlos – was kann ich tun?",
    a: (
      <ul className="list-disc pl-5 space-y-1 leading-relaxed">
        <li>Hard-Reload (Strg+F5) und Cache leeren</li>
        <li>In anderem Browser testen</li>
        <li>DevTools Console/Network prüfen</li>
        <li>Support kontaktieren mit Screenshot + Uhrzeit + URL</li>
      </ul>
    ),
    keywords: ["weiß", "loading", "cache", "console"],
  },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

/* ================== Seite: HelpFaqPublic (gleiches BG/Pattern wie dein KatalogThemenPublic) ================== */
export default function HelpFaqPublic() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<FaqCategory | "Alle">("Alle");
  const [openId, setOpenId] = useState<string | null>(FAQ[0]?.id ?? null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(FAQ.map((x) => x.category)));
    return unique as FaqCategory[];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ.filter((item) => {
      const catOk = activeCat === "Alle" || item.category === activeCat;
      if (!catOk) return false;
      if (!q) return true;

      const hay = [item.q, item.category, ...(item.keywords ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeCat]);

  const grouped = useMemo(() => {
    const map = new Map<FaqCategory, FaqItem[]>();
    for (const item of filtered) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div
      className="
        relative min-h-screen overflow-hidden
        bg-gray-200
        text-[hsl(215_80%_15%)]
      "
    >
      {/* ======= exakt dein Background-Setup (Hex + Glows + Dots; Footer bleibt frei) ======= */}
      <style>{`
        .hex-bg{
          background-image:
            conic-gradient(from 60deg, rgba(38,69,85,0.16) 0 60deg, transparent 0 360deg),
            conic-gradient(from 60deg, rgba(38,69,85,0.10) 0 60deg, transparent 0 360deg);
          background-size: 520px 450px;
          background-position: 0 0, 260px 225px;
          filter: blur(0.2px);
        }
      `}</style>

      {/* Deko nur im Content-Bereich, NICHT hinter dem Footer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-64">
        <div className="absolute inset-0 opacity-[0.14] hex-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_55%)]" />
        <div className="absolute bottom-10 left-[-6rem] h-[22rem] w-[22rem] rounded-full blur-[90px] bg-[hsla(215,80%,15%,0.10)]" />
        <div className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-[#E3BB62] opacity-80" />
        <div className="absolute left-[26%] top-[42%] h-1.5 w-1.5 rounded-full bg-[#d2c9b9] opacity-75" />
        <div className="absolute right-[22%] top-[36%] h-1.5 w-1.5 rounded-full bg-[#E3BB62] opacity-70" />
      </div>

      <AppHeader />

      {/* ======= Content ======= */}
      <section className="pt-10 pb-8 px-5">
        <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
          {/* Hero Card (gleicher Look wie Greeting Banner Box) */}
          <div
            className="
              relative
              rounded-3xl
              border-2 border-slate-200/90
              bg-white/60
              shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)]
              overflow-hidden
            "
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_55%)]" />

            <div className="relative p-5 sm:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[48rem]">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-sm text-slate-700 border border-slate-200 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#E3BB62]" />
                    ICA³ Hilfe
                  </div>

                  <h1 className="mt-3 text-[34px] leading-[1.05] font-bold tracking-tight text-[#264555] sm:text-5xl">
                    Häufige Fragen (FAQ)
                  </h1>

                  <p className="mt-4 text-lg leading-8 text-slate-700">
                    Antworten zu Login, Einladungen, Assessments, Auswertung,
                    Rollen/Rechten und technischen Problemen.
                  </p>
                </div>

                {/* Search */}
                <div className="w-full md:w-[420px]">
                  <label className="sr-only" htmlFor="faq-search">
                    Suche
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 shadow-sm focus-within:border-slate-300">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                      id="faq-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Suchen… (z. B. Einladung, PDF, Radar, 403)"
                      className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-slate-400"
                    />
                    {query.trim() ? (
                      <button
                        onClick={() => setQuery("")}
                        className="rounded-xl px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                        type="button"
                      >
                        Reset
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <QuickTag label="Einladung" onClick={() => setQuery("einladung")} />
                    <QuickTag label="Passwort" onClick={() => setQuery("passwort")} />
                    <QuickTag label="PDF" onClick={() => setQuery("pdf")} />
                    <QuickTag label="Radar" onClick={() => setQuery("radar")} />
                    <QuickTag label="403" onClick={() => setQuery("403")} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip active={activeCat === "Alle"} onClick={() => setActiveCat("Alle")}>
                      Alle
                    </Chip>
                    {categories.map((c) => (
                      <Chip key={c} active={activeCat === c} onClick={() => setActiveCat(c)}>
                        {c}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* FAQ list */}
            <div className="space-y-6">
              {filtered.length === 0 ? (
                <div className="rounded-3xl border-2 border-slate-200/90 bg-white/60 p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)]">
                  <p className="text-sm text-slate-600">
                    Keine Treffer. Versuche andere Keywords (z. B. „Einladung“, „Export“, „Rolle“, „Cache“).
                  </p>
                </div>
              ) : (
                Array.from(grouped.entries()).map(([cat, items]) => (
                  <section
                    key={cat}
                    className="
                      rounded-3xl
                      border-2 border-slate-200/90
                      bg-white/60
                      shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)]
                      overflow-hidden
                    "
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 p-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/85 border border-slate-200 shadow-sm text-[#264555]">
                          {CATEGORY_META[cat].icon}
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-[#264555]">{cat}</h2>
                          <p className="text-sm text-slate-600">{CATEGORY_META[cat].hint}</p>
                        </div>
                      </div>

                      <span className="rounded-full bg-white/85 px-3 py-1 text-xs text-slate-600 border border-slate-200 shadow-sm">
                        {items.length} {items.length === 1 ? "Eintrag" : "Einträge"}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200/70">
                      {items.map((item) => {
                        const isOpen = openId === item.id;
                        return (
                          <div key={item.id} id={slugify(item.q)}>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/35"
                              onClick={() => setOpenId(isOpen ? null : item.id)}
                              aria-expanded={isOpen}
                            >
                              <span className="text-sm font-medium text-slate-800">{item.q}</span>
                              <ChevronDown
                                className={cx(
                                  "h-5 w-5 shrink-0 text-slate-400 transition-transform",
                                  isOpen && "rotate-180"
                                )}
                              />
                            </button>

                            <div
                              className={cx(
                                "grid transition-[grid-template-rows] duration-300 ease-out",
                                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                              )}
                            >
                              <div className="overflow-hidden">
                                <div className="px-5 pb-5 text-sm text-slate-700">
                                  {item.a}

                                  <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <CopyAnchor href={`#${slugify(item.q)}`} />
                                    {item.keywords?.slice(0, 4).map((k) => (
                                      <span
                                        key={k}
                                        className="rounded-full border border-slate-200 bg-white/85 px-2 py-1 text-xs text-slate-600 shadow-sm"
                                      >
                                        {k}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div
                className="
                  rounded-3xl
                  border-2 border-slate-200/90
                  bg-white/60
                  shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)]
                  overflow-hidden
                "
              >
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/85 border border-slate-200 shadow-sm text-[#264555]">
                      <LifeBuoy className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#264555]">Noch Hilfe nötig?</h3>
                      <p className="text-sm text-slate-600">Diese Infos an Support senden:</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <InfoRow label="URL" value="(Seite/Route kopieren)" />
                    <InfoRow label="Uhrzeit" value="(Wann passiert?)" />
                    <InfoRow label="Fehler" value="(401/403/500 + Screenshot)" />
                    <InfoRow label="Browser" value="(z. B. Edge/Chrome)" />
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
                    <p className="text-xs text-slate-600">
                      Tipp: DevTools → Console/Network öffnen und Fehlermeldungen kopieren.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  rounded-3xl
                  border-2 border-slate-200/90
                  bg-white/60
                  shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)]
                  overflow-hidden
                "
              >
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-[#264555]">Quick Links</h3>
                  <div className="mt-3 space-y-2">
                    <SidebarLink
                      icon={<Lock className="h-4 w-4" />}
                      title="Login & Zugang"
                      subtitle="Einladung, Passwort, Rechte"
                      onClick={() => setActiveCat("Login & Zugang")}
                    />
                    <SidebarLink
                      icon={<FileText className="h-4 w-4" />}
                      title="Assessment"
                      subtitle="Ablauf, Speichern, Bedingungen"
                      onClick={() => setActiveCat("Assessment")}
                    />
                    <SidebarLink
                      icon={<BarChart3 className="h-4 w-4" />}
                      title="Ergebnisse"
                      subtitle="Charts, Scores, PDF"
                      onClick={() => setActiveCat("Ergebnisse")}
                    />
                    <SidebarLink
                      icon={<ShieldCheck className="h-4 w-4" />}
                      title="Datenschutz"
                      subtitle="Zugriff, Daten, Aufbewahrung"
                      onClick={() => setActiveCat("Datenschutz")}
                    />
                    <SidebarLink
                      icon={<Users className="h-4 w-4" />}
                      title="Rollen & Rechte"
                      subtitle="Rollen, Permissions"
                      onClick={() => setActiveCat("Rollen & Rechte")}
                    />
                    <SidebarLink
                      icon={<Settings className="h-4 w-4" />}
                      title="Themen & Kataloge"
                      subtitle="Zuweisung, Inhalte"
                      onClick={() => setActiveCat("Themen & Kataloge")}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-[#264555] p-5 text-white shadow-sm border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                    <LinkIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Direktlink teilen</h3>
                    <p className="text-xs text-white/75">Pro Frage „Copy Link“ nutzen.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ======= Footer: 1:1 wie dein Beispiel (Pattern + Links) ======= */}
      <footer
        id="cap-footer"
        style={{ ["--cap-pattern" as any]: `url(${patternUrl})` }}
        className="
          relative
          text-white
          bg-[#264555]
          [background-image:var(--cap-pattern)]
          bg-repeat bg-left-top
          [background-size:170px]
          py-16 pb-8
          border-t border-white/15
        "
      >
        <div className="container mx-auto px-6">
          <div className="pb-6 text-center">
            <h4 className="text-2xl font-semibold">cap consulting GmbH</h4>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="text-center md:text-left">
              <p className="leading-relaxed">
                Potsdamer Str. 150
                <br />
                33719 Bielefeld
              </p>

              <p className="mt-3">
                <a href="tel:+4952199988300" className="underline-offset-2 hover:underline">
                  Tel.: +49 521 999 883 00
                </a>
              </p>

              <p className="mt-1">
                <a href="mailto:kontakt@cap-consulting.de" className="underline-offset-2 hover:underline">
                  kontakt@cap-consulting.de
                </a>
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="font-semibold">Up-to-date mit unserem IT-Newsletter</p>
              <a
                href="https://www.cap-consulting.de/newsletter-anmeldung/"
                className="
                  mt-2 inline-flex items-center
                  rounded-md bg-[#E3BB62] px-5 py-2
                  font-medium text-[#264555]
                  shadow hover:brightness-95
                "
              >
                Ich möchte aktuell bleiben
              </a>
            </div>
          </div>

          <div className="mt-10 border-white/20 pt-4">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center text-white/90 lg:flex-row lg:justify-evenly">
              <p className="m-0">©2022 cap consulting GmbH</p>
              <a className="hover:underline underline-offset-2" href="https://www.cap-consulting.de/impressum/">
                Impressum
              </a>
              <a className="hover:underline underline-offset-2" href="https://www.cap-consulting.de/datenschutzerklaerung/">
                Datenschutz
              </a>
              <a className="hover:underline underline-offset-2" href="https://www.cap-consulting.de/haftungsausschluss/">
                Haftungsausschluss
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- UI bits ---------- */

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "relative -bottom-[2px] px-4 py-2 border-b-[3px] font-medium transition-all rounded-t-xl",
        active
          ? "border-[#E3BB62] text-[#264555] bg-white"
          : "border-transparent text-slate-500 hover:text-[#264555]/80 bg-transparent"
      )}
    >
      {children}
    </button>
  );
}

function QuickTag({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-white/85 px-3 py-1 text-xs text-slate-700 border border-slate-200 shadow-sm hover:bg-white"
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs text-slate-700">{value}</span>
    </div>
  );
}

function SidebarLink({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex w-full items-center gap-3 rounded-2xl
        border border-slate-200 bg-white/85 px-3 py-3 text-left
        hover:bg-white shadow-sm
      "
    >
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7f8fb] border border-slate-200 text-[#264555]">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-800">{title}</div>
        <div className="text-xs text-slate-600">{subtitle}</div>
      </div>
      <ChevronDown className="ml-auto h-4 w-4 -rotate-90 text-slate-300" />
    </button>
  );
}

function CopyAnchor({ href }: { href: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      const url = new URL(window.location.href);
      url.hash = href;
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-2 py-1 text-xs text-slate-700 shadow-sm hover:bg-white"
      title="Link kopieren"
    >
      <LinkIcon className="h-3.5 w-3.5" />
      {copied ? "Kopiert" : "Copy Link"}
    </button>
  );
}
