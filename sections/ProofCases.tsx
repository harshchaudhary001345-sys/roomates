import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Home,
  Quote,
  Star,
  Users,
  X,
} from "lucide-react";
import {
  Aurora,
  PrimaryButton,
  Reveal,
  Section,
  SectionHeading,
  TiltCard,
} from "../components/ui";
import { CountUp } from "../components/app/AnimatedKit";

/* ============================================================
 *  USE CASES
 * ============================================================ */
const personas = [
  {
    id: "tenant",
    icon: Home,
    label: "Tenants",
    tagline: "Find a home in days, not weekends.",
    accent: "from-violet-500/25 to-indigo-600/10",
    text: "text-violet-300",
    headline: "You have 30 days' notice and a full-time job.",
    body: "Filter by commute time, watch the walkthrough video at midnight, message the owner, lock a visit for Saturday morning. Skip 80% of the funnel that used to be phone tag.",
    bullets: [
      "Free forever — tenants never pay Keyless",
      "Video tour before you spend a rupee on travel",
      "Rent-fairness score so you negotiate with data",
      "Digital agreement + e-stamp + deposit escrow",
    ],
    stat: { v: "2.7 days", l: "Median search → keys" },
    cta: "Find Your Home",
    href: "/properties",
  },
  {
    id: "owner",
    icon: Building2,
    label: "Owners",
    tagline: "Direct leads. No commission on your rent.",
    accent: "from-cyan-500/25 to-blue-600/10",
    text: "text-cyan-300",
    headline: "Stop paying a month's rent to fill a flat you own.",
    body: "List in 9 minutes with an in-app video walkthrough. We verify you once, then send genuinely interested, ID-verified tenants straight to your inbox — pre-filtered by budget and move-in date.",
    bullets: [
      "One flat ₹499 listing fee — never a % of rent",
      "Tenant ID + employment verification included",
      "Screening questions auto-filter time-wasters",
      "Rent-benchmarking so you don't underprice",
    ],
    stat: { v: "11 days", l: "Median time to fill a vacancy" },
    cta: "List your property",
    href: "/add-property",
  },
  {
    id: "flatmate",
    icon: Users,
    label: "Flatmates",
    tagline: "Split rent with people you'd actually live with.",
    accent: "from-emerald-500/25 to-teal-600/10",
    text: "text-emerald-300",
    headline: "The room is easy. The people are the hard part.",
    body: "Match on the things that decide whether a shared flat works: sleep schedule, cooking, guests, pets, cleanliness and noise. Then take over a room in a verified home with a verified group.",
    bullets: [
      "Lifestyle compatibility matching, not just budget",
      "Room-level listings inside verified homes",
      "Split deposit and rent inside the app",
      "Group chat before anyone commits",
    ],
    stat: { v: "89%", l: "Flatmate matches still together at 6 months" },
    cta: "Find flatmates",
    href: "/properties",
  },
];

export function UseCases() {
  const [active, setActive] = useState(0);
  const p = personas[active];

  return (
    <Section id="usecases">
      <Aurora />
      <SectionHeading
        eyebrow="Built for all three sides"
        title={
          <>
            One platform.{" "}
            <span className="text-gradient">Three people it makes richer.</span>
          </>
        }
        sub="Marketplaces only work when nobody is being farmed. Here's exactly what each side gets."
      />

      <Reveal delay={0.08}>
        <div className="mt-12 flex justify-center">
          <div className="glass inline-flex gap-1 rounded-2xl p-1.5">
            {personas.map((x, i) => (
              <button
                key={x.id}
                onClick={() => setActive(i)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold transition-colors sm:px-6 ${
                  active === i ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {active === i && (
                  <motion.span
                    layoutId="persona-pill"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-[linear-gradient(100deg,rgba(124,58,237,0.5),rgba(8,145,178,0.4))] ring-1 ring-white/20"
                  />
                )}
                <x.icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{x.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong grid gap-8 overflow-hidden rounded-3xl p-7 sm:p-10 lg:grid-cols-2 lg:gap-14"
          >
            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${p.accent} px-3.5 py-1.5 text-[11.5px] font-bold tracking-[0.14em] uppercase ring-1 ring-white/12 ${p.text}`}
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.tagline}
              </span>
              <h3 className="mt-6 text-3xl leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-white sm:text-4xl">
                {p.headline}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-400">{p.body}</p>
              <PrimaryButton href={p.href} className="mt-8">
                {p.cta} <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>

            <div className="flex flex-col gap-3">
              {p.bullets.map((b, i) => (
                <motion.div
                  key={b}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                  className="flex items-center gap-3.5 rounded-2xl bg-white/4 px-4 py-3.5 ring-1 ring-white/6"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-400/12 text-emerald-300">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span className="text-[14px] text-slate-200">{b}</span>
                </motion.div>
              ))}
              <div className="mt-2 rounded-2xl bg-[linear-gradient(120deg,rgba(124,58,237,0.18),rgba(6,182,212,0.12))] p-5 ring-1 ring-white/10">
                <p className="text-3xl font-semibold tracking-[-0.03em] text-white">
                  {p.stat.v}
                </p>
                <p className="mt-1 text-[12.5px] text-slate-400">{p.stat.l}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  );
}

/* ============================================================
 *  BEFORE vs AFTER
 * ============================================================ */
const rows = [
  { k: "Brokerage", before: "₹35,000 – ₹1,20,000", after: "₹0. Always." },
  { k: "Who you talk to", before: "A middleman on commission", after: "The owner, directly" },
  { k: "Listing photos", before: "Recycled, staged, or fake", after: "90s video, timestamped" },
  { k: "Wasted site visits", before: "8 – 14 before a match", after: "1.8 on average" },
  { k: "Hidden charges", before: "Visit fee, token, docs, GST", after: "None. Ever." },
  { k: "Rent transparency", before: "Whatever they can extract", after: "AI fairness score, both sides" },
  { k: "Agreement + stamping", before: "Notary queues, runners", after: "E-signed in 20 minutes" },
  { k: "Deposit safety", before: "Cash. Good luck.", after: "Escrow-held, tracked" },
  { k: "Time to move in", before: "3 – 6 weeks", after: "2.7 days median" },
];

export function BeforeAfter() {
  const [mode, setMode] = useState<"before" | "after">("after");
  return (
    <Section id="compare">
      <SectionHeading
        eyebrow="Before vs after"
        title={
          <>
            The same flat. The same city.{" "}
            <span className="text-gradient-violet">A completely different month.</span>
          </>
        }
      />

      {/* mobile toggle */}
      <Reveal className="mt-10 flex justify-center lg:hidden">
        <div className="glass inline-flex gap-1 rounded-full p-1.5">
          {(["before", "after"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`relative rounded-full px-6 py-2 text-[13px] font-semibold capitalize transition-colors ${
                mode === m ? "text-white" : "text-slate-400"
              }`}
            >
              {mode === m && (
                <motion.span
                  layoutId="ba-pill"
                  className={`absolute inset-0 rounded-full ${m === "before" ? "bg-rose-500/25 ring-1 ring-rose-400/30" : "bg-emerald-500/25 ring-1 ring-emerald-400/30"}`}
                />
              )}
              <span className="relative z-10">{m === "before" ? "Without Keyless" : "With Keyless"}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="glass mt-8 overflow-hidden rounded-3xl">
          {/* header */}
          <div className="hidden grid-cols-[1.1fr_1fr_1fr] border-b border-white/8 lg:grid">
            <div className="px-6 py-5 text-[11.5px] font-bold tracking-[0.18em] text-slate-500 uppercase">
              What changes
            </div>
            <div className="flex items-center gap-2 border-l border-white/8 bg-rose-950/15 px-6 py-5">
              <X className="h-4 w-4 text-rose-400" />
              <span className="text-[13px] font-semibold text-rose-300">Without Keyless</span>
            </div>
            <div className="flex items-center gap-2 border-l border-white/8 bg-emerald-950/15 px-6 py-5">
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-[13px] font-semibold text-emerald-300">With Keyless</span>
            </div>
          </div>

          {rows.map((r, i) => (
            <motion.div
              key={r.k}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="grid grid-cols-1 border-b border-white/6 last:border-0 lg:grid-cols-[1.1fr_1fr_1fr]"
            >
              <div className="px-6 pt-4 pb-1 text-[13.5px] font-semibold text-white lg:py-5 lg:font-medium lg:text-slate-300">
                {r.k}
              </div>
              <div
                className={`items-center gap-2.5 border-white/6 bg-rose-950/8 px-6 py-3 lg:flex lg:border-l lg:py-5 ${mode === "before" ? "flex" : "hidden"}`}
              >
                <X className="h-3.5 w-3.5 shrink-0 text-rose-400/70" />
                <span className="text-[13.5px] text-slate-400 line-through decoration-rose-500/40">
                  {r.before}
                </span>
              </div>
              <div
                className={`items-center gap-2.5 border-white/6 bg-emerald-950/8 px-6 py-3 lg:flex lg:border-l lg:py-5 ${mode === "after" ? "flex" : "hidden"}`}
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={3} />
                <span className="text-[13.5px] font-medium text-white">{r.after}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================================================
 *  SOCIAL PROOF
 * ============================================================ */
const stats = [
  { to: 41208, suffix: "+", label: "Video-verified homes live", tone: "text-violet-300" },
  { to: 2.4, suffix: "M", label: "Tenants searching monthly", tone: "text-cyan-300", dec: 1 },
  { to: 214, prefix: "₹", suffix: " Cr", label: "Brokerage never paid", tone: "text-emerald-300" },
  { to: 4.9, suffix: "/5", label: "Average owner rating", tone: "text-amber-300", dec: 1 },
];

const testimonials = [
  {
    quote:
      "I moved from Delhi to Bengaluru in nine days. Watched fourteen walkthrough videos on the flight, shortlisted three, visited two, signed one. The broker quote I'd been given was ₹68,000. I paid nothing.",
    name: "Aditi Sharma",
    role: "Product Designer · moved to Indiranagar",
    rating: 5,
    saved: "₹68,000 saved",
  },
  {
    quote:
      "As an owner I was terrified of listing without an agent. Keyless verified me in a day, and I got eleven serious enquiries in a week — all ID-verified, all with matching budgets. Filled in eight days for ₹499.",
    name: "Rajesh Menon",
    role: "Owner · 3 properties, Chennai",
    rating: 5,
    saved: "₹52,000 saved",
  },
  {
    quote:
      "The video tour thing is the whole product. I've been scammed before by photos that were of a completely different building. Here what I watched is literally what I walked into.",
    name: "Nikhil Bansal",
    role: "SDE-2 · moved to Powai",
    rating: 5,
    saved: "₹72,500 saved",
  },
  {
    quote:
      "Commute search changed how I think about renting. I found a flat 14 minutes from work that I'd never have searched for because I didn't know the locality existed.",
    name: "Sneha Iyer",
    role: "Consultant · moved to Baner",
    rating: 5,
    saved: "₹31,000 saved",
  },
  {
    quote:
      "Two-way reviews are underrated. I could see the owner returned deposits in full to four previous tenants. That single data point closed the deal for me.",
    name: "Farhan Qureshi",
    role: "Researcher · moved to Gachibowli",
    rating: 5,
    saved: "₹24,500 saved",
  },
  {
    quote:
      "Found flatmates who actually match my schedule instead of just my budget. Six months in and we still like each other, which frankly is a first.",
    name: "Divya Nair",
    role: "Analyst · shared 3BHK, Gurgaon",
    rating: 5,
    saved: "₹46,000 saved",
  },
];

function TestimonialCard({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="glass flex w-[340px] shrink-0 flex-col rounded-3xl p-6 sm:w-[400px]">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="rounded-full bg-emerald-400/12 px-2.5 py-1 text-[10.5px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
          {t.saved}
        </span>
      </div>
      <Quote className="mt-4 h-5 w-5 text-violet-400/50" />
      <blockquote className="mt-2 flex-1 text-[14px] leading-relaxed text-slate-300">
        {t.quote}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#06b6d4)] text-[13px] font-bold text-white">
          {t.name.charAt(0)}
        </span>
        <span>
          <span className="block text-[13.5px] font-semibold text-white">{t.name}</span>
          <span className="block text-[11.5px] text-slate-500">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function SocialProof() {
  return (
    <Section id="proof" className="overflow-hidden">
      <div className="pointer-events-none absolute top-10 left-1/2 h-[26rem] w-[52rem] -translate-x-1/2 rounded-full bg-indigo-700/12 blur-[140px]" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <TiltCard className="p-6 text-center" intensity={7}>
                <p
                  className={`font-mono text-[2.6rem] leading-none font-semibold tracking-[-0.04em] tabular-nums ${s.tone}`}
                >
                  <CountUp
                    to={s.to}
                    prefix={s.prefix}
                    suffix={s.suffix}
                  />
                </p>
              <p className="mt-3 text-[12.5px] leading-snug text-slate-400">{s.label}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <div className="mt-20">
        <SectionHeading
          eyebrow="Social proof"
          title={
            <>
              People who will never pay a{" "}
              <span className="text-gradient">broker again.</span>
            </>
          }
        />
      </div>

      <div className="mask-fade-x mt-12 flex flex-col gap-5">
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 gap-5 pr-5">
            {[...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={`a${i}`} t={t} />
            ))}
          </div>
        </div>
        <div className="flex overflow-hidden">
          <div className="animate-marquee-rev flex shrink-0 gap-5 pr-5">
            {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map(
              (t, i) => (
                <TestimonialCard key={`b${i}`} t={t} />
              ),
            )}
          </div>
        </div>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-70">
          {[
            "Featured in YourStory",
            "Backed by Antler",
            "ISO 27001 data handling",
            "RERA-aligned agreements",
            "DPDP Act compliant",
          ].map((b) => (
            <span
              key={b}
              className="flex items-center gap-2 text-[12px] font-medium tracking-wide text-slate-500"
            >
              <BadgeCheck className="h-3.5 w-3.5 text-violet-400/60" />
              {b}
            </span>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
