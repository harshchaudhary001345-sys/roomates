import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  Flame,
  Gift,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  Aurora,
  GhostButton,
  PrimaryButton,
  Reveal,
  Section,
  SectionHeading,
} from "../components/ui";
import { Logo } from "../components/Nav";

/* ============================================================
 *  PRICING
 * ============================================================ */
const plans = [
  {
    name: "Tenant",
    price: "₹0",
    unit: "forever",
    tag: "Free, and we mean it",
    desc: "Everything a renter needs. No trial, no card, no upsell at signing.",
    features: [
      "Unlimited search + video tours",
      "Direct chat & calls with owners",
      "Commute-time and lifestyle filters",
      "AI rent-fairness score on every home",
      "Digital agreement & e-stamping",
      "Deposit escrow protection",
    ],
    cta: "Start searching free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Owner Flat",
    price: "₹499",
    unit: "one-time, per listing",
    tag: "Most popular",
    desc: "List once, stay live until it's rented. Never a percentage of your rent.",
    features: [
      "Everything in Tenant, plus:",
      "Video-verified listing + Verified badge",
      "Unlimited ID-verified tenant leads",
      "Auto-screening questions & filters",
      "Rent benchmarking for your building",
      "Agreement generator + e-stamp",
      "Listing stays live for 90 days",
    ],
    cta: "List your property",
    href: "/add-property",
    highlight: true,
  },
  {
    name: "Owner Pro",
    price: "₹1,499",
    unit: "one-time, per listing",
    tag: "For fast vacancy fills",
    desc: "For landlords who want the flat gone this week, handled end to end.",
    features: [
      "Everything in Owner Flat, plus:",
      "Priority placement in search",
      "Professional video shoot at your flat",
      "Tenant background & employment checks",
      "Dedicated relationship manager",
      "Rent-guarantee add-on available",
    ],
    cta: "Talk to us",
    href: "/add-property",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <Section id="pricing">
      <Aurora />
      <SectionHeading
        eyebrow="Pricing"
        title={
          <>
            Free for tenants.{" "}
            <span className="text-gradient">One flat fee for owners.</span>
          </>
        }
        sub="We charge for the listing, never for the rent. That's the whole reason we can stay honest about price."
      />

      <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.09}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className={`relative flex h-full flex-col overflow-hidden rounded-3xl p-7 ${
                p.highlight
                  ? "glass-strong ring-2 shadow-[0_40px_100px_-40px_rgba(124,58,237,0.9)] ring-violet-500/40"
                  : "glass"
              }`}
            >
              {p.highlight && (
                <>
                  <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-violet-600/30 blur-[80px]" />
                  <span className="absolute top-5 right-5 rounded-full bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-3 py-1 text-[10.5px] font-bold tracking-[0.12em] text-white uppercase">
                    {p.tag}
                  </span>
                </>
              )}
              <div className="relative">
                {!p.highlight && (
                  <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500 uppercase">
                    {p.tag}
                  </p>
                )}
                <h3
                  className={`text-[15px] font-semibold tracking-wide text-white ${p.highlight ? "" : "mt-2"}`}
                >
                  {p.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.045em] text-white">
                    {p.price}
                  </span>
                  <span className="text-[12.5px] text-slate-500">{p.unit}</span>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">{p.desc}</p>

                <div className="my-6 h-px w-full bg-white/8" />

                <ul className="flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[13.5px] text-slate-300">
                      {f.endsWith("plus:") ? (
                        <>
                          <Minus className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-600" />
                          <span className="text-slate-500 italic">{f}</span>
                        </>
                      ) : (
                        <>
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                            strokeWidth={3}
                          />
                          <span>{f}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {p.highlight ? (
                    <PrimaryButton href={p.href} className="w-full">
                      {p.cta} <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                  ) : (
                    <GhostButton href={p.href} className="w-full">
                      {p.cta}
                    </GhostButton>
                  )}
                </div>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="mt-8 text-center text-[13px] text-slate-500">
          No commission. No renewal cut. No “platform fee” at signing.{" "}
          <span className="text-slate-300">
            If your listing doesn't get a verified enquiry in 14 days, we refund it.
          </span>
        </p>
      </Reveal>
    </Section>
  );
}

/* ============================================================
 *  FOMO / URGENCY
 * ============================================================ */
const cities = [
  { name: "Bengaluru", status: "live", spots: "Live · 14,902 homes" },
  { name: "Mumbai", status: "live", spots: "Live · 9,431 homes" },
  { name: "Pune", status: "live", spots: "Live · 6,118 homes" },
  { name: "Hyderabad", status: "live", spots: "Live · 5,240 homes" },
  { name: "Gurgaon", status: "live", spots: "Live · 3,806 homes" },
  { name: "Chennai", status: "live", spots: "Live · 1,711 homes" },
  { name: "Kolkata", status: "soon", spots: "8,204 on waitlist" },
  { name: "Ahmedabad", status: "soon", spots: "5,660 on waitlist" },
  { name: "Jaipur", status: "soon", spots: "3,912 on waitlist" },
  { name: "Kochi", status: "soon", spots: "2,485 on waitlist" },
];

function Countdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 9);
    target.setHours(23, 59, 59, 0);
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex gap-2.5">
      {[
        { v: t.d, l: "days" },
        { v: t.h, l: "hrs" },
        { v: t.m, l: "min" },
        { v: t.s, l: "sec" },
      ].map((u) => (
        <div
          key={u.l}
          className="flex min-w-[62px] flex-col items-center rounded-xl bg-black/45 px-3 py-2.5 ring-1 ring-white/12"
        >
          <span className="font-mono text-2xl leading-none font-semibold text-white tabular-nums">
            {String(u.v).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
            {u.l}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Fomo() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Section id="fomo">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] p-1">
          <div className="absolute inset-0 animate-spin-slow bg-[conic-gradient(from_0deg,#7c3aed,#0891b2,#34e2b0,#7c3aed)] opacity-45" />
          <div className="relative overflow-hidden rounded-[28px] bg-[#06070f] p-7 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full bg-violet-600/25 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px]" />

            <div className="relative grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/12 px-3.5 py-1.5 text-[11.5px] font-bold tracking-[0.14em] text-orange-300 uppercase ring-1 ring-orange-400/30">
                  <Flame className="h-3.5 w-3.5" />
                  Founding member window closing
                </span>
                <h2 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-white sm:text-5xl">
                  We're only opening{" "}
                  <span className="text-gradient">6 cities</span> this year.
                </h2>
                <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-slate-400">
                  Every city we launch gets capped onboarding so verification quality never
                  slips. The first 10,000 users in each city keep{" "}
                  <strong className="font-semibold text-white">
                    Keyless Premium free for 12 months
                  </strong>{" "}
                  — priority listings, background-checked matches, and free agreement
                  e-stamping for life.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <div>
                    <p className="mb-2.5 flex items-center gap-2 text-[11.5px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                      <Clock className="h-3.5 w-3.5" /> Offer ends in
                    </p>
                    <Countdown />
                  </div>
                  <div className="rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10">
                    <p className="font-mono text-2xl font-semibold text-emerald-300 tabular-nums">
                      1,412
                    </p>
                    <p className="text-[11.5px] text-slate-500">
                      Premium spots left in your city
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.includes("@")) setSent(true);
                  }}
                  className="mt-8 flex w-full max-w-lg flex-col gap-2.5 sm:flex-row"
                >
                  <div className="glass flex flex-1 items-center gap-2.5 rounded-full px-4 py-3">
                    <Mail className="h-4 w-4 shrink-0 text-violet-300" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.035 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,#7c3aed,#4f46e5_45%,#0891b2)] px-6 py-3 text-[14px] font-semibold text-white ring-1 ring-white/20 shadow-[0_12px_40px_-10px_rgba(109,40,217,0.8)]"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {sent ? (
                        <motion.span
                          key="ok"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2"
                        >
                          <BadgeCheck className="h-4 w-4" /> You're in
                        </motion.span>
                      ) : (
                        <motion.span
                          key="go"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Gift className="h-4 w-4" /> Claim Premium free
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </form>
                <p className="mt-3 text-[12px] text-slate-500">
                  {sent
                    ? "Welcome aboard. Check your inbox — your Premium code is on its way."
                    : "No spam. One email when your city opens. Unsubscribe in a click."}
                </p>
              </div>

              <div>
                <p className="mb-4 flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] text-slate-500 uppercase">
                  <MapPin className="h-3.5 w-3.5" /> City rollout
                </p>
                <div className="flex flex-col gap-2">
                  {cities.map((c, i) => (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, x: 18 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="flex items-center justify-between rounded-xl bg-white/4 px-4 py-2.5 ring-1 ring-white/6"
                    >
                      <span className="flex items-center gap-2.5 text-[13.5px] font-medium text-white">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            c.status === "live"
                              ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,226,176,0.9)]"
                              : "bg-slate-600"
                          }`}
                        />
                        {c.name}
                      </span>
                      <span
                        className={`text-[11.5px] ${c.status === "live" ? "text-emerald-300/90" : "text-slate-500"}`}
                      >
                        {c.spots}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================================================
 *  FAQ
 * ============================================================ */
const faqs = [
  {
    q: "Is it really zero brokerage, or is there a catch at signing?",
    a: "Genuinely zero. Tenants pay Keyless nothing — no search fee, no visit fee, no “platform charge” at agreement time. Our only revenue is a flat ₹499 or ₹1,499 listing fee paid by owners. Because we never take a percentage of rent, we have no incentive to push prices up.",
  },
  {
    q: "How do you actually verify a listing?",
    a: "Six gates. The owner signs up, passes a government ID check with a liveness face match, uploads an ownership document (sale deed, khata, or a recent utility bill in their name), records a continuous 90-second walkthrough inside our app that is timestamped and geotagged, and then a human reviewer compares all of it. Roughly 23% of submissions get rejected. Gallery uploads and stock photos are structurally impossible.",
  },
  {
    q: "What stops a broker from posing as an owner?",
    a: "The ownership document has to match the ID, and the video has to be recorded in-app at the property's GPS coordinates. Beyond that, tenants can report a suspected broker in one tap; a confirmed report is a permanent ban and a refund of any fee. Two-way reviews also surface patterns quickly — brokers cannot maintain a clean owner history across multiple flats.",
  },
  {
    q: "How does commute-time search work?",
    a: "You drop a pin on your office (or college, or your kid's school). We compute real door-to-desk isochrones using live transit and traffic data for your typical departure time, then only show homes inside the time band you pick. You can stack up to three destinations — useful for couples working in different parts of the city.",
  },
  {
    q: "Is the AI rent estimate trustworthy?",
    a: "It's trained on signed agreement values, not asking prices, within a 2 km radius — adjusted for floor, building age, furnishing, facing and amenities. Both you and the owner see the same number, which is why listings on Keyless settle about 4.6% below the local asking average. It's a guide, not a guarantee.",
  },
  {
    q: "What happens to my security deposit?",
    a: "You can route it through Keyless Escrow. The deposit is held by a licensed partner, released to the owner on move-in confirmation, and tracked against the inventory checklist you both sign. At move-out, deductions have to be itemised with photo evidence, and disputes go to a documented resolution flow instead of a shouting match.",
  },
  {
    q: "I'm an owner. Why would I pay anything when listing elsewhere is free?",
    a: "Because free listing sites sell your phone number to brokers and flood you with unqualified calls. On Keyless, every tenant who contacts you is ID-verified, budget-matched and move-in-date-matched, and your listing carries a verification badge that measurably lifts response rates. Median vacancy fill is 11 days. If you don't get a verified enquiry in 14 days, we refund the fee.",
  },
  {
    q: "Which cities are live right now?",
    a: "Bengaluru, Mumbai, Pune, Hyderabad, Gurgaon and Chennai are fully live. Kolkata, Ahmedabad, Jaipur and Kochi are on the waitlist and open next. We cap onboarding per city deliberately — verification quality is the product, and it doesn't scale by pressing a button.",
  },
];

function FaqItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(i === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.04 }}
      className={`glass overflow-hidden rounded-2xl transition-colors ${open ? "border-violet-400/25" : ""}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
      >
        <span className="text-[15px] font-medium text-white">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${open ? "bg-violet-500/25 text-violet-200" : "bg-white/6 text-slate-400"}`}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-[14px] leading-relaxed text-slate-400">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <Section id="faq">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title={
              <>
                Everything you're about to{" "}
                <span className="text-gradient-violet">ask us.</span>
              </>
            }
            sub="And a few things brokers would rather we didn't answer."
          />
          <Reveal delay={0.15}>
            <div className="glass mt-8 rounded-2xl p-5">
              <p className="text-[13.5px] text-slate-300">
                Still unsure? Talk to a human — no sales script, no pressure.
              </p>
              <GhostButton href="#search" size="sm" className="mt-4">
                Chat with the team <ArrowRight className="h-4 w-4" />
              </GhostButton>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} i={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
 *  FINAL CTA + FOOTER
 * ============================================================ */
const footerCols = [
  {
    title: "Product",
    links: ["Search homes", "Video-verified listings", "Commute search", "Rent estimator", "Flatmate matching", "Keyless Escrow"],
  },
  {
    title: "Owners",
    links: ["List a property", "Pricing", "Tenant screening", "Rent benchmarking", "Agreement generator", "Owner academy"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press kit", "Blog", "City rollout", "Contact"],
  },
  {
    title: "Trust",
    links: ["How verification works", "Report a broker", "Safety centre", "Privacy policy", "Terms of service", "Grievance officer"],
  },
];

export function FinalCTA() {
  return (
    <Section className="pt-8 pb-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(120%_140%_at_50%_0%,rgba(124,58,237,0.28),rgba(6,7,15,0.4)_55%)] px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" />
          <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[110px]" />

          <div className="relative">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold tracking-[0.16em] text-violet-200 uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Your last broker fee is behind you
            </span>
            <h2 className="mx-auto mt-7 max-w-4xl text-[clamp(2.2rem,6vw,4.2rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance text-white">
              Find a home you can trust.
              <br />
              <span className="text-gradient">Keep the ₹85,000.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed text-slate-400">
              Free for tenants, forever. Video-verified homes, ID-checked owners, and a
              direct line to the person holding the keys.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <PrimaryButton href="/signup" className="w-full sm:w-auto">
                Find Your Home <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
              <GhostButton href="/properties" className="w-full sm:w-auto">
                Browse Verified Listings
              </GhostButton>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-slate-500">
              {["0% brokerage", "No card required", "6 cities live", "41,208 verified homes"].map(
                (t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} /> {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/8 px-5 pt-16 pb-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-slate-500">
              Keyless is a zero-brokerage rental platform connecting tenants directly to
              video-verified homes and ID-verified owners across India.
            </p>
            <div className="mt-6 flex gap-2">
              {[Send, Globe, MessageCircle].map((I, i) => (
                <a
                  key={i}
                  href="#top"
                  className="glass grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:text-white"
                >
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-400/8 px-3 py-1.5 text-[11.5px] font-medium text-emerald-300 ring-1 ring-emerald-400/20">
              <Zap className="h-3.5 w-3.5" /> All systems operational
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerCols.map((c) => (
              <div key={c.title}>
                <p className="text-[11.5px] font-bold tracking-[0.16em] text-white uppercase">
                  {c.title}
                </p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#top"
                        className="text-[13px] text-slate-500 transition-colors hover:text-slate-200"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="hairline mt-14 h-px w-full" />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-[12px] text-slate-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Keyless Technologies Pvt. Ltd. Made in India.</p>
          <p className="flex items-center gap-4">
            <span>Bengaluru · Mumbai · Pune · Hyderabad · Gurgaon · Chennai</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
