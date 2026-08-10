import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../utils/cn";

/* ==========================================================================
 *  SPARKLE TRAIL (mouse-follow particles on hover)
 * ========================================================================== */
function Sparkle({
  color,
  x,
  y,
  size,
}: {
  color: string;
  x: number;
  y: number;
  size: number;
}) {
  const angle = Math.random() * Math.PI * 2;
  const dist = 16 + Math.random() * 32;
  return (
    <motion.span
      initial={{ opacity: 1, x, y, scale: 1 }}
      animate={{
        opacity: 0,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scale: 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 + Math.random() * 0.4, ease: "easeOut" }}
      className="pointer-events-none absolute z-50 rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}`,
      }}
    />
  );
}

export function SparkleBox({
  children,
  className,
  sparkleColor = "#c4b5fd",
}: {
  children: ReactNode;
  className?: string;
  sparkleColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [sparkles, setSparkles] = useState<
    { id: string; x: number; y: number; size: number }[]
  >([]);
  const count = useRef(0);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (Math.random() < 0.38) {
        const id = `sp-${count.current++}`;
        setSparkles((prev) => [
          ...prev.slice(-16),
          {
            id,
            x,
            y,
            size: 2.5 + Math.random() * 5,
          },
        ]);
      }
    },
    [],
  );

  return (
    <div ref={ref} onMouseMove={onMove} className={cn("relative", className)}>
      <AnimatePresence>
        {sparkles.map((s) => (
          <Sparkle
            key={s.id}
            color={sparkleColor}
            x={s.x}
            y={s.y}
            size={s.size}
          />
        ))}
      </AnimatePresence>
      {children}
    </div>
  );
}

/* ==========================================================================
 *  WAVE HOVER (ripple border on hover)
 * ========================================================================== */
export function WaveCard({
  children,
  className,
  glowColor = "rgba(139,92,246,0.5)",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hover, setHover] = useState(false);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "glass group relative overflow-hidden transition-all duration-[400ms]",
        "hover:-translate-y-1.5",
        className,
      )}
    >
      {/* animated border gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(380px circle at ${pos.x}% ${pos.y}%, ${glowColor}, transparent 60%)`,
        }}
        aria-hidden
      />
      {/* shimmer sweep */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          hover && "opacity-100",
        )}
        style={{
          background: `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 48%, transparent 66%)`,
          backgroundSize: "200% 100%",
          animation: hover ? "shimmer 2.6s linear infinite" : "none",
        }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ==========================================================================
 *  NUMBER-ROLLUP (for dashboard stats)
 * ========================================================================== */
function useAnimatedCount(to: number, duration = 1800, enabled = true) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, enabled]);

  return val;
}

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let obs: IntersectionObserver | null = null;
    try {
      obs = new IntersectionObserver(
        ([e]) => { if (e?.isIntersecting) setInView(true); },
        { threshold: 0.3 },
      );
      obs.observe(el);
    } catch {
      // Observer is not available — just show the final number.
      setInView(true);
    }
    return () => obs?.disconnect();
  }, []);

  const v = useAnimatedCount(to, 2000, inView);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {prefix}
      {v.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ==========================================================================
 *  PULSE DOT (live-status indicator)
 * ========================================================================== */
export function PulseDot({
  label,
  color = "emerald",
}: {
  label?: string;
  color?: "emerald" | "amber" | "rose";
}) {
  const map = {
    emerald: "bg-emerald-400 shadow-emerald-400",
    amber: "bg-amber-400 shadow-amber-400",
    rose: "bg-rose-400 shadow-rose-400",
  };
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-70",
            map[color],
          )}
        />
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", map[color])} />
      </span>
      {label && <span className="text-[11.5px] text-slate-400">{label}</span>}
    </span>
  );
}

/* ==========================================================================
 *  SKELETON LOADER (for content-heavy pages)
 * ========================================================================== */
export function SkeletonCard() {
  const uid = useId();
  return (
    <div
      className="glass animate-pulse overflow-hidden rounded-2xl"
      aria-hidden
    >
      <div className="aspect-16/10 bg-white/5" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 rounded-full bg-white/8" />
        <div className="h-3 w-1/2 rounded-full bg-white/5" />
        <div className="flex gap-4 pt-2">
          {[...Array(3)].map((_, i) => (
            <div key={`${uid}-${i}`} className="h-3 w-10 rounded-full bg-white/6" />
          ))}
        </div>
        <div className="flex items-end justify-between pt-3">
          <div className="h-6 w-20 rounded-full bg-white/10" />
          <div className="h-8 w-24 rounded-lg bg-white/8" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ==========================================================================
 *  BADGE VARIANTS (reusable)
 * ========================================================================== */
const badgeCls = {
  verified:
    "bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/30",
  pending:
    "bg-amber-400/12 text-amber-300 ring-1 ring-amber-400/30",
  cancelled:
    "bg-rose-400/12 text-rose-300 ring-1 ring-rose-400/30",
  premium:
    "bg-[linear-gradient(100deg,rgba(124,58,237,0.25),rgba(8,145,178,0.2))] text-cyan-200 ring-1 ring-white/20",
};

export function Badge({
  children,
  kind = "verified",
  className,
}: {
  children: ReactNode;
  kind?: keyof typeof badgeCls;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase",
        badgeCls[kind],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ==========================================================================
 *  STAGGERED GRID REVEAL
 * ========================================================================== */
export function RevealGrid({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.06, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealGridItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
