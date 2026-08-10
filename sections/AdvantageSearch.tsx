import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { listings as listingsApi } from "../lib/api";
import type { Listing as DbListing } from "../lib/types";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Brain,
  Bus,
  Check,
  Droplets,
  Handshake,
  Heart,
  MapPin,
  PlayCircle,
  Receipt,
  Ruler,
  ShieldCheck,
  Timer,
  TrendingDown,
  Volume2,
  Zap,
} from "lucide-react";
import {
  Aurora,
  GhostButton,
  PrimaryButton,
  Reveal,
  Section,
  SectionHeading,
  TiltCard,
} from "../components/ui";

const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ============================================================
 *  ZERO BROKERAGE + SAVINGS CALCULATOR
 * ============================================================ */
const advantages = [
  {
    icon: Handshake,
    title: "Direct contact with owners",
    body: "Chat, call and schedule visits with the person who actually owns the flat. No gatekeeper, no telephone game, no inflated story.",
  },
  {
    icon: Receipt,
    title: "No hidden charges. Anywhere.",
    body: "No “visit charge”, no “token amount”, no “documentation fee”, no commission on renewal. The rent you see is the rent you pay.",
  },
  {
    icon: TrendingDown,
    title: "One flat listing fee for owners",
    body: "Owners pay ₹499 once per listing — not a month's rent. That's why we have zero incentive to inflate your rent.",
  },
];

function SavingsCalculator() {
  const [rent, setRent] = useState(35000);
  const [months, setMonths] = useState(1);

  const brokerage = useMemo(() => rent * months * 1.18, [rent, months]);
  const overFive = brokerage * 2.2; // typical 2-3 moves in 5 years

  return (
    <div className="glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/18 blur-[90px]" />
      <div className="relative">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/25">
            <TrendingDown className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-white">
              What a broker would have taken
            </p>
            <p className="text-[12px] text-slate-400">Drag to match your rent</p>
          </div>
        </div>

        <div className="mt-7 space-y-6">
          <div>
            <div className="mb-2.5 flex items-baseline justify-between">
              <label className="text-[12.5px] font-medium tracking-wide text-slate-400">
                Monthly rent
              </label>
              <span className="font-mono text-lg font-semibold text-white tabular-nums">
                {inr(rent)}
              </span>
            </div>
            <input
              type="range"
              aria-label="Monthly rent"
              min={8000}
              max={150000}
              step={1000}
              value={rent}
              onChange={(e) => setRent(+e.target.value)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(139,92,246,0.45)]"
              style={{
                background: `linear-gradient(90deg,#7c3aed ${((rent - 8000) / 142000) * 100}%, rgba(255,255,255,0.1) ${((rent - 8000) / 142000) * 100}%)`,
              }}
            />
          </div>

          <div>
            <p className="mb-2.5 text-[12.5px] font-medium tracking-wide text-slate-400">
              Typical brokerage in your city
            </p>
            <div className="flex gap-2">
              {[
                { v: 0.5, l: "15 days" },
                { v: 1, l: "1 month" },
                { v: 2, l: "2 months" },
              ].map((o) => (
                <button
                  key={o.l}
                  onClick={() => setMonths(o.v)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-[12.5px] font-semibold transition-all ${
                    months === o.v
                      ? "bg-white/14 text-white ring-1 ring-white/25"
                      : "bg-white/4 text-slate-400 hover:bg-white/8 hover:text-slate-200"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-5">
            <p className="text-[11px] font-bold tracking-[0.16em] text-rose-400/90 uppercase">
              Broker route
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold text-rose-300 tabular-nums">
              {inr(brokerage)}
            </p>
            <p className="mt-1.5 text-[12px] text-slate-500">incl. 18% GST · non-refundable</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-[linear-gradient(140deg,rgba(52,226,176,0.14),rgba(99,102,241,0.08))] p-5">
            <p className="text-[11px] font-bold tracking-[0.16em] text-emerald-300 uppercase">
              Keyless route
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold text-white tabular-nums">₹0</p>
            <p className="mt-1.5 text-[12px] text-emerald-200/70">
              You keep every rupee. Forever.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl bg-white/4 p-4 sm:flex-row sm:items-center">
          <p className="text-[13.5px] text-slate-300">
            Over 5 years of renting, that's roughly{" "}
            <strong className="font-semibold text-white">{inr(overFive)}</strong> back in your
            pocket.
          </p>
          <PrimaryButton href="/signup" size="sm" className="shrink-0">
            Start saving <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function ZeroBrokerage() {
  return (
    <Section id="zero">
      <Aurora />
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="The zero-brokerage advantage"
            title={
              <>
                The <span className="text-gradient-violet">0%</span> that changes
                everything.
              </>
            }
            sub="Brokerage isn't a service fee — it's a toll for access. When you remove the toll booth, owners list honestly, tenants move faster, and rent stops being negotiated by someone earning a percentage of it."
          />

          <div className="mt-10 flex flex-col gap-2">
            {advantages.map((a, i) => (
              <Reveal key={a.title} delay={0.06 * i}>
                <div className="group flex gap-4 rounded-2xl p-4 transition-colors hover:bg-white/4">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,rgba(124,58,237,0.25),rgba(6,182,212,0.18))] text-violet-200 ring-1 ring-white/10">
                    <a.icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold text-white">{a.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-slate-400">
                      {a.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.15}>
          <SavingsCalculator />
        </Reveal>
      </div>
    </Section>
  );
}

/* ============================================================
 *  SMART SEARCH
 * ============================================================ */
const insights = [
  { icon: Droplets, label: "Water", value: "Cauvery + borewell · 24×7", tone: "text-cyan-300" },
  { icon: Zap, label: "Power", value: "0 cuts last 30 days", tone: "text-amber-300" },
  { icon: ShieldCheck, label: "Safety", value: "Score 8.7 · well-lit street", tone: "text-emerald-300" },
  { icon: Bus, label: "Transport", value: "Metro 600 m · bus 200 m", tone: "text-violet-300" },
  { icon: Volume2, label: "Noise", value: "Quiet after 9 PM", tone: "text-blue-300" },
  { icon: MapPin, label: "Daily needs", value: "Groceries, clinic < 5 min", tone: "text-fuchsia-300" },
];

function CommuteVisual() {
  return (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-[#060814] ring-1 ring-white/8">
      <div className="grid-bg absolute inset-0 opacity-70" />
      {/* isochrone rings */}
      {[
        { s: 34, c: "rgba(52,226,176,0.55)", t: "15 min" },
        { s: 56, c: "rgba(56,189,248,0.42)", t: "30 min" },
        { s: 80, c: "rgba(139,92,246,0.32)", t: "45 min" },
      ].map((r, i) => (
        <motion.div
          key={r.t}
          initial={{ scale: 0.4, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 + i * 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: `${r.s}%`,
            height: `${r.s}%`,
            borderColor: r.c,
            background: `radial-gradient(circle, ${r.c.replace(/[\d.]+\)$/, "0.07)")}, transparent 70%)`,
          }}
        >
          <span
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#060814] px-2 py-0.5 text-[10px] font-semibold"
            style={{ color: r.c.replace(/[\d.]+\)$/, "1)") }}
          >
            {r.t}
          </span>
        </motion.div>
      ))}
      {/* office marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-white text-[#060814] shadow-[0_0_30px_rgba(255,255,255,0.5)]">
          <Timer className="h-4.5 w-4.5" />
        </div>
      </div>
      {/* home pins */}
      {[
        { x: 26, y: 30, m: "12 min", ok: true },
        { x: 72, y: 36, m: "21 min", ok: true },
        { x: 34, y: 72, m: "28 min", ok: true },
        { x: 82, y: 74, m: "52 min", ok: false },
      ].map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -14, scale: 0.6 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.7 + i * 0.12 }}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
              p.ok
                ? "bg-emerald-400/15 text-emerald-300 ring-emerald-400/35"
                : "bg-white/6 text-slate-500 ring-white/10"
            }`}
          >
            {p.m}
          </span>
          <span
            className={`h-2.5 w-2.5 rounded-full ${p.ok ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,226,176,0.9)]" : "bg-slate-600"}`}
          />
        </motion.div>
      ))}
      <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1.5 text-[10.5px] font-medium text-slate-300 backdrop-blur">
        Showing homes within a <span className="text-emerald-300">30-min door-to-desk</span>{" "}
        commute
      </div>
    </div>
  );
}

function RentMeter() {
  return (
    <div className="relative w-full rounded-2xl bg-[#060814] p-5 ring-1 ring-white/8">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-white">Fair rent estimate</p>
        <span className="rounded-full bg-emerald-400/12 px-2.5 py-1 text-[10.5px] font-bold text-emerald-300 ring-1 ring-emerald-400/25">
          9% BELOW MARKET
        </span>
      </div>
      <div className="mt-6">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[linear-gradient(90deg,#34e2b0,#facc15_55%,#fb7185)]">
          <div className="absolute inset-0 bg-black/25" />
        </div>
        <motion.div
          initial={{ left: "8%" }}
          whileInView={{ left: "38%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="relative -mt-5 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-[#060814] bg-white shadow-[0_0_18px_rgba(255,255,255,0.7)]"
        />
        <div className="mt-3 flex justify-between text-[10.5px] font-medium text-slate-500">
          <span>₹28k under</span>
          <span>Fair · ₹34,500</span>
          <span>₹48k over</span>
        </div>
      </div>
      <p className="mt-5 flex gap-2 text-[12.5px] leading-relaxed text-slate-400">
        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
        Modelled on 4,180 recent signed agreements within 2 km, adjusted for floor, age,
        furnishing and facing.
      </p>
    </div>
  );
}

export function SmartSearch() {
  return (
    <Section id="smart">
      <div className="pointer-events-none absolute top-0 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-600/10 blur-[130px]" />
      <SectionHeading
        eyebrow="Smart search experience"
        title={
          <>
            Search by the thing that actually matters:{" "}
            <span className="text-gradient">your life.</span>
          </>
        }
        sub="Nobody wants “2BHK, 1200 sqft”. They want a 25-minute commute, honest rent, and water that runs in April. So that's what we let you search for."
      />

      <div className="mt-14 grid gap-5 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <TiltCard className="h-full p-6 sm:p-7" intensity={4} glow="rgba(34,211,238,0.3)">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/12 text-cyan-300 ring-1 ring-cyan-400/25">
                <Timer className="h-4.5 w-4.5" />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-white">
                  Commute-time based search
                </h3>
                <p className="text-[12.5px] text-slate-400">
                  Drop your office pin. We draw the map around it.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <CommuteVisual />
            </div>
          </TiltCard>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-5">
          <TiltCard className="h-full p-6 sm:p-7" intensity={4} glow="rgba(139,92,246,0.32)">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/12 text-violet-300 ring-1 ring-violet-400/25">
                <Brain className="h-4.5 w-4.5" />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-white">
                  AI rent-fairness score
                </h3>
                <p className="text-[12.5px] text-slate-400">
                  Know if you're being overcharged — before you ask.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <RentMeter />
            </div>
            <p className="mt-5 text-[13.5px] leading-relaxed text-slate-400">
              Owners get the same number. It's why listings on Keyless settle{" "}
              <strong className="font-semibold text-white">4.6% below</strong> the local asking
              average.
            </p>
          </TiltCard>
        </Reveal>

        <Reveal delay={0.16} className="lg:col-span-12">
          <TiltCard className="p-6 sm:p-7" intensity={3} glow="rgba(52,226,176,0.25)">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/25">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold text-white">
                    Local insights, crowd-verified
                  </h3>
                  <p className="text-[12.5px] text-slate-400">
                    The questions a broker will never answer honestly.
                  </p>
                </div>
              </div>
              <span className="text-[11.5px] text-slate-500">
                Sourced from residents + 30-day sensor logs
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {insights.map((it) => (
                <div
                  key={it.label}
                  className="flex items-center gap-3 rounded-xl bg-white/4 px-4 py-3.5 ring-1 ring-white/6 transition-colors hover:bg-white/8"
                >
                  <it.icon className={`h-4.5 w-4.5 shrink-0 ${it.tone}`} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                      {it.label}
                    </p>
                    <p className="truncate text-[13.5px] font-medium text-slate-200">
                      {it.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>
        </Reveal>
      </div>
    </Section>
  );
}

/* ============================================================
 *  VERIFIED LISTINGS GRID
 * ============================================================ */
type CardListing = {
  /** Present when the row came from Supabase — enables deep-linking. */
  id?: string;
  img: string;
  title: string;
  area: string;
  rent: string;
  deposit: string;
  beds: number;
  baths: number;
  sqft: number;
  badge: "Gold" | "Silver" | "Bronze";
  commute: string;
  owner: string;
  reply: string;
};

const PET_FRIENDLY = new Set([0, 2, 4]);
const IMMEDIATE = new Set([0, 1, 3, 4]);
const rupees = (s: string) => Number(s.replace(/[^\d]/g, ""));

/** Maps a Supabase `listings` row into the marketing card shape. */
function toCard(l: DbListing): CardListing {
  const deposit = l.price * 5;
  return {
    id: l.id,
    img:
      l.image ??
      "https://images.pexels.com/photos/8089172/pexels-photo-8089172.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    title: l.title,
    area: l.location,
    rent: "₹" + Number(l.price).toLocaleString("en-IN"),
    deposit:
      deposit >= 100000
        ? `₹${(deposit / 100000).toFixed(1)}L`
        : `₹${deposit.toLocaleString("en-IN")}`,
    beds: l.bedrooms,
    baths: l.bathrooms,
    sqft: l.area ?? 0,
    badge: l.status === "approved" ? "Gold" : "Silver",
    commute: l.property_type + " · " + l.furnishing,
    owner: "Verified owner",
    reply: "Replies in ~8 min",
  };
}

/** Shown while the database is empty so the landing page never looks broken. */
const FALLBACK_LISTINGS: CardListing[] = [
  {
    img: "https://images.pexels.com/photos/8089172/pexels-photo-8089172.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    title: "Light-filled 2BHK with open kitchen",
    area: "Koramangala 5th Block, Bengaluru",
    rent: "₹38,000",
    deposit: "₹1.9L",
    beds: 2,
    baths: 2,
    sqft: 1180,
    badge: "Gold",
    commute: "18 min to Embassy Tech Village",
    owner: "Ananya R.",
    reply: "Replies in ~6 min",
  },
  {
    img: "https://images.pexels.com/photos/7167073/pexels-photo-7167073.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    title: "Semi-furnished 3BHK, 11th floor",
    area: "Powai, Mumbai",
    rent: "₹72,500",
    deposit: "₹3.6L",
    beds: 3,
    baths: 3,
    sqft: 1460,
    badge: "Gold",
    commute: "24 min to BKC",
    owner: "Vikram S.",
    reply: "Replies in ~11 min",
  },
  {
    img: "https://images.pexels.com/photos/7173666/pexels-photo-7173666.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    title: "Corner 2BHK with balcony garden",
    area: "Baner, Pune",
    rent: "₹31,000",
    deposit: "₹1.2L",
    beds: 2,
    baths: 2,
    sqft: 1020,
    badge: "Silver",
    commute: "16 min to Hinjewadi Ph-1",
    owner: "Meera J.",
    reply: "Replies in ~14 min",
  },
  {
    img: "https://images.pexels.com/photos/19239905/pexels-photo-19239905.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    title: "Compact 1BHK, fully furnished",
    area: "Gachibowli, Hyderabad",
    rent: "₹24,500",
    deposit: "₹98,000",
    beds: 1,
    baths: 1,
    sqft: 690,
    badge: "Silver",
    commute: "9 min to Financial District",
    owner: "Rahul T.",
    reply: "Replies in ~8 min",
  },
  {
    img: "https://images.pexels.com/photos/7587783/pexels-photo-7587783.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    title: "Quiet 2BHK in gated society",
    area: "Sector 54, Gurgaon",
    rent: "₹46,000",
    deposit: "₹2.3L",
    beds: 2,
    baths: 2,
    sqft: 1240,
    badge: "Gold",
    commute: "21 min to Cyber Hub",
    owner: "Priya K.",
    reply: "Replies in ~5 min",
  },
  {
    img: "https://images.pexels.com/photos/6489096/pexels-photo-6489096.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    title: "Minimal studio, sea-breeze facing",
    area: "Besant Nagar, Chennai",
    rent: "₹19,800",
    deposit: "₹60,000",
    beds: 1,
    baths: 1,
    sqft: 540,
    badge: "Bronze",
    commute: "27 min to Tidel Park",
    owner: "Karthik M.",
    reply: "Replies in ~19 min",
  },
];

const badgeTone: Record<CardListing["badge"], string> = {
  Gold: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  Silver: "bg-slate-300/12 text-slate-200 ring-slate-300/25",
  Bronze: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
};

function ListingCard({ l, i }: { l: CardListing; i: number }) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 44, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className="glass group relative flex flex-col overflow-hidden rounded-3xl transition-shadow duration-500 hover:shadow-[0_40px_90px_-40px_rgba(99,102,241,0.85)]"
      style={{ transformPerspective: 1000 }}
    >
      <div className="relative aspect-16/10 overflow-hidden">
        <img
          src={l.img}
          alt={l.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060c] via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/15 backdrop-blur">
            <PlayCircle className="h-3.5 w-3.5 text-cyan-300" />
            90s VIDEO TOUR
          </span>
          <button
            onClick={() => setLiked((v) => !v)}
            aria-label="Save listing"
            className="grid h-8 w-8 place-items-center rounded-full bg-black/55 ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-black/75"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${liked ? "fill-rose-500 text-rose-500" : "text-white"}`}
            />
          </button>
        </div>
        <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5" /> 0% BROKERAGE
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15.5px] leading-snug font-semibold text-white">{l.title}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${badgeTone[l.badge]}`}
          >
            {l.badge.toUpperCase()}
          </span>
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-slate-400">
          <MapPin className="h-3.5 w-3.5" /> {l.area}
        </p>

        <div className="mt-4 flex items-center gap-4 text-[12px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-slate-500" /> {l.beds}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-slate-500" /> {l.baths}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-slate-500" /> {l.sqft} sqft
          </span>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-cyan-300/90">
          <Timer className="h-3.5 w-3.5" /> {l.commute}
        </p>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <p className="text-[21px] leading-none font-semibold text-white">
              {l.rent}
              <span className="text-[13px] font-normal text-slate-500">/mo</span>
            </p>
            <p className="mt-1.5 text-[11.5px] text-slate-500">Deposit {l.deposit}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-medium text-slate-300">{l.owner} · Owner</p>
            <p className="text-[11px] text-emerald-400/90">{l.reply}</p>
          </div>
        </div>

        <button className="mt-4 w-full rounded-xl bg-white/8 py-2.5 text-[13px] font-semibold text-white ring-1 ring-white/12 transition-all hover:bg-[linear-gradient(100deg,#7c3aed,#0891b2)] hover:ring-white/25">
          Contact owner directly
        </button>
      </div>
    </motion.article>
  );
}

const filters: { label: string; test: (l: CardListing, i: number) => boolean }[] = [
  { label: "All homes", test: () => true },
  { label: "Under ₹25k", test: (l) => rupees(l.rent) < 25000 },
  { label: "2BHK", test: (l) => l.beds === 2 },
  { label: "Pet friendly", test: (_l, i) => PET_FRIENDLY.has(i) },
  { label: "Immediate move-in", test: (_l, i) => IMMEDIATE.has(i) },
  { label: "Gold owners", test: (l) => l.badge === "Gold" },
];

export function Listings() {
  const [active, setActive] = useState(0);
  const [rows, setRows] = useState<CardListing[]>(FALLBACK_LISTINGS);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Pull real approved listings from Supabase (or the demo backend).
  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await listingsApi.listApproved();
      if (!alive) return;
      const live = res.data ?? [];
      if (live.length > 0) {
        setRows(live.slice(0, 6).map(toCard));
        setTotal(live.length);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const visible = rows.filter((l, i) => filters[active].test(l, i));
  const savedBrokerage = visible.reduce((sum, l) => sum + rupees(l.rent), 0);

  return (
    <Section id="listings">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline" />
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeading
          align="left"
          eyebrow="Browse verified listings"
          title={
            <>
              Real homes. Real owners.{" "}
              <span className="text-gradient-violet">Real videos.</span>
            </>
          }
          sub="Every card below passed the full six-gate verification pipeline. Tap any one and you're talking to the owner — not a call centre."
        />
        <Reveal delay={0.15}>
          <GhostButton href="/properties" className="shrink-0">
            {total !== null
              ? `See all ${total.toLocaleString("en-IN")} homes`
              : "Browse all homes"}{" "}
            <ArrowRight className="h-4 w-4" />
          </GhostButton>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mask-fade-x mt-9 flex gap-2 overflow-x-auto pb-2">
          {filters.map((f, i) => (
            <button
              key={f.label}
              onClick={() => setActive(i)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                active === i ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {active === i && (
                <motion.span
                  layoutId="listing-filter"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-[linear-gradient(100deg,rgba(124,58,237,0.45),rgba(8,145,178,0.35))] ring-1 ring-white/20"
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((l, i) =>
            l.id ? (
              // Real DB row → deep-link straight to the live detail page.
              <Link key={l.id} to={`/properties/${l.id}`} className="block">
                <ListingCard l={l} i={i} />
              </Link>
            ) : (
              <ListingCard key={l.title} l={l} i={i} />
            ),
          )}
        </AnimatePresence>
      </motion.div>

      {loading && (
        <p className="mt-6 text-center text-[12.5px] text-slate-500">
          Loading live listings…
        </p>
      )}
      {visible.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          No homes match that filter yet — try another.
        </p>
      )}

      <Reveal delay={0.1}>
        <div className="glass mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl p-6 sm:flex-row">
          <p className="flex items-center gap-3 text-[14px] text-slate-300">
            <Check className="h-5 w-5 shrink-0 text-emerald-400" />
            You'd have paid{" "}
            <strong className="font-semibold text-white">
              ₹{savedBrokerage.toLocaleString("en-IN")}
            </strong>{" "}
            in brokerage for the {visible.length} home
            {visible.length === 1 ? "" : "s"} above. Here, it's ₹0.
          </p>
          <PrimaryButton href="/properties" size="sm">
            Find Your Home <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </Reveal>
    </Section>
  );
}
