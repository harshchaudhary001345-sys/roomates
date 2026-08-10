import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  EyeOff,
  IndianRupee,
  KeyRound,
  Mail,
  ShieldCheck,
  User,
  Video,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Alert,
  DemoBanner,
  Field,
  SubmitButton,
  inputCls,
} from "../components/app/Shell";
import { DEMO_MODE } from "../lib/api";

const ParticleField = lazy(() => import("../three/DashboardOrb").then((m) => ({ default: m.ParticleField })));

/* -------------------------------------------------------------------------- */
/*  Shared split-screen shell                                                  */
/* -------------------------------------------------------------------------- */

const perks = [
  { icon: IndianRupee, t: "₹0 brokerage, forever", s: "Tenants never pay us a rupee." },
  { icon: Video, t: "Video-verified homes", s: "90-second walkthrough on every listing." },
  { icon: BadgeCheck, t: "ID-verified owners", s: "Three-point identity check." },
  { icon: ShieldCheck, t: "Deposit escrow", s: "Your money tracked, not handed over." },
];

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#04050a]">
      <DemoBanner />
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* ---------- brand panel ---------- */}
        <div className="relative hidden overflow-hidden border-r border-white/8 lg:block">
          <Suspense fallback={null}>
            <ParticleField className="pointer-events-none absolute inset-0 opacity-70" />
          </Suspense>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60rem 40rem at 20% 10%, rgba(124,58,237,0.28), transparent 60%), radial-gradient(50rem 36rem at 80% 80%, rgba(8,145,178,0.22), transparent 60%)",
            }}
          />
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(135deg,#7c3aed,#2563eb_60%,#06b6d4)] ring-1 ring-white/25">
                <KeyRound className="h-5 w-5 text-white" strokeWidth={2.4} />
              </span>
              <span className="text-[18px] font-semibold tracking-[-0.02em] text-white">
                Keyless
              </span>
            </Link>

            <div>
              <h2 className="max-w-md text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-white">
                Rent direct.{" "}
                <span className="text-gradient">Save ₹85,000.</span>
              </h2>
              <div className="mt-10 flex flex-col gap-4">
                {perks.map((p, i) => (
                  <motion.div
                    key={p.t}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.09, duration: 0.5 }}
                    className="flex items-center gap-3.5"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/6 text-violet-200 ring-1 ring-white/10">
                      <p.icon className="h-4.5 w-4.5" />
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold text-white">
                        {p.t}
                      </span>
                      <span className="block text-[12.5px] text-slate-400">{p.s}</span>
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="text-[12px] text-slate-600">
              41,208 verified homes · 6 cities live · ₹214 Cr brokerage never paid
            </p>
          </div>
        </div>

        {/* ---------- form panel ---------- */}
        <div className="flex items-center justify-center px-5 py-12 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-[13px] text-slate-500 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>

            <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.03em] text-white">
              {title}
            </h1>
            <p className="mt-2 text-[14px] text-slate-400">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-6 text-center text-[13.5px] text-slate-500">{footer}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required
        minLength={6}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls + " pr-11"}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-300"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  LOGIN                                                                      */
/* -------------------------------------------------------------------------- */

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await signIn(email, password);
    setLoading(false);
    if (err) setError(err);
    else navigate(from, { replace: true });
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your listings, visits and bookings."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-semibold text-violet-300 hover:text-violet-200">
            Create a free account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && <Alert kind="error">{error}</Alert>}

        <Field label="Email">
          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={inputCls + " pl-10"}
            />
          </div>
        </Field>

        <Field label="Password">
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        </Field>

        <SubmitButton loading={loading} className="mt-2">
          {loading ? "Signing you in" : "Log in"}
        </SubmitButton>

        {DEMO_MODE && (
          <button
            type="button"
            onClick={() => {
              setEmail("owner@keyless.demo");
              setPassword("password123");
            }}
            className="rounded-xl border border-dashed border-white/15 px-4 py-2.5 text-[12.5px] text-slate-400 transition-colors hover:border-violet-400/40 hover:text-white"
          >
            Fill demo account —{" "}
            <span className="font-mono text-violet-300">owner@keyless.demo</span> /{" "}
            <span className="font-mono text-violet-300">password123</span>
          </button>
        )}
      </form>
    </AuthShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  SIGNUP                                                                     */
/* -------------------------------------------------------------------------- */

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "tenant">("tenant");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await signUp(name, email, password, role);
    setLoading(false);
    if (err) setError(err);
    else navigate("/dashboard", { replace: true });
  }

  return (
    <AuthShell
      title="Create your free account"
      subtitle="Free forever for tenants. No card, no brokerage, no catch."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-violet-300 hover:text-violet-200">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && <Alert kind="error">{error}</Alert>}

        <Field label="I am joining as">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/4 p-1 ring-1 ring-white/8">
            {([
              { id: "tenant", label: "Tenant", desc: "Find verified homes" },
              { id: "owner", label: "Owner", desc: "List and verify property" },
            ] as const).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`rounded-lg px-3 py-3 text-left transition-all ${
                  role === r.id
                    ? "bg-[linear-gradient(100deg,rgba(124,58,237,0.45),rgba(8,145,178,0.35))] text-white ring-1 ring-white/20"
                    : "text-slate-400 hover:bg-white/6 hover:text-white"
                }`}
              >
                <span className="block text-[13px] font-semibold">{r.label}</span>
                <span className="mt-0.5 block text-[11px] opacity-75">{r.desc}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Full name">
          <div className="relative">
            <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ananya Rao"
              className={inputCls + " pl-10"}
            />
          </div>
        </Field>

        <Field label="Email">
          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={inputCls + " pl-10"}
            />
          </div>
        </Field>

        <Field label="Password" hint="Minimum 6 characters">
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
        </Field>

        <SubmitButton loading={loading} className="mt-2">
          {loading ? "Creating your account" : "Create free account"}
        </SubmitButton>

        <p className="text-center text-[11.5px] leading-relaxed text-slate-600">
          By continuing you agree to our Terms and Privacy Policy. We never sell your
          number to brokers.
        </p>
      </form>
    </AuthShell>
  );
}
