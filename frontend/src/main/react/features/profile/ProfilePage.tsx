import React, { useEffect, useRef, useState } from "react";

/* ===== Typen ===== */

type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
};

type CardProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

/* ===== Card-Helper (AUßERHALB der Komponente!) ===== */

const Card: React.FC<CardProps> = ({ title, icon, children }) => (
  <div className="mb-6 rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-lg">
    <div className="border-b border-slate-100 px-6 pb-4 pt-6">
      <h2 className="flex items-center gap-3 text-lg font-semibold text-slate-800">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#264555]/10 text-[#264555]">
          {icon}
        </span>
        {title}
      </h2>
    </div>
    <div className="px-6 pb-6 pt-4">{children}</div>
  </div>
);

/* ===== Haupt-Komponente ===== */

const EmployeeProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<ProfileFormData>({
    name: "Max Mustermann",
    email: "max.mustermann@unternehmen.de",
    phone: "+49 123 456789",
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>(form);
  const [hasChanges, setHasChanges] = useState(false);

  // Header-Infos
  const [profileName, setProfileName] = useState("Max Mustermann");
  const [profileEmail, setProfileEmail] = useState("max.mustermann@unternehmen.de");
  const [profileUpdated, setProfileUpdated] = useState("");

  // Avatar
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast
  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({ visible: false, title: "", description: "" });

  // Passwort
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  /* ===== Effekte ===== */

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      updateProfileHeader();
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== Helper-Funktionen ===== */

  const updateProfileHeader = () => {
    const name = form.name.trim();
    setProfileName(name || "Unbekannter Benutzer");
    setProfileEmail(form.email);

    const today = new Date().toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setProfileUpdated(`Zuletzt aktualisiert am ${today}`);
  };

  const markChanged = () => {
    setHasChanges(true);
  };

  const handleInputChange =
    (field: keyof ProfileFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      markChanged();
    };

  const saveChanges = () => {
    updateProfileHeader();
    setOriginalData(form);
    setHasChanges(false);
    showToast("Änderungen gespeichert", "Ihre Profildaten wurden erfolgreich aktualisiert.");
  };

  const resetChanges = () => {
    setForm(originalData);
    setHasChanges(false);
    updateProfileHeader();
    showToast("Zurückgesetzt", "Alle Änderungen wurden verworfen.");
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswords = (nextNew?: string, nextConfirm?: string) => {
    const newPw = nextNew ?? newPassword;
    const confirmPw = nextConfirm ?? confirmPassword;

    if (!newPw || !confirmPw) {
      setPasswordError("");
      setPasswordSuccess("");
      return;
    }

    if (newPw.length < 8) {
      setPasswordError("Passwort muss mindestens 8 Zeichen lang sein");
      setPasswordSuccess("");
      return;
    }

    if (newPw !== confirmPw) {
      setPasswordError("Passwörter stimmen nicht überein");
      setPasswordSuccess("");
    } else {
      setPasswordError("");
      setPasswordSuccess("Passwörter stimmen überein ✓");
    }
  };

  const openUploadModal = () => setShowUploadModal(true);
  const closeUploadModal = () => setShowUploadModal(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setAvatarImage(reader.result);
        closeUploadModal();
        showToast("Foto hochgeladen", "Ihr Profilfoto wurde erfolgreich aktualisiert.");
      }
    };
    reader.readAsDataURL(file);
  };

  const showToast = (title: string, description: string) => {
    setToast({ visible: true, title, description });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Initialen aus dem Namen (max. 2 Buchstaben)
  const initials =
    form.name
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  /* ===== JSX ===== */

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ebebec] to-white px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Toast */}
        {toast.visible && (
          <div className="fixed right-8 top-8 z-50 rounded-lg bg-white px-5 py-3 shadow-xl animate-[slideIn_0.3s_ease-out]">
            <div className="font-semibold">{toast.title}</div>
            <div className="text-sm text-slate-500">{toast.description}</div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#264555] via-[#56768f] to-[#264555] p-10 shadow-2xl">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex flex-col items-center gap-8 md:flex-row">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white/40 bg-white/20 text-4xl font-bold text-white shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-105">
                    {avatarImage ? (
                      <img src={avatarImage} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={openUploadModal}
                    className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#264555] shadow-xl transition-transform duration-300 hover:scale-110 hover:rotate-6"
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

                {/* Header-Infos */}
                <div className="text-center text-white md:flex-1 md:text-left">
                  <h1 className="mb-2 text-3xl font-bold drop-shadow-sm">{profileName}</h1>
                  <p className="mb-4 text-base opacity-90">{profileEmail}</p>
                  <p className="text-xs opacity-70">{profileUpdated}</p>
                </div>
              </div>
            </div>

            {/* Persönliche Daten – nur Name, E-Mail, Telefon */}
            <Card
              title="Persönliche Daten"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Name</label>
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                    value={form.name}
                    onChange={handleInputChange("name")}
                    placeholder="Name eingeben"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">E-Mail</label>
                  <input
                    type="email"
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                    value={form.email}
                    onChange={handleInputChange("email")}
                    placeholder="E-Mail eingeben"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Telefonnummer</label>
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                    value={form.phone}
                    onChange={handleInputChange("phone")}
                    placeholder="Telefonnummer eingeben"
                  />
                </div>
              </div>
            </Card>

            {/* Passwort ändern */}
            <Card
              title="Passwort ändern"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Aktuelles Passwort */}
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Aktuelles Passwort
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                      placeholder="Aktuelles Passwort eingeben"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </div>

                {/* Neues Passwort */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Neues Passwort
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                      placeholder="Neues Passwort"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        validatePasswords(e.target.value, undefined);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </div>

                {/* Passwort bestätigen */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Neues Passwort bestätigen
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#56768f] focus:ring-2 focus:ring-[#56768f]/20"
                      placeholder="Passwort bestätigen"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        validatePasswords(undefined, e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-700"
                    >
                      <EyeIcon />
                    </button>
                  </div>
                  {passwordError && (
                    <div className="mt-1 text-xs text-red-500">{passwordError}</div>
                  )}
                  {passwordSuccess && !passwordError && (
                    <div className="mt-1 text-xs text-emerald-500">
                      {passwordSuccess}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Buttons */}
            <div className="sticky bottom-6 flex gap-4 pt-2">
              <button
                type="button"
                disabled={!hasChanges}
                onClick={resetChanges}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#d2c9b9] bg-white px-4 py-3 text-sm font-medium text-[#264555] shadow-sm transition hover:bg-[#ebebec] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                Zurücksetzen
              </button>
              <button
                type="button"
                disabled={!hasChanges}
                onClick={saveChanges}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#56768f] px-4 py-3 text-sm font-medium text-white shadow-md transition hover:bg-[#264555] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                Änderungen speichern
              </button>
            </div>
          </>
        )}
      </div>

      {/* Upload-Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeUploadModal();
          }}
        >
          <div className="w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h3 className="mb-1 text-lg font-semibold">Profilfoto ändern</h3>
              <p className="text-xs text-slate-500">
                Laden Sie ein neues Foto hoch, um Ihr Profil zu personalisieren.
              </p>
            </div>
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-10 text-sm text-slate-500 transition hover:border-[#56768f] hover:bg-[#ebebec]"
              onClick={() => fileInputRef.current?.click()}
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
    </div>
  );
};

/* Kleines Icon als eigene Komponente, damit der Code oben sauber bleibt */
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

export default EmployeeProfile;
