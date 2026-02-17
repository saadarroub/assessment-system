import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  Copy,
  Check,
  Link as LinkIcon,
  FileDown,
  Network,
  Trash2,
  KeyRound,
  Mail,
  FileText,
  Paintbrush,
  X,
} from "lucide-react";
import AdminLayout from "@/shared/app/AdminLayout";
import {
  listAssignments,
  type AssignmentApi,
  deleteAssignment,
  updateAssignmentExpires,
} from "@/shared/service/assignmentService";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";
import { useToast } from "@/shared/contexts/ToastContext";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { jsPDF } from "jspdf";
import capConsultingTemplate from "@/assets/cap-template-a4.png"
import { useScrollLock } from "@/shared/hooks/useScrollLock";

type SortKey =
  | "worker"
  | "catalog"
  | "status"
  | "assignedAt"
  | "expiresAt"
  | "completedAt";

const CSS = {
  adminBg: "hsl(var(--admin-bg,0 0% 92%))",
  card: "hsl(var(--card,0 0% 98%))",
  border: "hsl(var(--border,30 15% 85%))",
  fg: "hsl(var(--foreground,205 35% 24%))",
  mutedFg: "hsl(var(--muted-foreground,0 0% 50%))",
  muted: "hsl(var(--muted,210 40% 97%))",
};

const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

/*  Helper: Datum / Uhrzeit in zwei Zeilen  */

const isExpired = (iso?: string | null) =>
  !!iso && new Date(iso).getTime() < Date.now();

const fmtParts = (d?: string | null) => {
  if (!d) return { date: "—", time: "" };
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return { date: d, time: "" };
  return {
    date: dt.toLocaleDateString("de-DE"),
    time: dt.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
};

function Badge({ status }: { status?: string | null }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "completed"
      ? "bg-[rgb(220,252,231)] text-[rgb(22,101,52)]"
      : s === "expired"
        ? "bg-[rgb(254,226,226)] text-[rgb(153,27,27)]"
        : s === "blocked"
          ? "bg-[rgb(226,232,240)] text-[rgb(71,85,105)]"
          : "bg-[rgb(219,234,254)] text-[rgb(30,64,175)]";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}
    >
      {status || "pending"}
    </span>
  );
}

export default function Zuweisungen() {
  const { showSuccess, showError } = useToast();
type AssignmentsLocationState = { assignments?: AssignmentApi[] };

const location = useLocation();
const navState = location.state as AssignmentsLocationState | null;

const initial = navState?.assignments ?? [];

  const [rows, setRows] = useState<AssignmentApi[]>(initial);
  const [loading, setLoading] = useState(!initial.length);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("assignedAt");
  const [asc, setAsc] = useState(false);

  const [inviteFor, setInviteFor] = useState<AssignmentApi | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Email Modal State
  const [emailModalFor, setEmailModalFor] = useState<AssignmentApi | null>(null);
  const [copiedDesign, setCopiedDesign] = useState(false);

  // Delete-Flow mit ConfirmModal 
  const [deleteFor, setDeleteFor] = useState<AssignmentApi | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Extend-Flow
  const [extendFor, setExtendFor] = useState<AssignmentApi | null>(null);
  const [newExpiresAt, setNewExpiresAt] = useState(""); // für <input type="datetime-local">
  const [extending, setExtending] = useState(false);
  const [extendError, setExtendError] = useState<string | null>(null);


  const [bgStandardImg, setBgStandardImg] = useState<HTMLImageElement | null>(null);

  const [highlightRowIds, setHighlightRowIds] = useState<Set<string>>(new Set());

  function flashRowIds(ids: string[], ms = 3500) {
    setHighlightRowIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });

    window.setTimeout(() => {
      setHighlightRowIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    }, ms);
  }


  useEffect(() => {
    const imgStd = new Image();
    imgStd.src = capConsultingTemplate;
    imgStd.onload = () => setBgStandardImg(imgStd);
  }, []);

  function buildUserInviteUrl(a: AssignmentApi) {
    const token = a.accessToken || "";
    const APP_ORIGIN = window.location.origin;
    return `${APP_ORIGIN}/invite/${token}`;
  }
  // HTML Email Template Generator
  function createHtmlEmailTemplate(a: AssignmentApi, inviteLink: string): string {
    const workerName = a.worker?.name || "Teilnehmer/in";
    const catalogTitle = a.catalog?.title || "Katalog";
    const expiresDate = a.expiresAt ? new Date(a.expiresAt).toLocaleString("de-DE", {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Einladung zum Assessment</title>
    <style>
        :root {
            color-scheme: light dark;
        }
        
        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
            .email-body {
                background-color: #1a1a2e !important;
            }
            .email-container {
                background-color: #16213e !important;
                border-color: #2a3f5f !important;
            }
            .content-area {
                background-color: #16213e !important;
            }
            .text-dark {
                color: #e8e8e8 !important;
            }
            .text-muted {
                color: #b0b0b0 !important;
            }
            .text-navy {
                color: #7eb8da !important;
            }
            .info-box {
                background-color: #1f2f4a !important;
                border-left-color: #E3BB62 !important;
            }
            .info-text {
                color: #d0d0d0 !important;
            }
            .code-badge {
                background-color: #2a3f5f !important;
                color: #7eb8da !important;
            }
            .link-box {
                background-color: #1f2f4a !important;
            }
            .link-text {
                color: #7eb8da !important;
            }
            .footer-area {
                background-color: #1a1a2e !important;
                border-top-color: #2a3f5f !important;
            }
            .footer-divider {
                border-top-color: #2a3f5f !important;
            }
        }
    </style>
</head>
<body class="email-body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-body" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header - bleibt gleich in beiden Modi -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.steel} 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                ICA³ Assessment
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #ebebec; font-size: 16px;">
                                Einladung zur Teilnahme
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content-area" style="padding: 40px 30px; background-color: #ffffff;">
                            <p class="text-navy" style="margin: 0 0 20px 0; color: ${BRAND.navy}; font-size: 18px; font-weight: 500;">
                                Hallo ${workerName},
                            </p>
                            
                            <p class="text-dark" style="margin: 0 0 25px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Sie wurden eingeladen, am Assessment <strong class="text-navy" style="color: ${BRAND.navy};">"${catalogTitle}"</strong> teilzunehmen.
                            </p>

                            <!-- Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" class="info-box" style="background-color: #f8f8f9; border-left: 4px solid ${BRAND.gold}; border-radius: 6px; margin: 25px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p class="info-text" style="margin: 0 0 15px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                            <strong class="text-navy" style="color: ${BRAND.navy};">📋 Assessment:</strong> ${catalogTitle}
                                        </p>
                                        ${a.accessCode ? `
                                        <p class="info-text" style="margin: 0 0 15px 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                            <strong class="text-navy" style="color: ${BRAND.navy};">🔑 Access-Code:</strong> 
                                            <span class="code-badge" style="background-color: #ffffff; padding: 4px 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-weight: 600; color: ${BRAND.navy};">${a.accessCode}</span>
                                        </p>
                                        ` : ''}
                                        ${expiresDate ? `
                                        <p class="info-text" style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                                            <strong class="text-navy" style="color: ${BRAND.navy};">⏰ Gültig bis:</strong> ${expiresDate}
                                        </p>
                                        ` : ''}
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button - bleibt gleich -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.steel} 100%); color: #E3BB62; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px #E3BB62;">
                                            ▶️ Assessment starten
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p class="text-muted" style="margin: 25px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                Oder kopieren Sie diesen Link in Ihren Browser:
                            </p>
                            <p class="link-box" style="margin: 8px 0 0 0; padding: 12px; background-color: #f8f8f9; border-radius: 6px; word-break: break-all;">
                                <a href="${inviteLink}" class="link-text" style="color: ${BRAND.steel}; font-size: 13px; text-decoration: none;">${inviteLink}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer-area" style="background-color: #f8f8f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p class="text-navy" style="margin: 0 0 10px 0; color: ${BRAND.navy}; font-size: 16px; font-weight: 600;">
                                Viele Grüße
                            </p>
                            <p class="text-muted" style="margin: 0; color: ${BRAND.steel}; font-size: 15px;">
                                Ihr ICA³ Team
                            </p>
                            <div class="footer-divider" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                <p class="text-muted" style="margin: 0; color: #808080; font-size: 12px; line-height: 1.5;">
                                    Diese E-Mail wurde automatisch generiert.
                                </p>
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }

  //  Mail-Versand - öffnet Email-Auswahl Modal
  function handleSendInviteEmail(a: AssignmentApi) {
    const email =
      (a.worker as any)?.email ||
      (a.worker as any)?.mail ||
      a.worker?.id ||
      "";

    if (!email) {
      showError("Für diesen Empfänger ist keine E-Mail-Adresse hinterlegt.");
      return;
    }

    // Öffne Email-Options-Modal
    setEmailModalFor(a);
  }

  // Plain Text Email senden
  function sendPlainTextEmail(a: AssignmentApi) {
    const email =
      (a.worker as any)?.email ||
      (a.worker as any)?.mail ||
      a.worker?.id ||
      "";

    const inviteLink = buildUserInviteUrl(a);

    const subject = encodeURIComponent(
      `Einladung zum Assessment "${a.catalog?.title || "Katalog"}"`
    );

    let body = `Hallo ${a.worker?.name || ""},\n\n`;
    body += "hier ist dein persönlicher Einlade-Link zum Assessment:\n\n";
    body += `${inviteLink}\n\n`;

    if (a.accessCode) {
      body += `Access-Code: ${a.accessCode}\n\n`;
    }

    if (a.expiresAt) {
      body += `Gültig bis: ${new Date(a.expiresAt).toLocaleString("de-DE")}\n\n`;
    }

    body += "Viele Grüße\nDein ICA³ Team";

    const mailtoUrl = `mailto:${encodeURIComponent(
      email
    )}?subject=${subject}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    setEmailModalFor(null);
  }

  // Design kopieren und Email öffnen
  async function copyDesignAndOpenEmail(a: AssignmentApi) {
    const email =
      (a.worker as any)?.email ||
      (a.worker as any)?.mail ||
      a.worker?.id ||
      "";

    const inviteLink = buildUserInviteUrl(a);
    const htmlContent = createHtmlEmailTemplate(a, inviteLink);

    try {
      // HTML als formatiertes HTML in Zwischenablage kopieren (nicht als Plain Text!)
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([htmlContent], { type: 'text/plain' });
      
      const clipboardItem = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob, // Fallback für Programme die kein HTML unterstützen
      });
      
      await navigator.clipboard.write([clipboardItem]);
      setCopiedDesign(true);
      showSuccess("Design wurde kopiert! Fügen Sie es mit Strg+V in die E-Mail ein.");

      // Kurz warten, dann Email öffnen
      setTimeout(() => {
        const subject = encodeURIComponent(
          `Einladung zum Assessment "${a.catalog?.title || "Katalog"}"`
        );
        const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${subject}`;
        window.location.href = mailtoUrl;
        
        setCopiedDesign(false);
        setEmailModalFor(null);
      }, 500);
    } catch (err) {
      // Fallback für ältere Browser
      try {
        await navigator.clipboard.writeText(htmlContent);
        setCopiedDesign(true);
        showSuccess("Design wurde kopiert (als Text). Fügen Sie es mit Strg+V ein.");
        
        setTimeout(() => {
          const subject = encodeURIComponent(
            `Einladung zum Assessment "${a.catalog?.title || "Katalog"}"`
          );
          const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${subject}`;
          window.location.href = mailtoUrl;
          
          setCopiedDesign(false);
          setEmailModalFor(null);
        }, 500);
      } catch {
        showError("Kopieren fehlgeschlagen. Bitte versuchen Sie es erneut.");
      }
    }
  }

  function handleExportInvitePdf(a: AssignmentApi) {
    // Sicherstellen, dass das Template-Bild geladen ist
    try {
      if (!bgStandardImg) {
        showError("PDF-Template wird noch geladen. Bitte kurz warten.");
        return;
      }

      // Neues A4-Dokument erstellen
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      //  CAP-Template als Hintergrund zeichnen
      doc.addImage(bgStandardImg, "PNG", 0, 0, pageWidth, pageHeight);
      // etwas höher ansetzen, ungefähr da, wo im Template die gestrichelte Box ist
      const footerY = pageHeight - 8; // bei Bedarf 1–2 mm rauf/runter anpassen

      // Kleine Box
      const footerBoxWidth = 70;  // schmaler als vorher
      const footerBoxHeight = 6;
      const rightMargin = 20;     // Abstand zur rechten Blattkante
      const footerBoxX = pageWidth - rightMargin - footerBoxWidth;
      const footerBoxTop = footerY - footerBoxHeight + 2;

      // Innenbereich weiß füllen (alter Template-Text wird übermalt,
      // grauer Balken links wird NICHT getroffen)
      doc.setFillColor(255, 255, 255);
      doc.rect(footerBoxX, footerBoxTop, footerBoxWidth, footerBoxHeight, "F");

      // Text in die Box schreiben
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);

      // ein bisschen Innenabstand
      const paddingX = 4;

      // links: "Einladung"
      doc.text("Einladung", footerBoxX + paddingX, footerY);

      // rechts: "Seite 1 von 1"
      doc.text(
        "Seite 1 von 1",
        footerBoxX + footerBoxWidth - paddingX,
        footerY,
        { align: "right" }
      );

      // Daten aus der Zuweisung holen
      const inviteLink = buildUserInviteUrl(a);

      const workerName = a.worker?.name ?? "";
      const workerEmail =
        (a.worker as any)?.email || (a.worker as any)?.mail || ""; // HIER ggfs. anpassen!
      const companyName = a.company?.name ?? "";
      const catalogTitle = a.catalog?.title ?? "";
      const accessCode = a.accessCode ?? "";
      const expiresAtText = a.expiresAt
        ? new Date(a.expiresAt).toLocaleString("de-DE")
        : "";

      //  Überschrift: "Einladung zum Assessment" zentriert oben
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      // CAP-Navy: ungefähr RGB(38,69,85)
      doc.setTextColor(38, 69, 85);
      doc.text("Einladung zum Assessment", pageWidth / 2, 45, {
        align: "center",
      });

      //  Untertitel: Katalog-Titel 
      if (catalogTitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Assessment: ${catalogTitle}`, pageWidth / 2, 52, {
          align: "center",
        });
      }

      //  Haupttext im weißen Bereich
      const contentLeft = 25; // etwas Abstand von der linken Linie
      let y = 65;             // etwas unter dem Titel beginnen

      // Empfänger-Daten (Name + Mail)
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      // Name (Label fett, Wert normal)
      doc.setFont("helvetica", "bold");
      doc.text("Empfänger:", contentLeft, y);
      doc.setFont("helvetica", "normal");
      doc.text(workerName || "-", contentLeft + 35, y);
      y += 6;

      // E-Mail
      doc.setFont("helvetica", "bold");
      doc.text("E-Mail:", contentLeft, y);
      doc.setFont("helvetica", "normal");
      doc.text(workerEmail || "-", contentLeft + 35, y);
      y += 6;

      // Firma
      doc.setFont("helvetica", "bold");
      doc.text("Firma:", contentLeft, y);
      doc.setFont("helvetica", "normal");
      doc.text(companyName || "-", contentLeft + 35, y);
      y += 10;

      // kurzer Einleitungstext
      doc.setFont("helvetica", "normal");
      const introLines = doc.splitTextToSize(
        "Sie wurden eingeladen, an einem Digital Maturity Assessment teilzunehmen. Bitte nutzen Sie den folgenden Link, um das Assessment zu starten:",
        pageWidth - contentLeft - 20
      );
      doc.text(introLines, contentLeft, y);
      y += introLines.length * 6;

      // Link optisch hervorheben
      doc.setFont("helvetica", "bold");
      // Gold: ungefähr RGB(227,187,98)
      doc.setTextColor(227, 187, 98);
      doc.setFontSize(10);

      const maxTextWidth = pageWidth - contentLeft - 20;

      // Link in mehrere Zeilen umbrechen (wie vorher)
      const linkLines = doc.splitTextToSize(inviteLink, maxTextWidth);

      // Startposition des Link-Blocks merken
      const linkX = contentLeft;
      const linkY = y;
      const lineHeight = 6; // Abstand zwischen den Zeilen

      // Text  zeichnen
      doc.text(linkLines, linkX, linkY);

      // Klickbare Fläche über den gesamten Block legen
      let linkWidth = 0;
      linkLines.forEach((line: any) => {
        const w = doc.getTextWidth(line);
        if (w > linkWidth) linkWidth = w;
      });

      const linkHeight = lineHeight * linkLines.length;

      // link() erwartet die obere linke Ecke → darum etwas nach oben korrigieren
      doc.link(linkX, linkY - lineHeight + 2, linkWidth, linkHeight, {
        url: inviteLink,
      });

      // y nach dem Block weiterschieben
      y += linkLines.length * lineHeight;

      // Style wieder zurücksetzen
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      // wieder normale Textfarbe
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      // Access-Code
      if (accessCode) {
        y += 2;
        doc.setFont("helvetica", "bold");
        doc.text("Access-Code:", contentLeft, y);
        doc.setFont("helvetica", "normal");
        doc.text(accessCode, contentLeft + 35, y);
        y += 6;
      }

      // Gültigkeitsdatum
      if (expiresAtText) {
        doc.setFont("helvetica", "bold");
        doc.text("Gültig bis:", contentLeft, y);
        doc.setFont("helvetica", "normal");
        doc.text(expiresAtText, contentLeft + 35, y);
        y += 8;
      }

      // Abschluss-Text
      const outroLines = doc.splitTextToSize(
        "Öffnen Sie den Link in Ihrem Browser und folgen Sie den Anweisungen im System. Vielen Dank für Ihre Teilnahme.",
        pageWidth - contentLeft - 20
      );
      doc.text(outroLines, contentLeft, y);
      y += outroLines.length * 6 + 10;

      // Signatur
      doc.setFont("helvetica", "normal");
      doc.text("Viele Grüße", contentLeft, y);
      y += 6;

      // ICA³ in CAP-Farbe fett
      doc.setFont("helvetica", "bold");
      doc.setTextColor(38, 69, 85); // CAP-Navy
      doc.text("Ihr ICA³ Team", contentLeft, y);


      //  Dateiname bauen und speichern
      const safeName =
        workerName?.trim().replace(/\s+/g, "_") || `assignment_${a.id ?? ""}`;
      doc.save(`Einladung_${safeName}.pdf`);
      showSuccess("Einladungs-PDF wurde erfolgreich erstellt.");
    } catch {
      showError("Beim Erstellen des Einladungs-PDF ist ein Fehler aufgetreten.");
    }

  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listAssignments();
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [location.pathname]); // Reload when navigating to this page

  useEffect(() => {
    if (loading) return;
    if (!rows.length) return;

    const raw = sessionStorage.getItem("flash_assignments");
    if (!raw) return;

    //  SOFORT löschen -> garantiert "nur einmal", selbst bei Refresh danach
    sessionStorage.removeItem("flash_assignments");

    try {
      const data = JSON.parse(raw) as {
        workerIds: string[];
        catalogId: string;
        after: number;
        ttlMs?: number;
      };

      if (!data?.workerIds?.length || !data?.catalogId || !data?.after) return;

      if (data.ttlMs && Date.now() - data.after > data.ttlMs) return;

      const idsToFlash = rows
        .filter(r => {
          const wid = r.worker?.id ?? "";
          const cid = r.catalog?.id ?? "";
          if (cid !== data.catalogId) return false;
          if (!data.workerIds.includes(wid)) return false;

          const t = r.assignedAt ? new Date(r.assignedAt).getTime() : 0;
          return t >= data.after; // nur "neu"
        })
        .map(r => r.id);

      if (idsToFlash.length) flashRowIds(idsToFlash, 3500);
    } catch {
      // ignore
    }
  }, [loading, rows]);


  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? rows.filter((r) => {
        const pool = [
          r.worker?.name,
          r.worker?.id,
          r.catalog?.title,
          r.catalog?.id,
          r.company?.name,
          r.status,
          r.accessCode,
          r.accessToken,
          r.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return pool.includes(term);
      })
      : rows.slice();

    const val = (r: AssignmentApi) => {
      switch (sortKey) {
        case "worker":
          return (r.worker?.name || r.worker?.id || "").toLowerCase();
        case "catalog":
          return (r.catalog?.title || r.catalog?.id || "").toLowerCase();
        case "status":
          return (r.status || "").toLowerCase();
        case "assignedAt":
          return r.assignedAt ? new Date(r.assignedAt).getTime() : 0;
        case "expiresAt":
          return r.expiresAt ? new Date(r.expiresAt).getTime() : 0;
        case "completedAt":
          return r.completedAt ? new Date(r.completedAt).getTime() : 0;
      }
    };

    base.sort((a, b) => {
      const av = val(a) as any;
      const bv = val(b) as any;
      if (av === bv) return 0;
      return av > bv ? (asc ? 1 : -1) : asc ? -1 : 1;
    });

    return base;
  }, [rows, q, sortKey, asc]);

  const setSort = (k: SortKey) => {
    if (k === sortKey) setAsc((v) => !v);
    else {
      setSortKey(k);
      setAsc(true);
    }
  };

  // Pagination 
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

  useEffect(() => {
    setPage(1);
  }, [q, sortKey, asc, rows.length, pageSize]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // Delete-Flow 
  function askDelete(a: AssignmentApi) {
    setDeleteFor(a);
    setDeleteError(null);
    setOpenDelete(true);
  }

  const cancelDelete = () => {
    if (deleting) return;
    setOpenDelete(false);
    setDeleteFor(null);
    setDeleteError(null);
  };

  async function confirmDelete() {
    if (!deleteFor) return;
    try {
      setDeleting(true);
      setDeleteError(null);

      await deleteAssignment(deleteFor.id);

      setRows((prev) => prev.filter((r) => r.id !== deleteFor.id));

      showSuccess("Zuweisung erfolgreich gelöscht.");
      setOpenDelete(false);
      setDeleteFor(null);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setDeleteError(msg);
      showError(`Fehler beim Löschen der Zuweisung: ${msg}`);
    } finally {
      setDeleting(false);
    }
  }

  async function confirmExtend() {
    if (!extendFor) return;

    if (!newExpiresAt) {
      setExtendError("Bitte neues Ablaufdatum wählen.");
      return;
    }

    try {
      setExtending(true);
      setExtendError(null);

      // newExpiresAt kommt z.B. als "2025-12-21T03:02" (local time)
      const d = new Date(newExpiresAt);

      const pad = (n: number) => String(n).padStart(2, "0");

      // Format: "yyyy-MM-dd'T'HH:mm:ss"
      const formatted =
        `${d.getFullYear()}-` +
        `${pad(d.getMonth() + 1)}-` +
        `${pad(d.getDate())}T` +
        `${pad(d.getHours())}:` +
        `${pad(d.getMinutes())}:` +
        `${pad(d.getSeconds())}`;

      const updated = await updateAssignmentExpires(extendFor.id, {
        expiresAt: formatted,
      });

      setRows((prev) =>
        prev.map((r) =>
          r.id === extendFor.id
            ? { ...r, expiresAt: updated.expiresAt ?? formatted }
            : r
        )
      );

      showSuccess("Ablaufdatum erfolgreich aktualisiert.");
      setExtendFor(null);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      setExtendError(msg);
      showError(`Fehler beim Aktualisieren des Ablaufdatums: ${msg}`);
    } finally {
      setExtending(false);
    }
  }
 const isAnyModalOpen =
  !!inviteFor ||
  !!emailModalFor ||
  (openDelete && !!deleteFor) ||
  !!extendFor;

useScrollLock(isAnyModalOpen);

  return (
    <AdminLayout>

      <style>
        {`
@keyframes greenFlash {
  0% {
    background-color: rgba(16,185,129,0.05);
    box-shadow: inset 0 0 0 rgba(16,185,129,0);
  }
  30% {
    background-color: rgba(16,185,129,0.22);
    box-shadow:
      inset 0 0 0 9999px rgba(16,185,129,0.12),
      0 0 22px rgba(16,185,129,0.35);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
  }
}

@keyframes greenSweep {
  0% {
    transform: translateX(-120%);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}
`}
      </style>

      {/* HEADER */}
      <PageHeader
        title="Zuweisungen Administration"
        subtitle="Alle Katalog-Zuweisungen an Kunden verwalten"
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
        {/*  Top-Bar: Breadcrumb-Pill  */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto mb-3 flex items-center justify-between">
          <nav className="flex items-center">
            <div
              className="
                inline-flex items-center gap-2
                rounded-full border
                px-3 py-1.5
                shadow-[0_4px_10px_rgba(0,0,0,0.06)]
                text-xs sm:text-sm
                bg-white/80
                backdrop-blur-[2px]
              "
              style={{ borderColor: BRAND.sand }}
            >
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: "rgba(38,69,85,0.06)",
                  color: BRAND.navy,
                }}
              >
                <Network size={14} />
              </span>

              <Link
                to="/admin/adminPanel"
                className="hover:underline"
                style={{ color: CSS.mutedFg }}
              >
                Admin Panel
              </Link>

              <span
                className="text-[11px] opacity-60"
                style={{ color: CSS.mutedFg }}
              >
                ›
              </span>

              <span
                className="font-semibold"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Zuweisungen
              </span>
            </div>
          </nav>
        </div>

        {/*  Suche + Count  */}
        <div
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto mb-4
            rounded-[18px] border
            px-4 py-3 md:px-5 md:py-4
            shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          "
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: BRAND.sand,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
            {/* Suche */}
            <div className="relative flex-1 min-w-[220px] max-w-[36rem]">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: BRAND.gray }}
              >
                <Search size={16} />
              </span>

              <input
                type="text"
                placeholder="Suche (Worker, Katalog, Status, Code, Token)…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="
                  w-full h-10 md:h-11
                  rounded-[999px]
                  border
                  pl-10 pr-4
                  text-sm
                  outline-none
                  transition
                  bg-white
                "
                style={{
                  borderColor: BRAND.sand,
                  color: CSS.fg,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(227,187,98,0.75)";
                  e.currentTarget.style.borderColor = BRAND.gold;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0,0,0,0.03)";
                  e.currentTarget.style.borderColor = BRAND.sand;
                }}
              />
            </div>

            {/* Count-Badge */}
            <div className="flex items-center gap-3">
              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  px-3 md:px-4 py-1.5
                  text-xs md:text-sm font-medium
                "
                style={{
                  background: BRAND.navy,
                  color: "white",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: BRAND.gold }}
                />
                <span>
                  Zeige{" "}
                  <span className="font-semibold">{filtered.length}</span>{" "}
                  Zuweisungen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/*  Tabelle im Card-Wrapper  */}
        <section
          className="
            max-w-[1400px] xl:max-w-[1600px]
            mx-auto
            rounded-[12px]
            border
            shadow-[0_4px_6px_-1px_rgba(38,69,85,.08)]
            overflow-hidden
          "
          style={{
            borderColor: CSS.border,
            background: BRAND.fog,
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">

              <colgroup>
                <col style={{ width: "22%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "24%" }} />
              </colgroup>
              <thead
                className="text-left text-xs font-semibold uppercase tracking-[0.04em]"
                style={{
                  background: "linear-gradient(to right, #ebebec, #ffffff)",
                  borderBottom: "2px solid #d2c9b9",
                  color: "#264555",
                }}
              >
                <tr>
                  {[
                    { k: "worker", label: "Worker" },
                    { k: "catalog", label: "Catalog" },
                    { k: "status", label: "Status" },
                    { k: "assignedAt", label: "Zugewiesen am" },
                    { k: "expiresAt", label: "Fällig am" },
                    { k: null, label: "Aktionen" },
                  ].map((col, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[0.85rem] font-semibold ${col.label === "Aktionen" ? "text-center" : "text-left"
                        }`}
                      style={{ color: CSS.fg }}
                    >
                      {col.k ? (
                        <button
                          type="button"
                          onClick={() => setSort(col.k as SortKey)}
                          className="inline-flex items-center gap-2 hover:brightness-110"
                          style={{ color: "inherit" }}
                        >
                          <span>{col.label}</span>
                          <ArrowUpDown size={14} className="opacity-60" />
                        </button>
                      ) : (
                        <span>{col.label}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-sm bg-white"
                      style={{ color: CSS.mutedFg }}
                    >
                      Lade Zuweisungen…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6}>
                      <pre className="px-4 py-4 text-xs whitespace-pre-wrap text-red-700 bg-red-50 border-t border-red-200">
                        {error}
                      </pre>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 bg-white">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        {/* Icon-Kreis */}
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsla(200,32%,22%,0.06)]"
                          style={{ color: "hsla(200,32%,22%,0.65)" }}
                        >
                          <Search size={20} />
                        </div>

                        {/* Texte */}
                        <div className="space-y-1">
                          <p className="text-sm font-semibold" style={{ color: CSS.fg }}>
                            {q.trim()
                              ? "Keine Treffer für deine Suche"
                              : "Noch keine Zuweisungen vorhanden"}
                          </p>

                          <p className="text-xs text-slate-500 max-w-md">
                            {q.trim()
                              ? "Bitte passe den Suchbegriff an oder setze den Filter zurück."
                              : "Lege die erste Zuweisung an, um mit der Administration zu starten."}
                          </p>
                        </div>

                        {/* Aktionen */}
                        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                          {q.trim() && (
                            <button
                              type="button"
                              onClick={() => setQ("")}
                              className="rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                              style={{ borderColor: CSS.border, color: CSS.mutedFg }}
                            >
                              Filter zurücksetzen
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((r) => {
                    const wName = r.worker?.name || "—";
                    const companyName = r.company?.name || "—";
                    const cTitle = r.catalog?.title || "—";
                    const { date: aDate, time: aTime } = fmtParts(r.assignedAt);
                    const { date: eDate, time: eTime } = fmtParts(r.expiresAt);
                    const expired = isExpired(r.expiresAt);

                    const isNew = highlightRowIds.has(r.id);

                    return (
                      <tr
                        key={r.id}
                        className={`
    bg-white transition border-l-[4px] border-transparent
    hover:border-[#E3BB62] hover:bg-[#fff9ec]
    hover:shadow-[0_4px_10px_rgba(0,0,0,0.04)]
    ${isNew ? "animate-pulse" : ""}
  `}
                        style={
                          isNew
                            ? {
                              borderLeftColor: "rgb(34 197 94)",
                              boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
                              background:
                                "linear-gradient(to right, rgba(34,197,94,0.08), rgba(255,255,255,1))",
                            }
                            : expired
                              ? {
                                borderLeftColor: "rgb(239 68 68)",
                                background:
                                  "linear-gradient(to right, rgba(239,68,68,0.08), rgba(255,255,255,1))",
                              }
                              : undefined
                        }
                      >
                        {/* Worker */}
                        <td
                          className="px-4 py-4 text-[0.95rem] align-top bg-white"
                          style={{ borderBottom: `1px solid ${CSS.border}` }}
                        >
                          <div className="font-semibold" style={{ color: CSS.fg }}>
                            {wName}
                          </div>
                          <div
                            className="mt-1 inline-block rounded text-[0.75rem]"
                            style={{
                              color: CSS.mutedFg,
                              background: "hsla(40,15%,92%,0.5)",
                            }}
                          >
                            <span className="px-2 py-1 font-mono">{companyName}</span>
                          </div>
                        </td>


                        {/* Catalog */}
                        <td
                          className="px-4 py-4 text-[0.95rem] border-t align-top bg-white"
                          style={{ borderColor: CSS.border }}
                        >
                          <div
                            className="font-semibold"
                            style={{ color: CSS.fg }}
                          >
                            {cTitle}
                          </div>
                        </td>

                        {/* Status */}
                        <td
                          className="px-4 py-4 text-[0.95rem] border-t align-middle bg-white"
                          style={{ borderColor: CSS.border }}
                        >
                          <Badge status={r.status} />
                        </td>

                        {/* Zugewiesen am */}
                        <td
                          className="px-4 py-4 text-[0.95rem] border-t align-middle whitespace-nowrap bg-white"
                          style={{ borderColor: CSS.border }}
                        >
                          <div style={{ color: CSS.fg }}>{aDate}</div>
                          <div
                            className="text-[15px] opacity-70"
                            style={{ color: CSS.mutedFg }}
                          >
                            {aTime}
                          </div>
                        </td>

                        {/* Fällig am */}
                        <td
                          className="px-4 py-4 text-[0.95rem] border-t align-middle whitespace-nowrap bg-white"
                          style={{ borderColor: CSS.border }}
                        >
                          <div style={{ color: CSS.fg }}>{eDate}</div>
                          <div
                            className="text-[15px] opacity-70"
                            style={{ color: CSS.mutedFg }}
                          >
                            {eTime}
                          </div>
                        </td>

                        {/* Aktion – Layout wie Users Actions */}
                        <td
                          className="px-4 py-4 text-center whitespace-nowrap border-t bg-white"
                          style={{ borderColor: CSS.border }}
                        >
                          <div className="inline-flex items-center justify-center gap-2">
                            {/* Einladen / Ungültig */}
                            {expired ? (
                              <span
                                title="Einladung ist abgelaufen"
                                className="
      inline-flex items-center gap-1.5
      rounded-full
      px-3 py-1.5
      text-[11px] font-semibold
      border
      cursor-not-allowed
      opacity-80
    "
                                style={{
                                  borderColor: "rgba(239,68,68,0.55)",
                                  color: "rgb(153,27,27)",
                                  background: "rgba(254,226,226,0.7)",
                                }}
                              >
                                <KeyRound size={13} />
                                <span className="hidden sm:inline">Ungültig</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setInviteFor(r);
                                  setCopiedLink(false);
                                  setCopiedCode(false);
                                }}
                                title="Einlade-Link erzeugen"
                                className="
      inline-flex items-center gap-1.5
      rounded-full
      px-3 py-1.5
      text-[11px] font-semibold
      focus:outline-none
      transition
      hover:-translate-y-[0.5px]
    "
                                style={{
                                  background: "hsl(40,60%,63%)",
                                  color: "hsl(200,32%,22%)",
                                  boxShadow: "0 4px 10px rgba(0,0,0,0.10)",
                                  border: "1px solid rgba(255,255,255,0.9)",
                                }}
                              >
                                <LinkIcon size={13} />
                                <span className="hidden sm:inline">Einladen</span>
                              </button>
                            )}
                            {/* Verlängern */}
                            <button
                              type="button"
                              onClick={() => {
                                setExtendFor(r);
                                setExtendError(null);

                                // datetime-local Format: YYYY-MM-DDTHH:MM
                                if (r.expiresAt) {
                                  const dt = new Date(r.expiresAt);
                                  const isoLocal = new Date(
                                    dt.getTime() -
                                    dt.getTimezoneOffset() * 60000
                                  )
                                    .toISOString()
                                    .slice(0, 16);
                                  setNewExpiresAt(isoLocal);
                                } else {
                                  setNewExpiresAt("");
                                }
                              }}
                              title="Ablaufdatum verlängern"
                              className="
                                inline-flex items-center justify-center
                                rounded-full
                                px-2.5 py-1.5
                                text-[11px] font-medium
                                border
                                transition
                                hover:bg-[#f5f0e4]
                              "
                              style={{
                                borderColor: "#d2c9b9",
                                color: "#264555",
                                background: "#ffffff",
                              }}
                            >
                              <Network size={13} />
                            </button>

                            {/* Löschen */}
                            <button
                              type="button"
                              onClick={() => askDelete(r)}
                              title="Zuweisung löschen"
                              className="
                                inline-flex items-center justify-center
                                rounded-full
                                px-2.5 py-1.5
                                text-[11px] font-medium
                                border
                                transition
                                hover:bg-[#fff1f1]
                              "
                              style={{
                                borderColor: "rgba(248,113,113,0.8)",
                                color: "rgb(185,28,28)",
                                background: "#ffffff",
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/*  Pagination-Card  */}
        <div
          className="
            max-w-[1400px] xl:max-w-[1600px] mx-auto mt-4
            rounded-[18px] border
            px-4 py-3 md:px-5 md:py-3
            shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          "
          style={{
            background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
            borderColor: BRAND.sand,
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs sm:text-sm" style={{ color: "#808080" }}>
              Zeige{" "}
              <span className="font-semibold" style={{ color: "#264555" }}>
                {startIdx}
              </span>
              –
              <span className="font-semibold" style={{ color: "#264555" }}>
                {endIdx}
              </span>{" "}
              von{" "}
              <span className="font-semibold" style={{ color: "#264555" }}>
                {total}
              </span>{" "}
              Einträgen
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs sm:text-sm"
                  style={{ color: "#808080" }}
                >
                  Anzahl der Zeilen pro Seite
                </span>

                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="
                      h-9 min-w-[72px]
                      rounded-full
                      border
                      bg-white
                      px-3 pr-8
                      text-sm font-medium
                      outline-none
                      appearance-none
                      shadow-sm
                      focus:ring-2
                    "
                    style={{
                      borderColor: "#d2c9b9",
                      color: "#264555",
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span
                    className="
                      pointer-events-none
                      absolute right-3 top-1/2 -translate-y-1/2
                      text-[10px]
                    "
                    style={{ color: "#b0b0b0" }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              <span
                className="
                  inline-flex items-center
                  rounded-full
                  px-3 py-1.5
                  text-xs sm:text-sm font-semibold
                "
                style={{
                  background: "#264555",
                  color: "white",
                }}
              >
                Seite {page} von {totalPages}
              </span>

              <div className="flex items-center gap-1">
                {[
                  {
                    label: "«",
                    onClick: () => setPage(1),
                    disabled: page <= 1 || total === 0,
                  },
                  {
                    label: "‹",
                    onClick: () => setPage((p) => Math.max(1, p - 1)),
                    disabled: page <= 1 || total === 0,
                  },
                  {
                    label: "›",
                    onClick: () =>
                      setPage((p) => Math.min(totalPages, p + 1)),
                    disabled: page >= totalPages || total === 0,
                  },
                  {
                    label: "»",
                    onClick: () => setPage(totalPages),
                    disabled: page >= totalPages || total === 0,
                  },
                ].map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={btn.onClick}
                    disabled={btn.disabled}
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-full border text-xs sm:text-sm font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition
                    "
                    style={{
                      borderColor: "#d2c9b9",
                      color: "#264555",
                      background: "#ffffff",
                    }}
                    onMouseEnter={(e) => {
                      if (!btn.disabled) {
                        e.currentTarget.style.background = "#fff9ec";
                        e.currentTarget.style.borderColor = "#E3BB62";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#d2c9b9";
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Invite Modal  */}
      {inviteFor && (
        <div
    className="fixed -inset-px z-[1100] px-4"
    role="dialog"
    aria-modal="true"
    onClick={() => setInviteFor(null)} // Klick außerhalb schließt
  >
    {/* Overlay als eigenes Layer (verhindert die schwarze Linie/Naht) */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm [transform:translateZ(0)]"
      aria-hidden="true"
    />

    {/* Zentrierung */}
    <div className="relative flex min-h-screen items-center justify-center">
      <div
        className="w-full max-w-xl"
        onClick={(e) => e.stopPropagation()} // Klick im Modal nicht schließen
      >
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

              {/* Inhalt */}
              <div className="relative px-6 pt-6 pb-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                      Einlade-Link
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Teile diesen Link oder Access-Code mit der ausgewählten
                      Person.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (inviteFor) handleExportInvitePdf(inviteFor);
                    }}
                    className="
    inline-flex h-10 w-10 items-center justify-center
    rounded-full
    bg-[#E3BB62]/25
    border border-[#E3BB62]
    hover:bg-[#E3BB62]/40
    transition
    shadow-sm
  "
                    aria-label="PDF exportieren"
                  >
                    <FileDown size={18} className="text-[#264555]" />
                  </button>

                </div>

                {/* Empfänger + Katalog */}
                <div className="mb-5 space-y-1.5 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-slate-400">
                      Empfänger
                    </span>
                    <span className="font-semibold text-slate-900">
                      {inviteFor.worker?.name ||
                        inviteFor.worker?.id ||
                        "Worker"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-slate-400">
                      Katalog
                    </span>
                    <span className="text-[13px] font-medium text-sky-700">
                      {inviteFor.catalog?.title ||
                        inviteFor.catalog?.id ||
                        "Katalog"}
                    </span>
                  </div>

                  {inviteFor.company?.name && (
                    <div className="text-[13px] text-slate-500">
                      Firma:{" "}
                      <span className="font-medium text-slate-700">
                        {inviteFor.company.name}
                      </span>
                    </div>
                  )}

                  {inviteFor.expiresAt && (
                    <div className="text-[13px] text-slate-500">
                      Gültig bis:{" "}
                      <span className="font-medium text-slate-700">
                        {new Date(inviteFor.expiresAt).toLocaleString("de-DE")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Link + Access-Code  */}
                <div
                  className="
    mb-5
    rounded-2xl border
    px-4 py-4
    bg-white/80
    shadow-[0_10px_30px_rgba(0,0,0,0.06)]
    space-y-3
  "
                  style={{ borderColor: BRAND.sand }}
                >
                  {/* Link-Feld */}
                  <div className="mb-4 space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Link
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        readOnly
                        value={buildUserInviteUrl(inviteFor)}
                        className="
        flex-1 rounded-xl border px-3 py-2.5 text-sm
        bg-slate-50 border-slate-200
        outline-none
        focus:bg-white
        focus:border-[#E3BB62]
        focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
        transition
      "
                        style={{ color: CSS.fg }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              buildUserInviteUrl(inviteFor)
                            );
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 1200);
                          } catch {
                            /* ignore */
                          }
                        }}
                        className="
        inline-flex items-center justify-center gap-1.5
        rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold
        bg-white/80
        hover:bg-[#fff9ec]
        transition
      "
                        style={{ borderColor: BRAND.sand, color: BRAND.navy }}
                      >
                        {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedLink ? "Kopiert" : "Kopieren"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Access-Code  */}
                  {inviteFor.accessCode && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Access-Code
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          readOnly
                          value={inviteFor.accessCode}
                          className="
          flex-1 rounded-xl border px-3 py-2.5 text-sm
          bg-slate-50 border-slate-200
          outline-none
          focus:bg-white
          focus:border-[#E3BB62]
          focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
          transition
        "
                          style={{ color: CSS.fg }}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                inviteFor.accessCode || ""
                              );
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 1200);
                            } catch {
                              /* ignore */
                            }
                          }}
                          className="
          inline-flex items-center justify-center gap-1.5
          rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold
          bg-white/80
          hover:bg-[#fff9ec]
          transition
        "
                          style={{ borderColor: BRAND.sand, color: BRAND.navy }}
                        >
                          {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedCode ? "Kopiert" : "Kopieren"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
            <div className="h-3" />

            <div className="mt-1 flex gap-2">
              {/* Grau: Schließen */}
              <button
                type="button"
                onClick={() => setInviteFor(null)}
                className="
                  flex-1
                  h-12
                  text-sm font-medium
                  rounded-xl
                  bg-[#f3f3f3]
                  text-slate-800
                  border border-slate-200
                  hover:bg-[#e5e5e5]
                  transition
                "
              >
                Schließen
              </button>

              {/* Gold: Per E-Mail schicken */}
              <button
                type="button"
                onClick={() => {
                  if (inviteFor) {
                    handleSendInviteEmail(inviteFor);
                  }
                }}
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
                "
              >
                Per E-Mail schicken
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Email Options Modal */}
      {emailModalFor && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEmailModalFor(null);
          }}
        >
          <div
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
              {/* Decorative Glows */}
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-60"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-transparent opacity-60"
                aria-hidden="true"
              />

              {/* Content */}
              <div className="relative px-6 pt-6 pb-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#264555] to-[#56768f] shadow-lg">
                      <Mail size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        E-Mail senden
                      </h3>
                      <p className="text-xs text-slate-500">
                        Wählen Sie eine Versandoption
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailModalFor(null)}
                    className="rounded-full p-2 hover:bg-slate-100 transition"
                  >
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>

                {/* Recipient Info */}
                <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">An:</span>
                    <span className="font-medium text-slate-800">
                      {(emailModalFor.worker as any)?.email ||
                        (emailModalFor.worker as any)?.mail ||
                        emailModalFor.worker?.id ||
                        "Empfänger"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="text-slate-500">Betreff:</span>
                    <span className="text-slate-700">
                      Einladung zum Assessment "{emailModalFor.catalog?.title || "Katalog"}"
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {/* Option 1: Plain Text */}
                  <button
                    type="button"
                    onClick={() => sendPlainTextEmail(emailModalFor)}
                    className="
                      w-full flex items-center gap-4 p-4
                      rounded-xl border border-slate-200
                      bg-white hover:bg-slate-50
                      transition group text-left
                    "
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 group-hover:bg-slate-200 transition">
                      <FileText size={20} className="text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">Als Plain Text senden</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Einfache Text-E-Mail ohne Formatierung
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Design kopieren + Email öffnen */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => copyDesignAndOpenEmail(emailModalFor)}
                      disabled={copiedDesign}
                      className="
                        w-full flex items-center gap-4 p-4
                        rounded-xl border-2 border-[#E3BB62]
                        bg-gradient-to-r from-[#fffbf0] to-[#fff9e6]
                        hover:from-[#fff7e0] hover:to-[#fff5d6]
                        transition text-left
                        shadow-[0_4px_15px_rgba(227,187,98,0.25)]
                      "
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E3BB62] shadow-md">
                        {copiedDesign ? (
                          <Check size={20} className="text-white" />
                        ) : (
                          <Paintbrush size={20} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#264555]">
                          {copiedDesign ? "Design kopiert!" : "Mit Design senden"}
                        </p>
                        <p className="text-xs text-[#56768f] mt-0.5">
                          {copiedDesign
                            ? "E-Mail öffnet sich..."
                            : "Schönes HTML-Design wird kopiert"}
                        </p>
                      </div>
                      <span className="text-[#E3BB62] font-bold text-lg">★</span>
                    </button>
                    
                    {/* Tooltip */}
                    <div className="
                      absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-200
                      pointer-events-none z-10
                    ">
                      <div className="bg-[#264555] text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-[260px] text-center">
                        <p className="font-medium">💡 So funktioniert's:</p>
                        <p className="mt-1">Das Design wird in die Zwischenablage kopiert. Fügen Sie es mit <strong>Strg+V</strong> in die E-Mail ein.</p>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                          <div className="border-8 border-transparent border-t-[#264555]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => setEmailModalFor(null)}
                  className="
                    w-full mt-4 h-11
                    text-sm font-medium
                    rounded-xl
                    bg-slate-100
                    text-slate-600
                    border border-slate-200
                    hover:bg-slate-200
                    transition
                  "
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirm */}
      <ConfirmModal
        open={openDelete && !!deleteFor}
        title="Zuweisung löschen?"
        description={
          <>
            Diese Zuweisung von{" "}
            <span className="font-semibold">
              {deleteFor?.worker?.name || deleteFor?.worker?.id || "Worker"}
            </span>{" "}
            für{" "}
            <span className="font-semibold">
              {deleteFor?.catalog?.title ||
                deleteFor?.catalog?.id ||
                "Katalog"}
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
            {deleteError && (
              <span className="mt-2 block text-red-700">
                Fehler: {deleteError}
              </span>
            )}
          </>
        }
        cancelLabel="Abbrechen"
        confirmLabel={deleting ? "Lösche…" : "Ja, löschen"}
        onCancel={cancelDelete}
        onConfirm={() => {
          if (!deleting) {
            void confirmDelete();
          }
        }}
        icon={<Trash2 className="text-red-500" />}
      />
      {/* Verlängerung */}
      {extendFor && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Karte */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
              {/* Deko-Glow leicht gold/blau */}
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#E3BB62]/35 via-amber-300/20 to-transparent opacity-70"
                aria-hidden="true"
              />

              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                  Ablaufdatum anpassen
                </h3>

                <p className="text-sm text-slate-600 mb-3">
                  Zuweisung für{" "}
                  <span className="font-semibold">
                    {extendFor.worker?.name || extendFor.worker?.id || "Worker"}
                  </span>{" "}
                  /{" "}
                  <span className="font-semibold">
                    {extendFor.catalog?.title || extendFor.catalog?.id || "Katalog"}
                  </span>{" "}
                  verlängern.
                </p>

                {extendError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {extendError}
                  </div>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="expires-at"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Neues Ablaufdatum
                  </label>
                  <input
                    id="expires-at"
                    type="datetime-local"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                    className="
                w-full rounded-xl border px-3 py-2.5 text-sm
                bg-slate-50 border-slate-200
                outline-none
                focus:bg-white
                focus:border-[#E3BB62]
                focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]
                transition
              "
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Lokale Zeit, wird im passenden Format an die API gesendet.
                  </p>
                </div>
              </div>
            </div>

            {/* kleiner Abstand  */}
            <div className="h-3" />

            {/* Footer mit zwei Button */}
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setExtendFor(null)}
                disabled={extending}
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
          "
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={() => confirmExtend()}
                disabled={extending}
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
                {extending ? "Speichere…" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
