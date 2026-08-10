import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import {
  ArrowRight,
  CalendarCheck,
  KeyRound,
  MessageSquare,
  PlayCircle,
} from "lucide-react";
import { PrimaryButton, Reveal, Section, SectionHeading } from "../components/ui";

const steps = [
  {
    icon: PlayCircle,
    n: "01",
    title: "Watch the 90-second tour",
    body: "Every home opens with a continuous, timestamped walkthrough. You've effectively already visited before you leave your desk.",
    meta: "Avg. 14 videos watched before shortlisting",
    accent: "from-cyan-500/30 to-blue-600/10",
    dot: "bg-cyan-400",
    text: "text-cyan-300",
    depth: 1,
  },
  {
    icon: MessageSquare,
    n: "02",
    title: "Message the owner directly",
    body: "One tap opens a chat with the person who owns the flat. Ask about the water, the parking, the neighbours — get real answers.",
    meta: "Median first reply: 8 minutes",
    accent: "from-violet-500/30 to-indigo-600/10",
    dot: "bg-violet-400",
    text: "text-violet-300",
    depth: 2,
  },
  {
    icon: CalendarCheck,
    n: "03",
    title: "Visit and agree the rent",
    body: "Book a slot in the app. Walk in with the AI fairness score in hand so the number is a conversation, not an ambush.",
    meta: "1.8 visits on average before a match",
    accent: "from-fuchsia-500/28 to-purple-600/10",
    dot: "bg-fuchsia-400",
    text: "text-fuchsia-300",
    depth: 1.6,
  },
  {
    icon: KeyRound,
    n: "04",
    title: "Sign, e-stamp, move in",
    body: "Digital agreement, e-stamping and deposit escrow in a single flow. No runners, no notary queue, no envelope of cash.",
    meta: "Signed to keys in 20 minutes",
    accent: "from-emerald-500/28 to-teal-600/10",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    depth: 2.4,
  },
];

function StepCard({ s, i, progress }: { s: (typeof steps)[number]; i: number; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const y = useTransform(progress, [0, 1], [s.depth * 46, s.depth * -46]);
  const smoothY = useSpring(y, { stiffness: 90, damping: 24, mass: 0.5 });

  return (
    <motion.div
      style={{ y: smoothY }}
      initial={{ opacity: 0, y: 60, rotateX: 10, scale: 0.95 }}
      whileInView={{ opacity: 1, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.85, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="glass relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-500 group-hover:border-white/25 group-hover:shadow-[0_40px_90px_-40px_rgba(99,102,241,0.9)]">
        <div
          className={`pointer-events-none absolute -top-20 -right-16 h-44 w-44 rounded-full bg-gradient-to-br ${s.accent} opacity-70 blur-[60px] transition-opacity duration-500 group-hover:opacity-100`}
        />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span
              className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${s.accent} ring-1 ring-white/12`}
            >
              <s.icon className={`h-5 w-5 ${s.text}`} />
            </span>
            <span className="font-mono text-3xl font-semibold tracking-tight text-white/10 tabular-nums">
              {s.n}
            </span>
          </div>
          <h3 className="mt-5 text-[17px] leading-snug font-semibold text-white">
            {s.title}
          </h3>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-slate-400">{s.body}</p>
          <p
            className={`mt-5 flex items-center gap-2 text-[11.5px] font-semibold tracking-wide ${s.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.meta}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const beam = useTransform(scrollYProgress, [0.15, 0.62], [0, 1]);
  const beamSmooth = useSpring(beam, { stiffness: 110, damping: 26 });
  const shardA = useTransform(scrollYProgress, [0, 1], [90, -120]);
  const shardB = useTransform(scrollYProgress, [0, 1], [-60, 140]);
  const shardC = useTransform(scrollYProgress, [0, 1], [40, -180]);

  return (
    <Section id="how" className="overflow-hidden">
      {/* parallax depth shards */}
      <motion.div
        style={{ y: shardA }}
        className="pointer-events-none absolute top-10 -left-24 h-72 w-72 rotate-12 rounded-[3rem] border border-white/6 bg-white/2 backdrop-blur-sm"
        aria-hidden
      />
      <motion.div
        style={{ y: shardB }}
        className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 -rotate-12 rounded-[3.5rem] border border-violet-400/10 bg-violet-500/4 backdrop-blur-sm"
        aria-hidden
      />
      <motion.div
        style={{ y: shardC }}
        className="pointer-events-none absolute top-1/3 right-1/4 h-40 w-40 rotate-45 rounded-[2rem] border border-cyan-400/10 bg-cyan-400/3"
        aria-hidden
      />

      <div ref={ref}>
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              From scroll to keys in{" "}
              <span className="text-gradient">four moves.</span>
            </>
          }
          sub="No site-visit marathons, no broker relaying half-truths, no chasing a notary on a Tuesday afternoon. This is the whole journey."
        />

        <div className="relative mt-16">
          {/* progress beam */}
          <div className="absolute top-[3.2rem] right-8 left-8 hidden h-px bg-white/8 lg:block">
            <motion.div
              style={{ scaleX: beamSmooth }}
              className="h-full origin-left bg-[linear-gradient(90deg,#22d3ee,#8b5cf6_45%,#34e2b0)] shadow-[0_0_16px_rgba(139,92,246,0.9)]"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <StepCard key={s.n} s={s} i={i} progress={scrollYProgress} />
            ))}
          </div>
        </div>

        <Reveal delay={0.12}>
          <div className="glass mt-14 flex flex-col items-center justify-between gap-5 rounded-3xl p-6 sm:flex-row sm:p-7">
            <div>
              <p className="text-[16px] font-semibold text-white">
                Median time from first search to keys in hand:{" "}
                <span className="text-gradient-violet">2.7 days.</span>
              </p>
              <p className="mt-1.5 text-[13px] text-slate-400">
                The old way took 3–6 weeks and a month's rent. You know which one you want.
              </p>
            </div>
            <PrimaryButton href="/properties" className="shrink-0">
              Start step one <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
