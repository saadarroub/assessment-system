import { Link } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { Users, Building2, ClipboardList, Shield, ArrowRight } from "lucide-react";
import PageHeader from "@/features/admin-area/catalogs/PageHeader";

/* ===== Farb-Tokens wie bei CompaniesList ===== */
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

/* ===== Typen & Panels ===== */
type Panel = {
  title: string;
  desc: string;
  count: number | string;
  to: string;
  icon: React.ComponentType<{ size?: number }>;
};

const PANELS: Panel[] = [
  {
    title: "Users",
    desc: "Manage user accounts and permissions",
    count: 4,
    to: "/admin/adminPanel/users",
    icon: Users,
  },
  {
    title: "Companies",
    desc: "Manage company settings and users",
    count: 3,
    to: "/admin/adminPanel/companies",
    icon: Building2,
  },
  {
    title: "Roles",
    desc: "Manage roles and access permissions",
    count: "–",
    to: "/admin/adminPanel/roles",
    icon: Shield,
  },
  {
    title: "Alle Zuweisungen",
    desc: "View katalog zuweisungen",
    count: 5,
    to: "/admin/adminPanel/zuweisungen",
    icon: ClipboardList,
  },
];

export default function AdminPanelPage() {
  return (
    <AdminLayout>
      {/* ===== Hero Header wie bei CompaniesList / PageHeader ===== */}
      <PageHeader
        title="Admin Panel"
        subtitle="Manage users, companies, roles and monitor system activities."
        icon={<Users size={40} />}
        gradient="navy"
        height="280px"
        showPattern={true}
      />

      {/* ===== Main-Bereich: gleicher Stil wie bei CompaniesList ===== */}
      <main
        className="mt-0 min-h-[calc(100vh-64px)] px-6 pb-8 pt-20"
        style={{
          background:
            "radial-gradient(circle at 0 0, rgba(227,187,98,0.13) 0, transparent 40%)," +
            "radial-gradient(circle at 100% 0, rgba(56,189,248,0.10) 0, transparent 42%)," +
            "linear-gradient(to bottom, #f3f4f7 0, #e6e9ef 240px, #f4f5f8 100%)",
        }}
      >
        {/* ===== Breadcrumb-Pill (Admin › Panel) ===== */}
        <div className="mx-auto mb-4 flex max-w-[1400px] items-center justify-between xl:max-w-[1600px]">
          <nav className="flex items-center">
            <div
              className="
                inline-flex items-center gap-2
                rounded-full border
                px-3 py-1.5
                text-xs sm:text-sm
                bg-white/80
                shadow-[0_4px_10px_rgba(0,0,0,0.06)]
                backdrop-blur-[2px]
              "
              style={{ borderColor: BRAND.sand }}
            >
              {/* Icon-Badge */}
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: "rgba(38,69,85,0.06)",
                  color: BRAND.navy,
                }}
              >
                <Users size={14} />
              </span>

              <span
                className="hover:underline cursor-default"
                style={{ color: CSS.mutedFg }}
              >
                Admin
              </span>

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
                Panel
              </span>
            </div>
          </nav>
          {/* Rechts könnte später ein Button hin – aktuell leer */}
          <div className="h-6" />
        </div>

        {/* ===== Hauptkarte mit Titel + Kacheln (angepasst auf neuen Stil) ===== */}
        <div
          className="
            mx-auto
            max-w-[1400px] xl:max-w-[1600px]
            rounded-xl md:rounded-[12px]
            border
            p-6
            text-[hsl(205_35%_24%)]
            shadow-[0_1px_0_rgba(0,0,0,.02),_0_12px_30px_-20px_rgba(38,69,85,.25)]
          "
          style={{
            borderColor: CSS.border,
            background: BRAND.fog,
          }}
        >
          {/* Seite Titel + Text */}
          <div className="mb-6">
            <h2 className="m-0 mb-[6px] text-[2rem] font-bold leading-tight text-[#264555]">
              Admin Panel
            </h2>
            <p
              className="m-0 max-w-[720px] leading-relaxed"
              style={{ color: CSS.mutedFg }}
            >
              Manage users, companies, roles and catalog assignments in one
              central place.
            </p>
          </div>

          {/* ===== Kachel-Grid – gleiche Karten wie vorher, nur leicht verfeinert ===== */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {PANELS.map(({ title, desc, count, to, icon: Icon }) => (
              <Link
                key={title}
                to={to}
                className="
                  group
                  flex h-full flex-col
                  rounded-[12px]
                  border
                  p-5
                  text-inherit no-underline
                  shadow-[0_4px_6px_-1px_hsl(205_35%_24%_/_0.08)]
                  transition
                  hover:-translate-y-[2px]
                  hover:shadow-[0_12px_30px_-10px_hsl(205_35%_24%_/_0.18)]
                "
                style={{
                  borderColor: CSS.border,
                  background: CSS.card,
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-[10px] p-2.5"
                      style={{
                        background: "rgba(38,69,85,0.08)",
                        color: "#264555",
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="m-0 text-[1.1rem] font-semibold leading-snug text-[#264555]">
                        {title}
                      </h3>
                      <p
                        className="m-0 mt-[2px] text-[0.92rem]"
                        style={{ color: CSS.mutedFg }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="opacity-70 transition-colors group-hover:text-[#264555]"
                    style={{ color: CSS.mutedFg }}
                  />
                </div>

                <div className="mt-auto pt-2 text-[2rem] font-extrabold leading-none text-[#264555]">
                  {count}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
