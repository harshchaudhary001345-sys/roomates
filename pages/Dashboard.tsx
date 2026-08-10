import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  Inbox,
  Mail,
  MessageSquare,
  PlusCircle,
  Search,
  TrendingUp,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  bookings as bookingsApi,
  listings as listingsApi,
  messages as messagesApi,
  properties as propertiesApi,
} from "../lib/api";
import type { Booking, Conversation, Listing, Property } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { Alert, AppLayout, PageLoader, Spinner } from "../components/app/Shell";
import { PropertyImage, inr } from "../components/app/PropertyCard";
import { CountUp, PulseDot, WaveCard } from "../components/app/AnimatedKit";

const DashboardOrb = lazy(() => import("../three/DashboardOrb"));

type Tab = "properties" | "bookings" | "requests" | "messages";

const statusTone: Record<Booking["status"], string> = {
  pending: "bg-amber-400/12 text-amber-300 ring-amber-400/30",
  confirmed: "bg-emerald-400/12 text-emerald-300 ring-emerald-400/30",
  cancelled: "bg-rose-400/12 text-rose-300 ring-rose-400/30",
};

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
  delay,
  countUpTo,
  prefix = "",
  suffix = "",
}: {
  icon: typeof Building2;
  value: string;
  label: string;
  tone: string;
  delay: number;
  countUpTo?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <WaveCard className="rounded-2xl p-5" glowColor="rgba(99,102,241,0.35)">
        <span className={`grid h-9 w-9 place-items-center rounded-xl bg-white/6 ${tone}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <p className="mt-4 text-[1.9rem] leading-none font-semibold tracking-[-0.03em] text-white">
          {countUpTo != null ? (
            <CountUp to={countUpTo} prefix={prefix} suffix={suffix} />
          ) : (
            value
          )}
        </p>
        <p className="mt-2 text-[12.5px] text-slate-500">{label}</p>
      </WaveCard>
    </motion.div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
}: {
  icon: typeof Inbox;
  title: string;
  body: string;
  cta?: { to: string; label: string };
}) {
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-slate-500">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-[16px] font-semibold text-white">{title}</p>
        <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] text-slate-500">{body}</p>
      </div>
      {cta && (
        <Link
          to={cta.to}
          className="rounded-full bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-2.5 text-[13px] font-semibold text-white ring-1 ring-white/20"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("properties");

  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [p, b, r, l, c] = await Promise.all([
      propertiesApi.byUser(user.id),
      bookingsApi.byUser(user.id),
      bookingsApi.forOwner(user.id),
      listingsApi.byUser(user.id),
      messagesApi.inbox(user.id),
    ]);
    setError(p.error ?? b.error ?? r.error ?? l.error);
    setMyProperties(p.data ?? []);
    setMyBookings(b.data ?? []);
    setRequests(r.data ?? []);
    setMyListings(l.data ?? []);
    setThreads(c.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeProperty(id: string) {
    setBusyId(id);
    await propertiesApi.remove(id);
    await load();
    setBusyId(null);
  }

  async function setStatus(id: string, status: Booking["status"]) {
    setBusyId(id);
    await bookingsApi.setStatus(id, status);
    await load();
    setBusyId(null);
  }

  if (loading)
    return (
      <AppLayout>
        <PageLoader label="Loading your dashboard" />
      </AppLayout>
    );

  const monthlyIncome = myProperties.reduce((s, p) => s + Number(p.price), 0);
  const savedBrokerage = myBookings.reduce(
    (s, b) => s + Number(b.property?.price ?? 0),
    0,
  );

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "properties", label: "My properties", count: myProperties.length },
    { id: "bookings", label: "My bookings", count: myBookings.length },
    { id: "requests", label: "Visit requests", count: requests.length },
    { id: "messages", label: "Messages", count: threads.length },
  ];

  return (
    <AppLayout>
      {/* -------------------------------- header -------------------------------- */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[12.5px] font-medium tracking-[0.14em] text-violet-300 uppercase">
            Dashboard
          </p>
          <h1 className="mt-2 text-[2.2rem] leading-tight font-semibold tracking-[-0.03em] text-white">
            Welcome back, {user?.name.split(" ")[0]}.
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13.5px] text-slate-400">
            <span className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> {user?.email}
            </span>
            <PulseDot color="emerald" label="All systems operational" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 rounded-full bg-white/6 px-5 py-2.5 text-[13.5px] font-semibold text-white ring-1 ring-white/12 hover:bg-white/12"
          >
            <Search className="h-4 w-4" /> Browse homes
          </Link>
          <Link
            to="/add-property"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-2.5 text-[13.5px] font-semibold text-white ring-1 ring-white/20"
          >
            <PlusCircle className="h-4 w-4" /> Add property
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      {/* 3D orb accent (lazy, low-power, transparent background) */}
      <div className="relative mt-10 -mb-6 h-[14rem] overflow-hidden sm:h-[18rem]">
        <Suspense fallback={null}>
          <DashboardOrb className="absolute inset-0" />
        </Suspense>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#04050a] to-transparent" />
      </div>

        {/* -------------------------------- stats --------------------------------- */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          value={String(myProperties.length)}
          countUpTo={myProperties.length}
          label="Properties listed"
          tone="text-violet-300"
          delay={0}
        />
        <StatCard
          icon={CalendarCheck}
          value={String(myBookings.length)}
          countUpTo={myBookings.length}
          label="Visits you booked"
          tone="text-cyan-300"
          delay={0.06}
        />
        <StatCard
          icon={Inbox}
          value={String(requests.length)}
          countUpTo={requests.length}
          label="Requests received"
          tone="text-amber-300"
          delay={0.12}
        />
        <StatCard
          icon={IndianRupee}
          value={inr(monthlyIncome || savedBrokerage)}
          countUpTo={monthlyIncome || savedBrokerage}
          prefix="₹"
          label={
            myProperties.length
              ? "Potential monthly income"
              : "Brokerage you avoided"
          }
          tone="text-emerald-300"
          delay={0.18}
        />
      </div>

      {myListings.length > 0 && (
        <div className="glass mt-8 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] text-violet-300 uppercase">
                Owner verification
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Continue your listing verification
              </h2>
            </div>
            <Link
              to="/add-property"
              className="hidden rounded-full bg-white/8 px-4 py-2 text-[12px] font-semibold text-white ring-1 ring-white/12 hover:bg-white/12 sm:block"
            >
              New listing
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {myListings.slice(0, 4).map((l) => (
              <Link
                key={l.id}
                to={`/verification/${l.id}`}
                className="group rounded-2xl bg-white/4 p-4 ring-1 ring-white/8 transition-all hover:-translate-y-1 hover:bg-white/7 hover:ring-violet-400/25"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-[14px] font-semibold text-white">{l.title}</p>
                    <p className="mt-1 text-[12px] text-slate-500">{l.location}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ${
                      l.status === "approved"
                        ? "bg-emerald-400/12 text-emerald-300 ring-emerald-400/30"
                        : l.status === "pending_review"
                          ? "bg-amber-400/12 text-amber-300 ring-amber-400/30"
                          : l.status === "rejected"
                            ? "bg-rose-400/12 text-rose-300 ring-rose-400/30"
                            : "bg-violet-400/12 text-violet-300 ring-violet-400/30"
                    }`}
                  >
                    {l.status.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#0891b2,#34e2b0)] transition-all"
                    style={{ width: `${((['step1','step2','step3','step4','step5','step6'].indexOf(l.verification_status) + 1) / 6) * 100}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------- tabs ---------------------------------- */}
      <div className="mt-9 flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors ${
              tab === t.id ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="dash-tab"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-0 rounded-full bg-[linear-gradient(100deg,rgba(124,58,237,0.45),rgba(8,145,178,0.35))] ring-1 ring-white/20"
              />
            )}
            <span className="relative z-10">
              {t.label}
              <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-[10.5px]">
                {t.count}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* ------------------------------- content -------------------------------- */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ------------------------- my properties ------------------------- */}
            {tab === "properties" &&
              (myProperties.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="You haven't listed anything yet"
                  body="List your first property in about 9 minutes. One flat ₹499 fee, never a percentage of your rent."
                  cta={{ to: "/add-property", label: "List your first property" }}
                />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {myProperties.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      className="glass flex gap-4 overflow-hidden rounded-2xl p-4"
                    >
                      <Link
                        to={`/properties/${p.id}`}
                        className="h-24 w-32 shrink-0 overflow-hidden rounded-xl"
                      >
                        <PropertyImage
                          src={p.image}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={`/properties/${p.id}`}>
                          <h3 className="line-clamp-1 text-[14.5px] font-semibold text-white hover:text-violet-200">
                            {p.title}
                          </h3>
                        </Link>
                        <p className="mt-1 line-clamp-1 text-[12px] text-slate-500">
                          {p.location}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-semibold text-white">
                            {inr(p.price)}
                            <span className="text-[11px] font-normal text-slate-500">
                              /mo
                            </span>
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                              p.verified
                                ? "bg-emerald-400/12 text-emerald-300 ring-emerald-400/30"
                                : "bg-amber-400/12 text-amber-300 ring-amber-400/30"
                            }`}
                          >
                            {p.verified ? "VERIFIED" : "IN REVIEW"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => void removeProperty(p.id)}
                        disabled={busyId === p.id}
                        aria-label="Delete listing"
                        className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-lg text-slate-500 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
                      >
                        {busyId === p.id ? (
                          <Spinner className="h-3.5 w-3.5" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              ))}

            {/* -------------------------- my bookings -------------------------- */}
            {tab === "bookings" &&
              (myBookings.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="No visits booked yet"
                  body="Browse video-verified homes and request a visit — it's free and the owner usually replies in about 8 minutes."
                  cta={{ to: "/properties", label: "Browse verified homes" }}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {myBookings.map((b) => (
                    <motion.div
                      key={b.id}
                      layout
                      className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4"
                    >
                      <Link
                        to={`/properties/${b.property_id}`}
                        className="h-16 w-20 shrink-0 overflow-hidden rounded-xl"
                      >
                        <PropertyImage
                          src={b.property?.image ?? null}
                          alt={b.property?.title ?? "Property"}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                      <div className="min-w-[12rem] flex-1">
                        <h3 className="line-clamp-1 text-[14px] font-semibold text-white">
                          {b.property?.title ?? "Property removed"}
                        </h3>
                        <p className="mt-1 flex items-center gap-2 text-[12px] text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          Visit on{" "}
                          {new Date(b.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ring-1 ${statusTone[b.status]}`}
                      >
                        {b.status}
                      </span>
                      <button
                        onClick={() => void setStatus(b.id, "cancelled")}
                        disabled={b.status === "cancelled" || busyId === b.id}
                        className="rounded-lg px-3 py-2 text-[12px] font-medium text-slate-400 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-40"
                      >
                        {busyId === b.id ? <Spinner className="h-3.5 w-3.5" /> : "Cancel"}
                      </button>
                    </motion.div>
                  ))}
                </div>
              ))}

            {/* --------------------------- messages ---------------------------- */}
            {tab === "messages" &&
              (threads.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations yet"
                  body="When a tenant messages you about a listing, the thread appears here. Open it to reply in real time."
                  cta={{ to: "/properties", label: "Browse homes" }}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {threads.map((t) => (
                    <motion.div key={`${t.peerId}-${t.listingId}`} layout>
                      <Link
                        to={t.listingId ? `/properties/${t.listingId}` : "/dashboard"}
                        className="glass flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:ring-violet-400/25"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#06b6d4)] text-[14px] font-bold text-white">
                          {t.peerName.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="truncate text-[14px] font-semibold text-white">
                              {t.peerName}
                            </p>
                            <span className="shrink-0 text-[11px] text-slate-600">
                              {new Date(t.lastAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[11.5px] text-slate-500">
                            {t.listingTitle}
                          </p>
                          <p
                            className={`mt-1 truncate text-[13px] ${
                              t.unread > 0 ? "font-medium text-slate-200" : "text-slate-500"
                            }`}
                          >
                            {t.lastText}
                          </p>
                        </div>
                        {t.unread > 0 && (
                          <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-violet-500/25 px-2 text-[11px] font-bold text-violet-200 ring-1 ring-violet-400/30">
                            {t.unread}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ))}

            {/* ------------------------ visit requests ------------------------- */}
            {tab === "requests" &&
              (requests.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No visit requests yet"
                  body="When a tenant requests a visit on one of your listings, it lands here with their preferred date and message."
                  cta={{ to: "/add-property", label: "Add another property" }}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {requests.map((b) => (
                    <motion.div key={b.id} layout className="glass rounded-2xl p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-[14rem] flex-1">
                          <h3 className="text-[14.5px] font-semibold text-white">
                            {b.property?.title ?? "Your property"}
                          </h3>
                          <p className="mt-1.5 flex items-center gap-2 text-[12.5px] text-slate-400">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            Requested for{" "}
                            {new Date(b.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          {b.message && (
                            <p className="mt-3 rounded-xl bg-white/4 px-4 py-3 text-[13px] leading-relaxed text-slate-300">
                              “{b.message}”
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2.5">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ring-1 ${statusTone[b.status]}`}
                          >
                            {b.status}
                          </span>
                          {b.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => void setStatus(b.id, "confirmed")}
                                disabled={busyId === b.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-[12px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25 hover:bg-emerald-500/25"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => void setStatus(b.id, "cancelled")}
                                disabled={busyId === b.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/6 px-3 py-2 text-[12px] font-semibold text-slate-300 ring-1 ring-white/10 hover:bg-rose-500/15 hover:text-rose-300"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --------------------------- growth nudge ------------------------------ */}
      {myProperties.length > 0 && (
        <div className="glass mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl p-6 sm:flex-row">
          <p className="flex items-center gap-3 text-[13.5px] text-slate-300">
            <TrendingUp className="h-5 w-5 shrink-0 text-emerald-400" />
            Listings with a photo and a full description get{" "}
            <strong className="font-semibold text-white">3.4× more</strong> visit requests.
          </p>
          <Link
            to="/add-property"
            className="shrink-0 rounded-full bg-white/8 px-5 py-2.5 text-[13px] font-semibold text-white ring-1 ring-white/12 hover:bg-white/14"
          >
            Add another property
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
