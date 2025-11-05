import { Link, NavLink } from "react-router-dom";
import AdminLayout from "@/apps/app/AdminLayout";
import { Users, Building2, ClipboardList, ArrowRight } from "lucide-react";

// NOTE: This component reproduces the original look using Tailwind-only.
// No external CSS imports. All styles are mapped via Tailwind utilities
// (including arbitrary values where needed for exact colors, gradients, and shadows).

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
    title: "Audit Logs",
    desc: "View system activity and changes",
    count: 5,
    to: "/admin/adminPanel/audit",
    icon: ClipboardList,
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
      {/* ===== Hero Header (Tailwind) ===== */}
      <header
        className="relative bg-[hsl(60_9%_97.8%)] border-b border-[hsl(214.3_31.8%_91.4%)] px-8 py-4"
      >
        {/* Shadow line under header (pseudo replacement) */}
        <div className="pointer-events-none absolute left-0 right-0 top-[calc(64px-1px)] h-0 [box-shadow:0_10px_16px_-14px_rgba(15,23,42,.18)]" />

        <div className="grid grid-cols-3 items-center gap-2 lg:grid-cols-1 lg:justify-items-center lg:text-center">
          <div className="justify-self-start hidden lg:flex items-center lg:justify-self-center" />

          <div className="justify-self-center">
            <div className="[&>h1]:text-[clamp(28px,6vw,56px)] [&>h1]:font-extrabold [&>h1]:tracking-[-0.02em] [&>h1]:m-0 [&>h1]:mb-4 [&>h1]:leading-[1.05] [&>h1]:text-[#264555] [&>p]:mt-0 [&>p]:text-[#334155] [&>p]:opacity-90 [&>p]:text-[clamp(14px,1.6vw,18px)]">
              <h1>Admin Panel</h1>
              <p>Manage users, companies, and monitor system activities.</p>
            </div>
          </div>

          <div className="justify-self-end inline-flex lg:justify-self-center" />
        </div>
      </header>

      {/* ===== Main Surface ===== */}
      <div className="bg-[hsl(0_0%_92%)] min-h-[calc(100vh-64px)] mt-2 px-6 py-6">
        <div className="mx-auto max-w-[1400px] xl:max-w-[1600px] rounded-xl border border-[hsl(30_15%_85%)] bg-[#f5f6f7] p-6 [box-shadow:0_1px_0_rgba(0,0,0,.02),_0_12px_30px_-20px_rgba(38,69,85,.25)] text-[hsl(205_35%_24%)] md:rounded-[12px] md:p-6">
          {/* ===== Breadcrumb ===== */}
          <nav
            className="mb-4 flex gap-2 text-[0.9rem] text-[hsl(0_0%_50%)]"
            aria-label="Breadcrumb"
          >
            <NavLink to="/admin" end className="text-inherit no-underline hover:underline">
              Admin
            </NavLink>
            <span className="opacity-60">›</span>
            <span className="truncate">Panel</span>
          </nav>

          {/* ===== Page Header ===== */}
          <div className="mb-6">
            <h2 className="m-0 mb-[6px] text-[2rem] font-bold leading-tight">Admin Panel</h2>
            <p className="m-0 max-w-[720px] leading-relaxed text-[hsl(0_0%_50%)]">
              Manage users, companies, and monitor system activities.
            </p>
          </div>

          {/* ===== KPI Cards Grid ===== */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {PANELS.map(({ title, desc, count, to, icon: Icon }) => (
              <Link
                key={title}
                to={to}
                className="flex h-full flex-col rounded-[10px] border border-[hsl(30_15%_85%)] bg-[hsl(0_0%_98%)] p-5 text-inherit no-underline shadow-[0_4px_6px_-1px_hsl(205_35%_24%_/_0.08)] transition-transform duration-200 hover:translate-y-[-1px] hover:shadow-[0_10px_25px_-5px_hsl(205_35%_24%_/_0.12)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-[10px] bg-[hsl(205_35%_24%_/_0.08)] p-2.5 text-[hsl(205_35%_24%)]">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="m-0 text-[1.1rem] font-semibold leading-snug">{title}</h3>
                      <p className="m-0 mt-[2px] line-clamp-2 text-[0.92rem] text-[hsl(0_0%_50%)]">{desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="text-[hsl(0_0%_50%)] transition-colors group-hover:text-[hsl(205_35%_24%)]" size={18} />
                </div>
                <div className="mt-auto pt-2 text-[2rem] font-extrabold leading-none text-[hsl(205_35%_24%)]">{count}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
