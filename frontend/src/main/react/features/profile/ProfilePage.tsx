import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "@/apps/app/AdminLayout";
import { User, MapPin, Phone, Mail, Lock } from "lucide-react";
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  deleteAvatar,
  buildAvatarUrl,
  type UpdateProfileRequest,
} from "../service/profilePageService";


const BRAND = {
  navy: "#264555",
  steel: "#56768f",
  gray: "#808080",
  sand: "#d2c9b9",
  fog: "#ebebec",
  gold: "#E3BB62",
};

/* ===== Typen ===== */

type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type CardProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  extra?: React.ReactNode;
};

type PasswordSectionProps = {
  onReset: () => void;
};

/* ===== Card-Helper ===== */

const Card: React.FC<CardProps> = ({ title, icon, children, extra }) => (
  <section
    className="
      mb-6 rounded-2xl border
      shadow-[0_10px_26px_rgba(0,0,0,0.06)]
      overflow-hidden
    "
    style={{
      borderColor: BRAND.sand,
      background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
    }}
  >
    <header
      className="flex items-center justify-between px-5 py-3 border-b"
      style={{
        borderColor: BRAND.sand,
        background: "linear-gradient(to right, #ebebec, #ffffff)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: "rgba(38,69,85,0.06)",
            color: BRAND.navy,
          }}
        >
          {icon}
        </span>
        <h2
          className="text-sm md:text-base font-semibold"
          style={{ color: BRAND.navy }}
        >
          {title}
        </h2>
      </div>

      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </header>

    <div className="px-5 pb-5 pt-4 bg-white/90">{children}</div>
  </section>
);

const EyeIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

/* ===== Passwort-Bereich ===== */

const PasswordSection: React.FC<PasswordSectionProps> = ({ onReset }) => {
  const [currentPassword, setCurrentPassword] = useState("••••••••••");
  const [showPassword, setShowPassword] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCurrent, setResetCurrent] = useState("");
  const [resetNew, setResetNew] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);

  const togglePasswordVisibility = () => {
    setShowPassword((v) => !v);
  };

  const openResetModal = () => {
    setResetCurrent("");
    setResetNew("");
    setResetConfirm("");
    setResetError(null);
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (resetNew.length < 12) {
      setResetError("Das neue Passwort muss mindestens 12 Zeichen lang sein.");
      return;
    }
    if (resetNew !== resetConfirm) {
      setResetError("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    // später API-Call
    onReset();

    setCurrentPassword("••••••••••");
    setShowResetModal(false);
  };

  return (
    <>
      <Card title="Passwort & Sicherheit" icon={<Lock size={20} />}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Aktuelles Passwort mit Auge */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Aktuelles Passwort
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="
                  h-11 w-full rounded-full border px-4 pr-10 text-sm
                  shadow-sm outline-none transition
                  bg-slate-50
                  focus:bg-white
                  focus:ring-2
                "
                style={{ borderColor: BRAND.sand, color: BRAND.navy }}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
              >
                <EyeIcon />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Über das Augensymbol kannst du dein aktuelles Passwort ein- oder
              ausblenden.
            </p>
          </div>

          <div className="md:col-span-2 mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500 md:max-w-[70%] leading-relaxed">
              Aus Sicherheitsgründen solltest du dein Passwort regelmäßig
              ändern und nicht mehrfach verwenden.
            </p>

            <button
              type="button"
              onClick={openResetModal}
              className="
                inline-flex items-center gap-2
                rounded-full px-4 py-2 text-xs font-semibold
                shadow-[0_6px_18px_rgba(0,0,0,0.16)]
                hover:-translate-y-[1px] transition
              "
              style={{
                background: BRAND.gold,
                color: BRAND.navy,
                border: "1px solid rgba(255,255,255,0.9)",
              }}
            >
              Passwort zurücksetzen
            </button>
          </div>
        </div>
      </Card>

      {showResetModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeResetModal();
          }}
        >
          <div
            className="w-full max-w-md px-4 sm:px-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-40 w-40 rounded-full bg-gradient-to-br from-[#E3BB62]/40 via-amber-400/20 to-transparent opacity-70"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -left-24 -bottom-24 h-40 w-40 rounded-full bg-gradient-to-tr from-sky-500/15 via-indigo-500/10 to-transparent opacity-70"
                aria-hidden="true"
              />

              <div className="relative px-6 pt-6 pb-5">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Passwort zurücksetzen
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Bitte gib dein aktuelles Passwort ein und wähle ein neues,
                  sicheres Passwort.
                </p>

                {resetError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {resetError}
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Aktuelles Passwort
                    </label>
                    <input
                      type="password"
                      className="h-10 rounded-xl border px-3 text-sm outline-none bg-slate-50 focus:bg-white focus:border-[#E3BB62] focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]"
                      value={resetCurrent}
                      onChange={(e) => setResetCurrent(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Neues Passwort
                    </label>
                    <input
                      type="password"
                      className="h-10 rounded-xl border px-3 text-sm outline-none bg-slate-50 focus:bg-white focus:border-[#E3BB62] focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]"
                      value={resetNew}
                      onChange={(e) => setResetNew(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Neues Passwort bestätigen
                    </label>
                    <input
                      type="password"
                      className="h-10 rounded-xl border px-3 text-sm outline-none bg-slate-50 focus:bg-white focus:border-[#E3BB62] focus:ring-2 focus:ring-[rgba(227,187,98,0.45)]"
                      value={resetConfirm}
                      onChange={(e) => setResetConfirm(e.target.value)}
                    />
                  </div>

                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                    <p className="font-semibold text-slate-600">
                      Kriterien für ein sicheres Passwort:
                    </p>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      <li>mindestens 12 Zeichen</li>
                      <li>Groß- und Kleinbuchstaben</li>
                      <li>Zahlen und Sonderzeichen</li>
                      <li>kein bereits verwendetes Passwort</li>
                    </ul>
                  </div>

                  <div className="mt-3 flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={closeResetModal}
                      className="
                        h-9 px-3 rounded-xl border text-xs font-medium
                        bg-[#f3f3f3] hover:bg-[#e5e5e5]
                      "
                      style={{ borderColor: "#e5e7eb", color: BRAND.navy }}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="
                        h-9 px-4 rounded-xl text-xs font-semibold
                        shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                        hover:-translate-y-[1px] transition
                      "
                      style={{
                        background: BRAND.gold,
                        color: BRAND.navy,
                      }}
                    >
                      Änderungen übernehmen
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ===== Haupt-Komponente ===== */

type AuthSession = {
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  accessToken: string;
  expiresAt: number;
  rememberMe: boolean;
};

function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem("auth_session");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch (err) {
    console.error("auth_session konnte nicht geparst werden", err);
    return null;
  }
}


const EmployeeProfile: React.FC = () => {

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<ProfileFormData>({
    name: "Max Mustermann",
    email: "max.mustermann@unternehmen.de",
    phone: "+49 123 456789",
    address: "Musterstraße 1, 12345 Musterstadt",
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>(form);
  const [viewProfile, setViewProfile] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);

  const [profileUpdated, setProfileUpdated] = useState("");

  const [profilePassword, setProfilePassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);


  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [showLeaveEditConfirm, setShowLeaveEditConfirm] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({ visible: false, title: "", description: "" });

  useEffect(() => {
    const auth = getAuthSession();

    if (!auth) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);

        const user = await getUserProfile(auth.user.id);

        const address = [
          user.street,
          user.postalCode,
          user.city,
          user.country,
        ]
          .filter(Boolean)
          .join(", ");

        const nextForm: ProfileFormData = {
          name: user.name ?? auth.user.username,
          email: user.email ?? auth.user.email,
          phone: user.phone ?? "",
          address: address,
        };

        setForm(nextForm);
        setOriginalData(nextForm);
        setViewProfile(nextForm);

        const avatarUrl = buildAvatarUrl(user.profileImagePath);
        if (avatarUrl) {
          setAvatarImage(avatarUrl);
        }

        updateProfileUpdatedText();
      } catch (err) {
        console.error("Fehler beim Laden des Profils", err);

        const fallback: ProfileFormData = {
          name: auth.user.username,
          email: auth.user.email,
          phone: "",
          address: "",
        };
        setForm(fallback);
        setOriginalData(fallback);
        setViewProfile(fallback);
        updateProfileUpdatedText();
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const updateProfileUpdatedText = () => {
    const today = new Date().toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setProfileUpdated(`Zuletzt aktualisiert am ${today}`);
  };

  const markChanged = () => setHasChanges(true);

  const handleInputChange =
    (field: keyof ProfileFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        markChanged();
      };

  const showToastMessage = (title: string, description: string) => {
    setToast({ visible: true, title, description });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const saveChanges = async (): Promise<boolean> => {
    const auth = getAuthSession();
    if (!auth) {
      showToastMessage(
        "Fehler",
        "Die Sitzung ist abgelaufen. Bitte melde dich erneut an."
      );
      return false;
    }

    if (!profilePassword) {
      setPasswordError("Bitte gib dein aktuelles Passwort ein.");
      return false;
    }

    try {
      const body: UpdateProfileRequest = {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        street: form.address || undefined,
        postalCode: undefined,
        city: undefined,
        country: undefined,
        currentPassword: profilePassword,   // ✅ HIER
      };

      await updateUserProfile(auth.user.id, body);

      setOriginalData(form);
      setViewProfile(form);
      setHasChanges(false);
      setEditingPersonal(false);
      setProfileUpdated(`Zuletzt aktualisiert am ${new Date().toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`);

      setProfilePassword("");               // Passwort aus dem State löschen
      setPasswordError(null);

      showToastMessage(
        "Änderungen gespeichert",
        "Ihr Profil wurde erfolgreich aktualisiert."
      );

      return true;
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Profils", err);
      showToastMessage(
        "Fehler",
        "Die Profiländerungen konnten nicht gespeichert werden."
      );
      return false;
    }
  };




  const resetChanges = () => {
    setForm(originalData);
    setHasChanges(false);
    showToastMessage("Zurückgesetzt", "Alle Änderungen wurden verworfen.");
  };

  const toggleEditingPersonal = () => {
    // noch nicht im Edit-Mode -> einfach öffnen
    if (!editingPersonal) {
      setEditingPersonal(true);
      return;
    }

    // im Edit-Mode, aber keine Änderungen -> einfach schließen
    if (!hasChanges) {
      setEditingPersonal(false);
      return;
    }

    // im Edit-Mode + Änderungen -> Dialog anzeigen
    setShowLeaveEditConfirm(true);
  };

  const handleConfirmSave = async () => {
    const ok = await saveChanges();
    if (ok) {
      setShowLeaveEditConfirm(false);
    }
  };

  const handleConfirmDiscard = () => {
    setForm(originalData);   // alles zurück
    setHasChanges(false);
    setEditingPersonal(false);
    setShowLeaveEditConfirm(false);
  };

  const openUploadModal = () => setShowUploadModal(true);
  const closeUploadModal = () => setShowUploadModal(false);
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const auth = getAuthSession();
  if (!auth) {
    showToastMessage(
      "Fehler",
      "Die Sitzung ist abgelaufen. Bitte melde dich erneut an."
    );
    return;
  }

  try {
    // 1. zum Backend hochladen
    const profileImagePath = await uploadAvatar(auth.user.id, file);
    console.log("uploadAvatar → profileImagePath:", profileImagePath);

    if (!profileImagePath) {
      showToastMessage(
        "Fehler",
        "Das Profilfoto konnte nicht gespeichert werden."
      );
      return;
    }

    // 2. URL für das Bild bauen
    const url = buildAvatarUrl(profileImagePath);
    console.log("buildAvatarUrl →", url);

    if (url) {
      setAvatarImage(url);        // <--- WICHTIG
    }

    showToastMessage(
      "Foto hochgeladen",
      "Ihr Profilfoto wurde erfolgreich aktualisiert."
    );
  } catch (err) {
    console.error("Fehler beim Hochladen des Avatars", err);
    showToastMessage(
      "Fehler",
      "Beim Hochladen des Profilfotos ist ein Fehler aufgetreten."
    );
  }
};

const handleAvatarDelete = async () => {
  const auth = getAuthSession();
  if (!auth) {
    showToastMessage(
      "Fehler",
      "Die Sitzung ist abgelaufen. Bitte melde dich erneut an."
    );
    return;
  }

  try {
    await deleteAvatar(auth.user.id);
    setAvatarImage(null);
    showToastMessage(
      "Foto entfernt",
      "Ihr Profilfoto wurde entfernt."
    );
  } catch (err) {
    console.error("Fehler beim Löschen des Avatars", err);
    showToastMessage(
      "Fehler",
      "Das Profilfoto konnte nicht gelöscht werden."
    );
  }
};




  const handlePasswordResetToast = () => {
    showToastMessage(
      "Passwort zurücksetzen",
      "Sobald diese Funktion angebunden ist, erhalten Sie einen Link zum Zurücksetzen Ihres Passworts."
    );
  };

  const initials =
    viewProfile.name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";


  return (
    <AdminLayout>
      <main
        className="min-h-[calc(100vh-64px)] px-6 pb-10 pt-10"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.18) 0, transparent 40%)," +
            "radial-gradient(circle at 100% 0, rgba(86,118,143,0.18) 0, transparent 42%)," +
            "linear-gradient(to bottom, #182734 0, #264555 220px, #e3e6ec 220px, #f4f5f8 100%)",
        }}
      >
        {toast.visible && (
          <div className="fixed right-8 top-8 z-50 rounded-lg bg-white px-5 py-3 shadow-xl animate-[slideIn_0.3s_ease-out]">
            <div className="font-semibold">{toast.title}</div>
            <div className="text-sm text-slate-500">{toast.description}</div>
          </div>
        )}

        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="space-y-6">
              <div className="h-72 rounded-3xl bg-slate-200/60 animate-pulse" />
              <div className="h-64 rounded-2xl bg-slate-200/60 animate-pulse" />
            </div>
          ) : (
            <>
              {/* HERO */}
              <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-[#182734] via-[#264555] to-[#182734] p-8 md:p-10 text-white shadow-[0_18px_45px_rgba(8,20,35,0.75)]">
                <div
                  className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-[#E3BB62]/40 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -right-24 bottom-[-80px] h-64 w-64 rounded-full bg-[#56768f]/45 blur-3xl"
                  aria-hidden="true"
                />

                <div
                  className="pointer-events-none absolute inset-[-40px] opacity-18 mix-blend-soft-light"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />

                <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl space-y-4">
                    <div className="inline-flex items-center gap-3 rounded-3xl border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                      <div className="relative">
                        <div className="absolute inset-[-8px] rounded-full border border-white/25 opacity-60" />
                        <span className="absolute -top-1 right-2 h-[5px] w-[5px] rounded-full bg-[#E3BB62]" />
                        <span className="absolute bottom-0 -left-1 h-[4px] w-[4px] rounded-full bg-sky-300" />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 border border-white/40 text-white">
                          <User size={22} />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                          SYSTEM · MANAGEMENT
                        </span>
                        <span className="text-[11px] text-white/85">
                          Management & Administration der Plattform
                        </span>
                      </div>
                    </div>

                    <div>
                      <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
                        Mein Profil
                      </h1>
                      <p className="mt-2 text-sm md:text-base text-white/90 max-w-xl">
                        Verwalte deine persönlichen Daten und Zugangsdaten im
                        Profiler.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-left">
                      <div
                        className="
                          relative inline-flex items-center gap-2
                          rounded-full border border-white/30
                          bg-gradient-to-r from-white/10 via-white/5 to-transparent
                          px-5 py-1.5
                          text-[11px] font-medium tracking-wide
                          text-white/90
                          shadow-[0_10px_25px_rgba(0,0,0,0.55)]
                          backdrop-blur-md
                        "
                      >
                        <span
                          className="
                            h-2.5 w-2.5 rounded-full bg-[#E3BB62]
                            shadow-[0_0_12px_rgba(227,187,98,0.9)]
                          "
                        />
                        <span className="whitespace-nowrap">
                          CapConsulting ·{" "}
                          <span className="font-semibold text-[#E3BB62]">
                            ICA³
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex flex-1 items-center justify-center md:justify-end">
                    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/8 px-6 py-6 text-white shadow-[0_16px_40px_rgba(0,0,0,0.65)] border border-white/15 backdrop-blur-xl md:flex-row md:gap-6">
                      <div className="relative shrink-0">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/40 bg-white/10 text-3xl font-bold text-white">
                          {avatarImage ? (
                            <img
                              src={avatarImage}
                              alt="Avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={openUploadModal}
                          className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#264555] shadow-md hover:bg-[#ebebec]"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                          </svg>
                        </button>
                      </div>
                      {avatarImage && (
  <button
    type="button"
    onClick={handleAvatarDelete}
    className="mt-2 text-[11px] text-red-100 hover:text-red-200 underline decoration-red-300/70"
  >
    Foto entfernen
  </button>
)}

                      <div className="space-y-1 text-sm text-slate-100 text-center md:text-left">
                        <div className="text-base font-semibold text-white">
                          {viewProfile.name}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Mail size={14} className="text-[#E3BB62]" />
                            <span>{viewProfile.email}</span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Phone size={14} className="text-[#E3BB62]" />
                            <span>{viewProfile.phone}</span>
                          </div>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <MapPin size={14} className="text-[#E3BB62]" />
                            <span>{viewProfile.address}</span>
                          </div>
                        </div>
                        {profileUpdated && (
                          <p className="mt-2 text-[11px] text-slate-200">
                            {profileUpdated}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Unterer Bereich: Profil-Einstellungen */}
              <div
                className="
    mx-auto max-w-4xl space-y-6
    mt-2
    rounded-[26px]
    border
    px-4 py-5 md:px-6 md:py-7
    bg-gradient-to-b from-[#f3f4f7] via-[#f9fafb] to-[#ffffff]
  "
                style={{ borderColor: BRAND.sand }}
              >
                {/* kleiner Chip oben */}
                <div className="mb-3 flex justify-start">
                  <div
                    className="
        inline-flex items-center gap-2 rounded-full
        border border-[#ebebec]
        bg-gradient-to-b from-white to-[#f7f5f2]
        px-4 py-1.5
        text-[12px]
        shadow-[0_8px_18px_rgba(0,0,0,0.08)]
      "
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#264555]/8 text-[#264555]">
                      <User size={14} />
                    </span>
                    <span className="text-[#56768f]">
                      Profil&nbsp;·&nbsp;
                      <span className="font-semibold text-[#264555]">Einstellungen</span>
                    </span>
                  </div>
                </div>

                {/* Persönliche Daten */}
                <Card
                  title="Persönliche Daten"
                  icon={<User size={20} />}
                  extra={
                    <button
                      type="button"
                      onClick={toggleEditingPersonal}
                      className="
        inline-flex items-center gap-2 rounded-full px-3 py-1.5
        text-[11px] font-semibold
        border
      "
                      style={{
                        borderColor: BRAND.sand,
                        background: editingPersonal ? BRAND.navy : "#ffffff",
                        color: editingPersonal ? "#ffffff" : BRAND.navy,
                      }}
                    >
                      {editingPersonal ? "Bearbeitung beenden" : "Bearbeiten"}
                    </button>
                  }
                >

                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-500 mb-1">
                      Diese Angaben werden in deinem Profil und in Kurzprofilen verwendet.
                    </p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2 flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-600">Name</label>
                        <input
                          className={`
    h-11 rounded-lg border px-3 text-sm shadow-sm outline-none transition
    ${editingPersonal
                              ? "bg-slate-50 text-slate-800 focus:bg-white focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            }
  `}
                          disabled={!editingPersonal}
                          value={form.name}
                          onChange={handleInputChange("name")}
                          placeholder="Name eingeben"
                        />

                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-600">E-Mail</label>
                        <input
                          type="email"
                          className={`
    h-11 rounded-lg border px-3 text-sm shadow-sm outline-none transition
    ${editingPersonal
                              ? "bg-slate-50 text-slate-800 focus:bg-white focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            }
  `}
                          disabled={!editingPersonal}
                          value={form.email}
                          onChange={handleInputChange("email")}
                          placeholder="E-Mail eingeben"
                        />

                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-600">
                          Telefonnummer
                        </label>
                        <input
                          className={`
    h-11 rounded-lg border px-3 text-sm shadow-sm outline-none transition
    ${editingPersonal
                              ? "bg-slate-50 text-slate-800 focus:bg-white focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            }
  `}
                          disabled={!editingPersonal}
                          value={form.phone}
                          onChange={handleInputChange("phone")}
                          placeholder="Telefonnummer eingeben"
                        />
                      </div>

                      <div className="md:col-span-2 flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-600">Adresse</label>
                        <input
                          className={`
    h-11 rounded-lg border px-3 text-sm shadow-sm outline-none transition
    ${editingPersonal
                              ? "bg-slate-50 text-slate-800 focus:bg-white focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            }
  `}
                          disabled={!editingPersonal}
                          value={form.address}
                          onChange={handleInputChange("address")}
                          placeholder="Adresse eingeben (Straße, PLZ, Ort)"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Passwort & Sicherheit (deine neue Section von oben bleibt 1:1) */}
                <PasswordSection onReset={handlePasswordResetToast} />

                {/* Footer-Buttons */}
              </div>

            </>
          )}
        </div>

        {showUploadModal && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeUploadModal();
            }}
          >
            <div className="w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4">
                <h3 className="mb-1 text-lg font-semibold">
                  Profilfoto ändern
                </h3>
                <p className="text-xs text-slate-500">
                  Laden Sie ein neues Foto hoch, um Ihr Profil zu
                  personalisieren.
                </p>
              </div>
              <button
                type="button"
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-10 text-sm text-slate-500 transition hover:border-[#56768f] hover:bg-[#ebebec]"
                onClick={() => !avatarUploading && fileInputRef.current?.click()}
                disabled={avatarUploading}
              >
                <svg
                  className="h-8 w-8 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Klicken zum Hochladen</span>
                {/* Icon + Text */}
                <span>{avatarUploading ? "Lade hoch..." : "Klicken zum Hochladen"}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}
      </main>
      {showLeaveEditConfirm && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLeaveEditConfirm(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Änderungen übernehmen?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Du hast Änderungen vorgenommen. Um sie zu speichern, gib bitte dein aktuelles Passwort ein.
            </p>

            <div className="mb-3 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">
                Aktuelles Passwort
              </label>
              <input
                type="password"
                className="h-10 rounded-xl border px-3 text-sm outline-none bg-slate-50
                     focus:bg-white focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                value={profilePassword}
                onChange={(e) => {
                  setProfilePassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
              />
              {passwordError && (
                <p className="mt-1 text-[11px] text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="h-9 px-3 rounded-xl border text-xs font-medium
                     bg-[#f3f3f3] hover:bg-[#e5e5e5] text-slate-700"
              >
                Nein, verwerfen
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="h-9 px-4 rounded-xl text-xs font-semibold shadow
                     bg-[#56768f] text-white hover:bg-[#264555]"
              >
                Ja, speichern
              </button>
            </div>
          </div>
        </div>
      )}



    </AdminLayout>
  );
};

export default EmployeeProfile;
