import React, { useMemo, useState } from "react";
import AppHeader from "@/apps/app/AppHeader";
import patternUrl from "@/assets/footer-pattern.svg";
import { MapPin, Clock, Send, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

type Topic =
  | "Allgemeine Anfrage"
  | "Support / Problem"
  | "Einladung / Zugang"
  | "Beratung / Demo"
  | "Feedback";

const CAP = {
  company: "cap consulting GmbH",
  addressLines: ["Potsdamer Str. 150", "33719 Bielefeld"],
  phone: "+49 521 999 883 00",
  email: "kontakt@cap-consulting.de",
};

export default function ContactPagePublic() {
  const [topic, setTopic] = useState<Topic>("Allgemeine Anfrage");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Map Consent (lädt iFrame erst nach Klick)
  const [mapAllowed, setMapAllowed] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({
    visible: false,
    title: "",
    description: "",
  });

  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((title: string, description: string) => {
    setToast({ visible: true, title, description });

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!email.trim()) return false;
    if (!message.trim()) return false;
    return true;
  }, [name, email, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Kein Inline-Message mehr – nur Toast
    if (!canSubmit) {
      showToast("Fehler", "Bitte prüfen Sie die Pflichtfelder: Name, E-Mail, Nachricht.");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: hier an euer Backend / Ticket-System senden
      await new Promise((r) => setTimeout(r, 700));
      showToast("Erfolgreich", "Ihre Nachricht wurde gesendet.");
    } catch {
      showToast("Fehler", "Konnte die Anfrage nicht senden. Bitte erneut versuchen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-200 text-[hsl(215_80%_15%)]">
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

      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-64">
        <div className="absolute inset-0 opacity-[0.14] hex-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_55%)]" />
        <div className="absolute bottom-10 left-[-6rem] h-[22rem] w-[22rem] rounded-full blur-[90px] bg-[hsla(215,80%,15%,0.10)]" />
        <div className="absolute left-[18%] top-[30%] h-2 w-2 rounded-full bg-[#E3BB62] opacity-80" />
        <div className="absolute left-[26%] top-[42%] h-1.5 w-1.5 rounded-full bg-[#d2c9b9] opacity-75" />
        <div className="absolute right-[22%] top-[36%] h-1.5 w-1.5 rounded-full bg-[#E3BB62] opacity-70" />
      </div>

      <AppHeader />

      {/* ===== Toast wie AssessmentPage (ohne doppelte Inline-Message) ===== */}
      {toast.visible && (
        <div className="fixed right-8 top-8 z-[9999]">
          <div className="flex items-start gap-3 rounded-md border border-[#b7d8ad] bg-[#dff2d8] px-4 py-3 shadow-lg">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-[#1f3a1f]">
              ✓
            </div>
            <div className="leading-tight text-[#1f3a1f]">
              <div className="font-semibold">{toast.title}</div>
              <div className="font-medium">{toast.description}</div>
            </div>
          </div>
        </div>
      )}

      {/* ======= Content ======= */}
      <section className="pt-10 pb-8 px-5">
        <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
          {/* HERO */}
          <div className="relative rounded-3xl border-2 border-slate-200/90 bg-white/60 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)] overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_55%)]" />
            <div className="relative p-5 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="max-w-[48rem]">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-sm text-slate-700 border border-slate-200 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#E3BB62]" />
                    Kontakt
                  </div>

                  <h1 className="mt-3 text-[34px] leading-[1.05] font-bold tracking-tight text-[#264555] sm:text-5xl">
                    Schreiben Sie uns
                  </h1>
                  <p className="mt-4 text-lg leading-8 text-slate-700">
                    Für ICA³: Support, Zugang/Einladung, Feedback oder eine Demo-Anfrage.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm text-slate-700 border border-slate-200 shadow-sm">
                    <Clock className="h-4 w-4 text-slate-500" />
                    Antwort i. d. R. innerhalb 1–2 Werktage
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRID: Form + Side */}
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* FORM */}
            <div className="rounded-3xl border-2 border-slate-200/90 bg-white/60 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)] overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-200/70">
                <h2 className="text-lg font-semibold text-[#264555]">Anfrage senden</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Pflichtfelder: Name, E-Mail, Nachricht.
                </p>
              </div>

              <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name *">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass()}
                      placeholder="Vor- und Nachname"
                    />
                  </Field>

                  <Field label="Unternehmen">
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className={inputClass()}
                      placeholder="Optional"
                    />
                  </Field>

                  <Field label="E-Mail *">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass()}
                      placeholder="name@firma.de"
                      type="email"
                    />
                  </Field>

                  <Field label="Telefon">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass()}
                      placeholder="Optional"
                      type="tel"
                    />
                  </Field>
                </div>

                <Field label="Thema">
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as Topic)}
                    className={inputClass()}
                  >
                    <option>Allgemeine Anfrage</option>
                    <option>Support / Problem</option>
                    <option>Einladung / Zugang</option>
                    <option>Beratung / Demo</option>
                    <option>Feedback</option>
                  </select>
                </Field>

                <Field label="Nachricht *">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={inputClass("min-h-[140px] resize-y")}
                    placeholder="Beschreibe kurz dein Anliegen (bei Support: URL, Uhrzeit, Browser, Screenshot)."
                  />
                </Field>

                {/* SUBMIT BUTTON (mailto) */}
                <button
                  type="button"
                  disabled={!canSubmit || submitting}
                  onClick={() => {
                    if (!canSubmit) {
                      showToast("Fehler", "Bitte prüfen Sie die Pflichtfelder: Name, E-Mail, Nachricht.");
                      return;
                    }

                    const mailto = createMailtoUrl({
                      to: CAP.email,
                      topic,
                      name,
                      company,
                      email,
                      phone,
                      message,
                    });

                    showToast(
                      "Erfolgreich",
                      "Die E-Mail wurde vorbereitet. Bitte senden Sie sie in Ihrem Mailprogramm ab."
                    );

                    window.location.href = mailto;
                  }}
                  className="
                    w-full py-3 rounded-xl text-white font-semibold transition-all shadow-sm
                    bg-[linear-gradient(135deg,#315c8c_0%,#264555_100%)]
                    hover:brightness-105 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0
                    disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm
                    inline-flex items-center justify-center gap-2
                  "
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Anfrage senden
                </button>
              </form>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6">
              {/* Address / Office */}
              <div className="rounded-3xl border-2 border-slate-200/90 bg-white/60 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)] overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/85 border border-slate-200 shadow-sm text-[#264555]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#264555]">Adresse</h3>
                      <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                        {CAP.company}
                        <br />
                        {CAP.addressLines[0]}
                        <br />
                        {CAP.addressLines[1]}
                      </p>
                    </div>
                  </div>

                  {/* Map placeholder / consent */}
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
                    {!mapAllowed ? (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-600">
                          Google Maps wird erst geladen, wenn du zustimmst (Datenübertragung an Drittanbieter).
                        </p>

                        <button
                          type="button"
                          onClick={() => setMapAllowed(true)}
                          className="w-full rounded-xl bg-[#E3BB62] px-4 py-2 text-sm font-semibold text-[#264555] hover:brightness-95"
                        >
                          Karte laden
                        </button>
                      </div>
                    ) : (
                      <iframe
                        title="Google Maps"
                        className="h-64 w-full rounded-xl border border-slate-200"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src="https://www.google.com/maps?q=Potsdamer%20Str.%20150%2033719%20Bielefeld&output=embed"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Support checklist (ICA3-typisch) */}
              <div className="rounded-3xl border-2 border-slate-200/90 bg-white/60 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.22)] overflow-hidden">
                <div className="p-5 sm:p-6">
                  <h3 className="text-sm font-semibold text-[#264555]">Für Support-Anfragen</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Bitte direkt in die Nachricht kopieren:
                  </p>

                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#E3BB62]" />
                      URL / Seite
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#E3BB62]" />
                      Uhrzeit / Datum
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#E3BB62]" />
                      Browser + Version
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#E3BB62]" />
                      Screenshot / Fehlermeldung (401/403/500)
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ======= Footer (wie bei dir) ======= */}
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
            <h4 className="text-2xl font-semibold">{CAP.company}</h4>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="text-center md:text-left">
              <p className="leading-relaxed">
                {CAP.addressLines[0]}
                <br />
                {CAP.addressLines[1]}
              </p>

              <p className="mt-3">
                <a href={`tel:${CAP.phone.replace(/\s+/g, "")}`} className="underline-offset-2 hover:underline">
                  Tel.: {CAP.phone}
                </a>
              </p>

              <p className="mt-1">
                <a href={`mailto:${CAP.email}`} className="underline-offset-2 hover:underline">
                  {CAP.email}
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
              <p className="m-0">©2022 {CAP.company}</p>
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

/* ---------------- UI helpers ---------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function inputClass(extra?: string) {
  return [
    "w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3",
    "text-sm text-slate-800 shadow-sm outline-none",
    "focus:border-slate-300 focus:ring-2 focus:ring-[#E3BB62]/25",
    extra ?? "",
  ].join(" ");
}

const GAP = "\u00A0"; // Non-breaking space (sichtbar als leere Zeile)

function joinWithSpacing(lines: string[]) {
  // nach jeder Zeile eine "leere" Zeile erzwingen
  return lines.flatMap((l) => [l, GAP]).join("\r\n");
}

function createMailtoUrl(args: {
  to: string;
  topic: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}) {
  const subject = `Kontaktanfrage: ${args.topic}`;

  const lines = [
    "Hallo cap consulting Team,",
    "ich möchte Sie kontaktieren und habe folgende Anfrage:",
    "",
    `Thema: ${args.topic}`,
    `Name: ${args.name}`,
    args.company?.trim() ? `Unternehmen: ${args.company.trim()}` : "Unternehmen: -",
    `E-Mail: ${args.email}`,
    args.phone?.trim() ? `Telefon: ${args.phone.trim()}` : "Telefon: -",
    "",
    "Nachricht:",
    (args.message || "-").trim(),
    "",
    "Mit freundlichen Grüßen",
    args.name,
  ];

  const body = joinWithSpacing(lines);

  return `mailto:${encodeURIComponent(args.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
