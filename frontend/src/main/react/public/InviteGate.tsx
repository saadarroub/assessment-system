// src/features/public/InviteGate.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchInviteMeta, verifyInvite, type InviteMeta } from "@/features/service/inviteService";
// +++ NEU: Assignment anhand Access-Code laden +++
import { fetchAssignmentByAccessCode } from "@/features/service/inviteService";
export default function InviteGate() {
  const { token = "" } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<InviteMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Ziel, wohin wir nach Erfolg leiten
  const TARGET = "/app/katalog-themen-public";

  /**--- Test--- */
  async function navigateToTopics(opts: { token: string; accessCode?: string }) {
  const { token, accessCode } = opts;

  let assignmentId = "";
  let catalogId = "";
  let catalogTitle = "";
  let workerName = "";

  // Wenn wir einen Access-Code haben, Assignment laden → Katalog + Name holen
  if (accessCode && accessCode.trim()) {
    try {
      const assign = await fetchAssignmentByAccessCode(accessCode.trim());
      assignmentId = assign?.id || "";
      catalogId = assign?.catalog?.id || "";
      catalogTitle = assign?.catalog?.title || "";
      workerName = assign?.worker?.name || "";
    } catch {
      // Fallback: wir navigieren trotzdem, KatalogThemenPublic kann per ?code= selbst nachladen
    }
  }

  const qp = new URLSearchParams({
    // Token für Live-Progress – KatalogThemenPublic akzeptiert token ODER accessToken
    token,
    accessToken: token,

    // sehr wichtig, sonst gibt es keine Themen:
    ...(catalogId ? { catalogId } : {}),

    // hübsch für den Header:
    ...(catalogTitle ? { catalogTitle } : {}),

    // Snapshot/Lock:
    ...(assignmentId ? { assignmentId } : {}),

    // Name für "Willkommen, …":
    ...(workerName ? { name: workerName } : {}),

    // falls Name-Lookup oben scheitert: KatalogThemenPublic kann per code selbst nachladen
    ...(accessCode ? { code: accessCode } : {}),
  });

  navigate(`${TARGET}?${qp.toString()}`, { replace: true });
}

/**---- end test ---- */

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const m = await fetchInviteMeta(token);
        if (!alive) return;

        // einfache clientseitige Checks
        if (m.status && m.status.toLowerCase() === "expired") {
          throw new Error("Einladung ist abgelaufen.");
        }
        if (m.expiresAt && new Date(m.expiresAt).getTime() < Date.now()) {
          throw new Error("Einladung ist abgelaufen.");
        }

        setMeta(m);

        // Kein Code nötig? Direkt verifizieren & weiterleiten
        if (!m.requiresCode) {
          setVerifying(true);
          await verifyInvite(token);
          await navigateToTopics({ token, accessCode: m.accessCode });

          

          // +++ NEU: Unlock setzen, wenn wir eine accessCode-Info haben +++
          try {
            const accessCode = m.accessCode?.trim();
            if (accessCode) {
              const assign = await fetchAssignmentByAccessCode(accessCode);
              const assignmentId = assign?.id;
              if (assignmentId) {
                localStorage.setItem(`unlock:assignment:${assignmentId}`, "true");
                navigate(
                  `${TARGET}?token=${encodeURIComponent(token)}&assignmentId=${encodeURIComponent(assignmentId)}`,
                  { replace: true }
                );
                return;
              }
            }
          } catch {
            // Wenn kein accessCode oder Lookup fehlschlägt, weiter ohne assignmentId
          }

          navigate(`${TARGET}?token=${encodeURIComponent(token)}`, { replace: true });
          return;
        }
      } catch (e: any) {
        if (alive) setError(e?.message ?? String(e));
      } finally {
        if (alive) setLoading(false);
        if (alive) setVerifying(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setVerifying(true);
      setError(null);

      const clean = code.trim();

      // 1) Verify wie bisher
      await verifyInvite(token, clean);

      // 2) +++ NEU: AssignmentId ermitteln und Unlock setzen +++
      let assignmentId: string | undefined;
      try {
        const assign = await fetchAssignmentByAccessCode(clean);
        assignmentId = assign?.id;
        if (assignmentId) {
          localStorage.setItem(`unlock:assignment:${assignmentId}`, "true");
        }
      } catch {
        // Falls Lookup fehlschlägt, navigieren wir trotzdem weiter
      }

      //  Redirect wie gehabt – jetzt mit assignmentId (falls vorhanden)
      {/*
      const qp = new URLSearchParams({
        token,
        code: clean,
        ...(assignmentId ? { assignmentId } : {}),
      });
      */}
      await navigateToTopics({ token, accessCode: clean }); //navigate(`${TARGET}?${qp.toString()}`, { replace: true });
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setVerifying(false);
    }
  }

  if (loading) return <div className="p-6">Lade Einladung…</div>;
  if (error)
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2">Einladung nicht gültig</h2>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );

  // requiresCode = true → Formular
  if (meta?.requiresCode) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-bold mb-2">Einladung</h1>
        <p className="text-sm text-slate-600 mb-4">
          {meta.catalogTitle ? `Katalog: ${meta.catalogTitle}` : null}
          {meta.companyName ? ` · Firma: ${meta.companyName}` : null}
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm font-medium">Access-Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Code eingeben"
            required
          />
          <button
            type="submit"
            disabled={verifying}
            className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {verifying ? "Prüfe…" : "Weiter"}
          </button>
        </form>
      </div>
    );
  }

  // Fallback (sollte wegen Auto-Redirect kaum sichtbar sein)
  return <div className="p-6">Weiterleitung…</div>;
}
