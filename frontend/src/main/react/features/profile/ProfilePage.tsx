import React, { useEffect, useRef, useState } from "react";

/* ===== Typen ===== */

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
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
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
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
    firstName: "Max",
    lastName: "Mustermann",
    email: "max.mustermann@unternehmen.de",
    phone: "+49 123 456789",
    street: "Musterstraße 123",
    zipCode: "12345",
    city: "Berlin",
    country: "Deutschland",
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>(form);
  const [hasChanges, setHasChanges] = useState(false);

  // Header-Infos
  const [profileName, setProfileName] = useState("Max Mustermann");
  const [profileEmail, setProfileEmail] = useState("max.mustermann@unternehmen.de");
  const [profileUpdated, setProfileUpdated] = useState("");
  const [profileRole] = useState("Senior Developer");
  const [profileCompany] = useState("Tech Solutions GmbH");

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
    const name = `${form.firstName} ${form.lastName}`.trim();
    setProfileName(name);
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

  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase();

  /* ===== JSX ===== */

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
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
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 p-10 shadow-2xl">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-white/5 blur-2xl" />

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
                    className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sky-600 shadow-xl transition-transform duration-300 hover:scale-110 hover:rotate-6"
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

                  <div className="mb-4 flex flex-wrap justify-center gap-2 md:justify-start">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs backdrop-blur">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                      <span>{profileRole}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs backdrop-blur">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <span>{profileCompany}</span>
                    </span>
                  </div>

                  <p className="text-xs opacity-70">{profileUpdated}</p>
                </div>
              </div>
            </div>

            {/* Persönliche Daten */}
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
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Vorname</label>
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.firstName}
                    onChange={handleInputChange("firstName")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Nachname</label>
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.lastName}
                    onChange={handleInputChange("lastName")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">E-Mail</label>
                  <input
                    type="email"
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.email}
                    onChange={handleInputChange("email")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Telefonnummer</label>
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.phone}
                    onChange={handleInputChange("phone")}
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Straße und Hausnummer
                  </label>
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.street}
                    onChange={handleInputChange("street")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">PLZ</label>
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.zipCode}
                    onChange={handleInputChange("zipCode")}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Stadt</label>
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.city}
                    onChange={handleInputChange("city")}
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Land</label>
                  <input
                    className="h-11 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={form.country}
                    onChange={handleInputChange("country")}
                  />
                </div>
              </div>
            </Card>

            {/* Unternehmensinformationen */}
            <Card
              title="Unternehmensinformationen"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                  <path d="M9 22v-4h6v4"></path>
                </svg>
              }
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { label: "Unternehmen", value: "Tech Solutions GmbH" },
                  { label: "Abteilung / Workspace", value: "IT & Development" },
                  { label: "Rolle", value: "Senior Developer" },
                  { label: "Eintrittsdatum", value: "2020-03-15", type: "date" },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">
                      {field.label}
                    </label>
                    <input
                      type={field.type ?? "text"}
                      className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 shadow-sm"
                      value={field.value}
                      disabled
                    />
                  </div>
                ))}
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
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
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
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                Zurücksetzen
              </button>
              <button
                type="button"
                disabled={!hasChanges}
                onClick={saveChanges}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-3 text-sm font-medium text-white shadow-md transition hover:bg-sky-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-10 text-sm text-slate-500 transition hover:border-sky-400 hover:bg-slate-50"
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
