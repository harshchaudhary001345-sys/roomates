import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link as RRLink } from "react-router-dom";
import { cn } from "../utils/cn";

/* ---------------- Scroll reveal ---------------- */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 34, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Reveal({
  children,
  delay = 0,
  className,
  y = 34,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
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
      viewport={{ once: true, margin: "-70px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.09, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={revealVariants} className={className}>
      {children}
    </motion.div>
  );
}

/* ---------------- Eyebrow / Section heading ---------------- */
export function Eyebrow({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-violet-200/90 uppercase">
      {icon}
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2
          className={cn(
            "max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-white sm:text-5xl lg:text-[3.4rem]",
          )}
        >
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.12}>
          <p className="max-w-2xl text-base leading-relaxed text-slate-400 text-pretty sm:text-lg">
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------- Buttons ---------------- */

/** Shared button styles + router-aware wrapper. */
function btnCls(size: "sm" | "lg") {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white",
    size === "lg" ? "px-7 py-3.5 text-[15px]" : "px-5 py-2.5 text-sm",
  );
}

/** Wraps children in a <Link> or <a> based on whether the href looks internal. */
function ButtonWrap({
  href,
  onClick,
  children,
  className,
}: {
  href: string;
  onClick?: () => void;
  children: ReactNode;
  className: string;
}) {
  if (href.startsWith("/")) {
    return (
      <RRLink to={href} onClick={onClick} className={className}>
        {children}
      </RRLink>
    );
  }
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}

export function PrimaryButton({
  children,
  className,
  href = "/properties",
  onClick,
  size = "lg",
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  size?: "sm" | "lg";
}) {
  return (
    <motion.span
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.975 }}
      className={cn(
        btnCls(size),
        "group relative overflow-hidden",
        "bg-[linear-gradient(100deg,#7c3aed_0%,#4f46e5_45%,#0891b2_100%)]",
        "shadow-[0_10px_40px_-8px_rgba(109,40,217,0.75),0_0_60px_-20px_rgba(34,211,238,0.7)]",
        "ring-1 ring-white/20",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.42),transparent)] transition-transform duration-700 group-hover:translate-x-full"
        aria-hidden
      />
      <ButtonWrap href={href} onClick={onClick} className="relative flex items-center gap-2">
        {children}
      </ButtonWrap>
    </motion.span>
  );
}

export function GhostButton({
  children,
  className,
  href = "/properties",
  size = "lg",
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  size?: "sm" | "lg";
}) {
  return (
    <motion.span
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.975 }}
      className={cn(
        btnCls(size),
        "glass text-white/90 transition-colors hover:text-white",
        "hover:border-white/25 hover:bg-white/10",
        className,
      )}
    >
      <ButtonWrap href={href} className="flex items-center gap-2">
        {children}
      </ButtonWrap>
    </motion.span>
  );
}

/* ---------------- Glass card with 3D mouse tilt ---------------- */
export function TiltCard({
  children,
  className,
  intensity = 9,
  glow = "rgba(139,92,246,0.35)",
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 220, damping: 22 });
  const sy = useSpring(my, { stiffness: 220, damping: 22 });
  const rotateY = useTransform(sx, [0, 1], [-intensity, intensity]);
  const rotateX = useTransform(sy, [0, 1], [intensity, -intensity]);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        mx.set(px);
        my.set(py);
        setPos({ x: px * 100, y: py * 100 });
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        mx.set(0.5);
        my.set(0.5);
      }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn(
        "glass group relative overflow-hidden rounded-3xl transition-shadow duration-500",
        hover && "shadow-[0_30px_90px_-30px_rgba(99,102,241,0.75)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, ${glow}, transparent 65%)`,
        }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* ---------------- Animated counter ---------------- */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1900,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ---------------- Ambient background orbs ---------------- */
export function Aurora({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="animate-float-slow absolute -top-40 -left-32 h-[38rem] w-[38rem] rounded-full bg-violet-600/18 blur-[130px]" />
      <div className="animate-float-mid absolute top-1/3 -right-40 h-[34rem] w-[34rem] rounded-full bg-blue-600/16 blur-[130px]" />
      <div className="animate-float-slow absolute -bottom-52 left-1/3 h-[32rem] w-[32rem] rounded-full bg-cyan-500/12 blur-[140px]" />
    </div>
  );
}

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32", className)}
    >
      <div className="relative mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

export function Divider() {
  return <div className="hairline mx-auto h-px w-full max-w-7xl" />;
}
