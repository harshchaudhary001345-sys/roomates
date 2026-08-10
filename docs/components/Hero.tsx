import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  IndianRupee,
  MapPin,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { PrimaryButton, GhostButton } from "./ui";
import SceneBoundary from "../three/SceneBoundary";

const HeroScene = lazy(() => import("../three/HeroScene"));

const trustPills = [
  { icon: IndianRupee, label: "0% Brokerage", tone: "text-emerald-300" },
  { icon: PlayCircle, label: "Video-Verified Homes", tone: "text-cyan-300" },
  { icon: Users, label: "Real Owners Only", tone: "text-violet-300" },
];

const rotatingCities = ["Bengaluru", "Mumbai", "Pune", "Hyderabad", "Gurgaon", "Chennai"];

function CityRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % rotatingCities.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-grid h-[1.15em] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          initial={{ y: "115%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-115%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-gradient-violet col-start-1 row-start-1 font-semibold"
        >
          {rotatingCities[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function SearchWidget() {
  const [tab, setTab] = useState<"rent" | "commute" | "flatmate">("rent");
  const tabs = [
    { id: "rent" as const, label: "Rent a home", icon: MapPin },
    { id: "commute" as const, label: "By commute time", icon: Timer },
    { id: "flatmate" as const, label: "Find flatmates", icon: Users },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong w-full max-w-2xl rounded-[22px] p-2 shadow-[0_35px_90px_-40px_rgba(88,28,235,0.9)]"
    >
      <div className="flex gap-1 px-1 pt-1 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              tab === t.id ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="hero-tab"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-0 rounded-full bg-white/12 ring-1 ring-white/15"
              />
            )}
            <t.icon className="relative z-10 h-3.5 w-3.5" />
            <span className="relative z-10 whitespace-nowrap">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-[16px] bg-black/35 p-2 ring-1 ring-white/8 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2.5 px-3 py-2.5">
          <Search className="h-4.5 w-4.5 shrink-0 text-violet-300" />
          <input
            aria-label="Search location"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            placeholder={
              tab === "commute"
                ? "Work address — e.g. Embassy Tech Village"
                : tab === "flatmate"
                  ? "Area + budget — e.g. Koramangala, ₹18k"
                  : "Locality, landmark or metro station"
            }
          />
        </div>
        <div className="hidden h-8 w-px bg-white/10 sm:block" />
        <div className="flex items-center gap-2.5 px-3 py-2.5 sm:w-48">
          {tab === "commute" ? (
            <Timer className="h-4.5 w-4.5 shrink-0 text-cyan-300" />
          ) : (
            <IndianRupee className="h-4.5 w-4.5 shrink-0 text-cyan-300" />
          )}
          <input
            aria-label={tab === "commute" ? "Maximum commute time" : "Maximum budget"}
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            placeholder={tab === "commute" ? "Under 30 min" : "Max budget"}
          />
        </div>
        <PrimaryButton href="/properties" size="sm" className="sm:px-6 sm:py-3">
          Search <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 pt-3 pb-1.5 text-[11.5px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-medium text-emerald-300">1,284 owners online now</span>
        </span>
        <span className="hidden sm:inline">Popular:</span>
        {["Koramangala", "Powai", "Baner", "HSR Layout"].map((c) => (
          <button
            key={c}
            className="rounded-full bg-white/5 px-2.5 py-1 transition-colors hover:bg-white/12 hover:text-white"
          >
            {c}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function FloatingStat({
  className,
  icon: Icon,
  value,
  label,
  tone,
  delay,
}: {
  className: string;
  icon: typeof BadgeCheck;
  value: string;
  label: string;
  tone: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-strong pointer-events-none absolute hidden items-center gap-3 rounded-2xl px-4 py-3 2xl:flex ${className}`}
    >
      <span className={`grid h-9 w-9 place-items-center rounded-xl bg-white/8 ${tone}`}>
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold text-white">{value}</span>
        <span className="text-[11px] tracking-wide text-slate-400">{label}</span>
      </span>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.16]);

  return (
    <div
      id="top"
      ref={ref}
      className="relative min-h-[104svh] w-full overflow-hidden pt-28 pb-16 sm:pt-32"
    >
      {/* 3D layer */}
      <motion.div
        style={{ y: sceneY, scale: sceneScale }}
        className="absolute inset-0 z-0"
      >
        <SceneBoundary>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </SceneBoundary>
      </motion.div>

      {/* depth vignettes + readability scrims */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_80%_at_50%_-10%,transparent_20%,rgba(4,5,10,0.5)_65%,#04050a_100%)]" />
      <div className="pointer-events-none absolute top-[14%] left-1/2 z-10 h-[46vh] w-[min(1000px,94vw)] -translate-x-1/2 rounded-[50%] bg-[#04050a]/72 blur-[70px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[#04050a] via-[#04050a]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-[#04050a] via-[#04050a]/85 to-transparent" />
      <div className="grid-bg animate-grid-drift pointer-events-none absolute inset-0 z-0 opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]" />

      {/* content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center px-5 text-center sm:px-8"
      >
        <motion.a
          href="#fomo"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="glass group mb-7 inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-[12.5px] text-slate-200 transition-colors hover:border-white/25"
        >
          <span className="rounded-full bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-2.5 py-1 text-[10.5px] font-bold tracking-[0.12em] text-white uppercase">
            Live
          </span>
          <span className="font-medium">
            <span className="hidden sm:inline">Now onboarding owners in 6 cities · </span>
            Early users get Premium free
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </motion.a>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl text-[clamp(2.6rem,7.6vw,5.6rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-balance text-white"
        >
          Rent direct.
          <br />
          <span className="text-gradient">Save ₹85,000.</span>
          <br />
          <span className="text-white/95">Move in 3× faster.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-2xl text-[16.5px] leading-relaxed text-slate-300/90 text-pretty sm:text-lg"
        >
          Every home is <strong className="font-semibold text-white">video-verified</strong>.
          Every owner is <strong className="font-semibold text-white">ID-checked</strong>. You
          talk straight to the person holding the keys — never a middleman with a
          commission. Now live in <CityRotator />.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <PrimaryButton href="/signup" className="w-full sm:w-auto">
            Find Your Home <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
          <GhostButton href="/properties" className="w-full sm:w-auto">
            <PlayCircle className="h-4.5 w-4.5 text-cyan-300" />
            Browse Verified Listings
          </GhostButton>
        </motion.div>

        {/* trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.85 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
        >
          {trustPills.map((p, i) => (
            <div key={p.label} className="flex items-center gap-3">
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-slate-200">
                <p.icon className={`h-4 w-4 ${p.tone}`} />
                {p.label}
              </span>
              {i < trustPills.length - 1 && (
                <span className="hidden h-3 w-px bg-white/15 sm:block" />
              )}
            </div>
          ))}
        </motion.div>

        <div id="search" className="mt-12 flex w-full scroll-mt-28 justify-center">
          <SearchWidget />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-6 flex items-center gap-2 text-[12.5px] text-slate-500"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400/80" />
          Free forever for tenants · No card required · Cancel anytime
        </motion.p>
      </motion.div>

      {/* floating HUD stats */}
      <FloatingStat
        className="animate-float-mid top-[46%] left-[1.5%]"
        icon={BadgeCheck}
        value="41,208 homes"
        label="Video-verified & live"
        tone="text-emerald-300"
        delay={1.05}
      />
      <FloatingStat
        className="animate-float-slow top-[42%] right-[1.5%]"
        icon={IndianRupee}
        value="₹214 Cr saved"
        label="Brokerage never paid"
        tone="text-cyan-300"
        delay={1.2}
      />
      <FloatingStat
        className="animate-float-slow bottom-[12%] right-[4%]"
        icon={Sparkles}
        value="2.7 days"
        label="Median time to move-in"
        tone="text-violet-300"
        delay={1.35}
      />
    </div>
  );
}
