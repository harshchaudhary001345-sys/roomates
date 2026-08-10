import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Info,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DEMO_MODE } from "../../lib/api";
import NotificationBell from "./NotificationBell";
import { cn } from "../../utils/cn";

/* ========================== small shared pieces ========================== */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white",
        className,
      )}
    />
  );
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner className="h-7 w-7 border-[2.5px]" />
      <p className="text-sm text-slate-500">{label}…</p>
    </div>
  );
}

export function Alert({
  kind = "error",
  children,
}: {
  kind?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const map = {
    error: { i: AlertCircle, c: "border-rose-500/30 bg-rose-500/10 text-rose-200" },
    success: {
      i: CheckCircle2,
      c: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    },
    info: { i: Info, c: "border-sky-400/30 bg-sky-400/10 text-sky-200" },
  }[kind];
  const Icon = map.i;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[13px]",
        map.c,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </motion.div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[12.5px] font-medium text-slate-300">{label}</span>
        {hint && <span className="text-[11px] text-slate-600">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[14px] text-white placeholder:text-slate-600 transition-colors focus:border-violet-400/50 focus:bg-white/8 focus:outline-none focus:ring-2 focus:ring-violet-500/25";

export function SubmitButton({
  loading,
  children,
  className,
}: {
  loading?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#7c3aed,#4f46e5_45%,#0891b2)] px-5 py-3 text-[14px] font-semibold text-white ring-1 shadow-[0_12px_36px_-12px_rgba(109,40,217,0.9)] ring-white/20 transition-opacity disabled:opacity-60",
        className,
      )}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

export function DemoBanner() {
  const [hidden, setHidden] = useState(false);
  if (!DEMO_MODE || hidden) return null;
  return (
    <div className="relative z-40 flex items-center justify-center gap-3 border-b border-amber-400/20 bg-amber-400/8 px-4 py-2 text-center text-[12px] text-amber-200">
      <Info className="h-3.5 w-3.5 shrink-0" />
      <span>
        <strong className="font-semibold">Demo Mode</strong> — running on local storage.
        Add your Supabase keys to <code className="font-mono">.env.local</code> to go live.
      </span>
      <button
        onClick={() => setHidden(true)}
        className="absolute right-3 text-amber-300/60 hover:text-amber-200"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ============================== route guard ============================== */

export function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session" />;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/* ============================== app chrome =============================== */

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/properties", label: "Browse", icon: Search },
  { to: "/add-property", label: "Add property", icon: PlusCircle },
];

export function AppHeader() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#05060c]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#7c3aed,#2563eb_60%,#06b6d4)] ring-1 ring-white/25">
            <KeyRound className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
          </span>
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-white">
            Keyless
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white ring-1 ring-white/15"
                    : "text-slate-400 hover:text-white",
                )
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <div className="hidden items-center gap-2.5 rounded-full bg-white/5 py-1.5 pr-4 pl-1.5 ring-1 ring-white/10 sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#06b6d4)] text-[12px] font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[10rem] truncate text-[13px] font-medium text-slate-200">
                  {user.name}
                </span>
              </div>
              <button
                onClick={() => void signOut()}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 ring-1 ring-white/10 transition-colors hover:bg-white/8 hover:text-white"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-[13.5px] font-medium text-slate-300 hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-4 py-2 text-[13.5px] font-semibold text-white ring-1 ring-white/20"
              >
                Sign up free
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-xl text-white ring-1 ring-white/10 md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/8 md:hidden"
          >
            <div className="flex flex-col gap-1 p-3">
              {navItems.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium",
                      isActive ? "bg-white/10 text-white" : "text-slate-300",
                    )
                  }
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t border-white/8 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-[12px] text-slate-600 sm:flex-row">
        <p>© {new Date().getFullYear()} Keyless Technologies Pvt. Ltd.</p>
        <div className="flex items-center gap-5">
          <Link to="/properties" className="hover:text-slate-300">
            <Building2 className="mr-1.5 inline h-3.5 w-3.5" />
            Browse homes
          </Link>
          <Link to="/dashboard" className="hover:text-slate-300">
            <CalendarCheck className="mr-1.5 inline h-3.5 w-3.5" />
            My bookings
          </Link>
        </div>
      </div>
    </footer>
  );
}

/** Standard page wrapper used by every /app route. */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#04050a]">
      <DemoBanner />
      <AppHeader />
      <main className="relative flex-1">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(50rem 30rem at 15% 0%, rgba(88,28,235,0.12), transparent 60%), radial-gradient(45rem 28rem at 85% 20%, rgba(8,145,178,0.10), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
