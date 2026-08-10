import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState, useEffect, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CircleDollarSign,
  Eye,
  FileCheck2,
  Fingerprint,
  Ghost,
  MessageSquareText,
  PhoneOff,
  ScanFace,
  Star,
  Video,
} from "lucide-react";
import { lazy, Suspense } from "react";
import {
  Aurora,
  Reveal,
  Section,
  SectionHeading,
  Stagger,
  StaggerItem,
} from "../components/ui";
import FeatureCard from "../components/app/FeatureCard";
import FeatureModal from "../components/app/FeatureModal";

/** Renders children into a portal-like container (for modal overlay). */
function Portal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

const VerifiedBadge3D = lazy(() => import("../three/VerifiedBadge"));

/* =================== SOCIAL BAR =================== */
const marqueeItems = [
  "0% brokerage — always",
  "Video-verified listings",
  "ID-checked owners",
  "Direct owner chat",
  "No hidden charges",
  "Two-way reviews",
  "Rent-fairness AI",
  "Commute-time search",
];

export function TrustMarquee() {
  return (
    <div className="relative z-20 border-y border-white/8 bg-black/40 py-4 backdrop-blur-xl">
      <div className="mask-fade-x flex overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
          {[...marqueeItems, ...marqueeItems].map((t, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-2.5 text-[13px] font-medium tracking-wide whitespace-nowrap text-slate-400"
            >
              <BadgeCheck className="h-4 w-4 text-violet-400/80" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =================== PROBLEM → SOLUTION =================== */
const pains = [
  {
    icon: CircleDollarSign,
    title: "₹85,000 gone before you unpack",
    body: "One to two months' rent as “brokerage” — for a phone call and someone unlocking a door you found yourself.",
  },
  {
    icon: Ghost,
    title: "Listings that don't exist",
    body: "Stock photos, 5-year-old interiors, or a completely different flat. You discover it after a 22 km auto ride.",
  },
  {
    icon: PhoneOff,
    title: "The owner is behind a wall",
    body: "Every question routes through a middleman who is optimising for their commission, not your move-in date.",
  },
  {
    icon: CalendarClock,
    title: "34 calls. 11 visits. 3 weeks.",
    body: "By the time you find something honest, your notice period is over and you're negotiating from panic.",
  },
];

const cures = [
  {
    icon: CircleDollarSign,
    title: "₹0 brokerage. Full stop.",
    body: "Tenants never pay us a rupee. Owners pay one small flat listing fee. Nobody earns a % of your rent.",
  },
  {
    icon: Video,
    title: "Video-verified before it's live",
    body: "A 90-second in-app walkthrough, timestamped and geotagged. If the video doesn't match, the listing doesn't publish.",
  },
  {
    icon: MessageSquareText,
    title: "Owner's chat opens in one tap",
    body: "Message, call or schedule a visit with the actual owner. Median first reply: 8 minutes.",
  },
  {
    icon: CalendarClock,
    title: "Shortlist today, keys in 2.7 days",
    body: "Digital agreement, e-stamping and deposit escrow in the same flow. No runners, no notary queues.",
  },
];

export function ProblemSolution() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const leftX = useTransform(scrollYProgress, [0, 0.5], [-40, 0]);
  const rightX = useTransform(scrollYProgress, [0, 0.5], [40, 0]);

  return (
    <Section id="problem">
      <Aurora />
      <SectionHeading
        eyebrow="The rental tax nobody agreed to"
        title={
          <>
            Renting is broken.{" "}
            <span className="text-gradient-violet">You're the one paying for it.</span>
          </>
        }
        sub="Indian tenants spend an estimated ₹18,000 crore a year on brokerage — for a service that mostly consists of forwarding a phone number. We deleted that entire step."
      />

      <div ref={ref} className="relative mt-16 grid gap-6 lg:mt-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
        {/* PAIN */}
        <motion.div style={{ x: leftX }}>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500/12 text-rose-400 ring-1 ring-rose-500/25">
              <AlertTriangle className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-rose-400/90 uppercase">
                Today
              </p>
              <p className="text-sm font-medium text-slate-300">The broker-run market</p>
            </div>
          </div>
          <Stagger className="flex flex-col gap-3">
            {pains.map((p) => (
              <StaggerItem key={p.title}>
                <div className="group relative overflow-hidden rounded-2xl border border-rose-500/12 bg-rose-950/12 p-5 transition-colors hover:border-rose-500/25">
                  <div className="flex gap-4">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rose-500/10 text-rose-400">
                      <p.icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <h3 className="text-[15.5px] font-semibold text-slate-100">
                        {p.title}
                      </h3>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-400">
                        {p.body}
                      </p>
                    </div>
                  </div>
                  <span className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-rose-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </motion.div>

        {/* CONNECTOR */}
        <div className="relative hidden w-16 items-center justify-center lg:flex">
          <div className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
            className="glass-strong glow-violet relative grid h-14 w-14 place-items-center rounded-2xl"
          >
            <ArrowRight className="h-5 w-5 text-white" />
          </motion.div>
        </div>

        {/* CURE */}
        <motion.div style={{ x: rightX }}>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/25">
              <BadgeCheck className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-400/90 uppercase">
                With Keyless
              </p>
              <p className="text-sm font-medium text-slate-300">The direct market</p>
            </div>
          </div>
          <Stagger delay={0.1} className="flex flex-col gap-3">
            {cures.map((p) => (
              <StaggerItem key={p.title}>
                <div className="group relative overflow-hidden rounded-2xl border border-emerald-400/14 bg-[linear-gradient(135deg,rgba(52,226,176,0.07),rgba(99,102,241,0.05))] p-5 transition-all hover:border-emerald-400/30 hover:shadow-[0_20px_60px_-30px_rgba(52,226,176,0.7)]">
                  <div className="flex gap-4">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-400/12 text-emerald-300">
                      <p.icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <h3 className="text-[15.5px] font-semibold text-white">{p.title}</h3>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-400">
                        {p.body}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </motion.div>
      </div>
    </Section>
  );
}

/* =================== TRUST & VERIFICATION =================== */
const pipeline = [
  { label: "Owner signs up", icon: Fingerprint },
  { label: "Govt ID + face match", icon: ScanFace },
  { label: "Ownership doc check", icon: FileCheck2 },
  { label: "90s video walkthrough", icon: Video },
  { label: "Human review", icon: Eye },
  { label: "Badge issued", icon: BadgeCheck },
];

const trustCards = [
  {
    icon: Video,
    tone: "from-cyan-500/18 to-blue-600/8",
    ring: "ring-cyan-400/25",
    text: "text-cyan-300",
    title: "Video-Verified Listings",
    body: "Owners record a continuous 90-second walkthrough inside our app — timestamped, geotagged, no gallery uploads. Stock photography is structurally impossible.",
    stat: "100% of live listings",
    to: "/properties",
    statIcon: Video,
  },
  {
    icon: ScanFace,
    tone: "from-violet-500/18 to-fuchsia-600/8",
    ring: "ring-violet-400/25",
    text: "text-violet-300",
    title: "ID-Verified Owners",
    body: "Government ID + liveness face match, cross-checked against an ownership document (sale deed, khata, or latest utility bill) before anything publishes.",
    stat: "3-point identity check",
    to: "/signup",
    statIcon: Fingerprint,
  },
  {
    icon: BadgeCheck,
    tone: "from-emerald-500/18 to-teal-600/8",
    ring: "ring-emerald-400/25",
    text: "text-emerald-300",
    title: "The Verified Badge System",
    body: "Bronze, Silver and Gold tiers earned through response speed, listing accuracy and completed move-ins. Badges decay if a listing goes stale past 14 days.",
    stat: "Badge decays, so data stays fresh",
    to: "/properties",
    statIcon: BadgeCheck,
  },
  {
    icon: Star,
    tone: "from-amber-500/18 to-orange-600/8",
    ring: "ring-amber-400/25",
    text: "text-amber-300",
    title: "Two-Way Reviews",
    body: "Tenants rate owners on honesty, repairs and deposit returns. Owners rate tenants. Both reviews unlock simultaneously after move-in — no retaliation, no bias.",
    stat: "Double-blind, post move-in",
    to: "/properties",
    statIcon: Star,
  },
];

export function Trust() {
  const [activeCard, setActiveCard] = useState<typeof trustCards[number] | null>(null);

  useEffect(() => {
    const onCardClick = (e: Event) => {
      const custom = e as CustomEvent<typeof trustCards[number]>;
      setActiveCard(custom.detail);
    };
    window.addEventListener("open-feature-modal", onCardClick);
    return () => window.removeEventListener("open-feature-modal", onCardClick);
  }, []);

  return (
    <Section id="trust" className="overflow-hidden">
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-violet-700/12 blur-[150px]" />

      <SectionHeading
        eyebrow="The trust layer"
        title={
          <>
            We verify the home, the owner,
            <br className="hidden sm:block" /> and the{" "}
            <span className="text-gradient">deal itself.</span>
          </>
        }
        sub="Trust isn't a badge you print on a card. It's a pipeline. Here's every gate a listing must pass before you ever see it."
      />

      {/* Verification pipeline */}
      <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <Reveal delay={0.1}>
          <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold tracking-wide text-white">
              Listing verification pipeline
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-[11.5px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Avg. approval 4h 12m · 23% rejected
            </span>
          </div>

          <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="absolute top-6 right-6 left-6 hidden h-px bg-gradient-to-r from-violet-500/40 via-cyan-400/50 to-emerald-400/40 lg:block" />
            {pipeline.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative flex flex-col items-center gap-3 text-center"
              >
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-[#0a0d1a] text-white ring-1 ring-white/12">
                  <s.icon className="h-5 w-5 text-violet-300" />
                  <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#06b6d4)] text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <span className="text-[12.5px] leading-tight font-medium text-slate-300">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>

        {/* 3D verified badge column (right side on desktop) */}
        <Reveal delay={0.2} className="hidden h-56 w-56 shrink-0 lg:block">
          <Suspense fallback={null}>
            <VerifiedBadge3D className="h-full w-full" />
          </Suspense>
        </Reveal>
      </div>

       <div className="mt-6 grid gap-5 md:grid-cols-2">
         {trustCards.map((c, i) => (
           <Reveal key={c.title} delay={i * 0.08}>
             <FeatureCard
               icon={c.icon}
               title={c.title}
               body={c.body}
               stat={c.stat}
               tone={c.tone}
               ring={c.ring}
               text={c.text}
               to={c.to}
               statIcon={c.statIcon}
               delay={i * 0.08}
               index={i}
             />
           </Reveal>
         ))}
       </div>

       {/* Feature detail modal — triggered by card click */}
       <Portal>
         <FeatureModal
           isOpen={!!activeCard}
           onClose={() => setActiveCard(null)}
           title={activeCard?.title ?? ""}
           body={activeCard?.body ?? ""}
           stat={activeCard?.stat ?? ""}
           icon={activeCard?.icon ?? Video}
           to={activeCard?.to ?? "/properties"}
           tone={activeCard?.tone ?? "from-violet-500/18 to-fuchsia-600/8"}
           text={activeCard?.text ?? "text-violet-300"}
         />
       </Portal>
    </Section>
  );
}
