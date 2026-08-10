import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  type LucideIcon,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { cn } from "../../utils/cn";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
  stat: string;
  tone: string; // gradient class string like "from-cyan-500/18 to-blue-600/8"
  ring: string; // ring class like "ring-cyan-400/25"
  text: string; // text color class like "text-cyan-300"
  to: string; // link target for CTA / card click
  statIcon?: LucideIcon; // icon for the stat badge
  delay?: number; // entrance animation delay
  index?: number; // for staggered entrance
  className?: string; // additional className for the card wrapper
}

/**
 * Interactive feature card with:
 *  - 3D tilt on mouse move (via TiltCard pattern, inlined here)
 *  - Icon hover animation (spin + pulse glow)
 *  - CTA button with slide-in on hover
 *  - Click triggers feature modal
 */
export default function FeatureCard({
  icon: Icon,
  title,
  body,
  stat,
  tone,
  ring,
  text,
  to,
  statIcon: StatIcon = Sparkles,
  delay = 0,
  index = 0,
  className,
}: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // 3D tilt values
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 210, damping: 22 });
  const sy = useSpring(my, { stiffness: 210, damping: 22 });
  const rotateY = useTransform(sx, [0, 1], [-7, 7]);
  const rotateX = useTransform(sy, [0, 1], [7, -7]);

  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  // Entrance animation delay
  const delayMs = (delay + index * 0.08) * 1000;

  // Icon rotation on hover
  const iconRotate = hover ? 360 : 0;

  // Stat icon pulse on hover
  const statPulse = hover
    ? { scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }
    : {};

  // CTA button slide-in on hover
  const ctaX = hover ? 0 : 18;
  const ctaOpacity = hover ? 1 : 0;

  const handleClick = useCallback(() => {
    // Dispatch custom event so parent can listen and open modal
    window.dispatchEvent(
      new CustomEvent("open-feature-modal", {
        detail: { title, body, stat, icon: Icon, to, tone, text },
      }),
    );
  }, [title, body, stat, Icon, to, tone, text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: delayMs / 1000, ease: [0.16, 1, 0.3, 1] }}
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
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
        mx.set(0.5);
        my.set(0.5);
      }}
      onClick={handleClick}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn(
        // base card
        "glass group relative overflow-hidden rounded-3xl",
        "transition-shadow duration-[500ms]",
        "cursor-pointer",
        // hover shadow + slight scale
        hover && "shadow-[0_40px_100px_-40px_rgba(139,92,246,0.85)]",
        // subtle scale on hover via motion
        className,
      )}
    >
      {/* Background gradient overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
          "opacity-0 group-hover:opacity-100",
        )}
        style={{
          background: `linear-gradient(135deg, ${tone.replace("from-", "")} 0%, ${tone.split(" ").pop()?.replace("to-", "")?.replace("/8", "") || "transparent"} 100%)`,
          opacity: hover ? 0.12 : 0,
        }}
        aria-hidden
      />

      {/* Mouse-follow glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, rgba(139,92,246,0.32), transparent 65%)`,
        }}
        aria-hidden
      />

      {/* Edge glow line that appears on hover */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          "bg-gradient-to-r from-transparent via-transparent to-transparent",
          "transition-all duration-700",
        )}
        style={{
          backgroundImage: hover
            ? `linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1), transparent 80%)`
            : "none",
          backgroundSize: "200% 100%",
          animation: hover ? "shimmer 2.6s linear infinite" : "none",
        }}
        aria-hidden
      />

      <div className="relative">
        {/* Icon container */}
        <motion.div
          animate={{ rotate: iconRotate }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "group/icon relative grid h-12 w-12 place-items-center rounded-2xl",
            "transition-all duration-500",
            // base gradient background
            tone,
            // ring that becomes visible on hover
            "ring-1",
            ring,
            // scale up on hover
            "group-hover/icon:scale-105",
            // add a soft inner glow on hover
            "after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/20 after:opacity-0 group-hover/icon:after:opacity-100",
          )}
          style={{ WebkitMaskComposite: "source-over" }}
        >
          <motion.div
            animate={{
              rotate: iconRotate,
              scale: hover ? 1.08 : 1,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={cn("text-white", text)}
          >
            <Icon className="h-5.5 w-5.5" />
          </motion.div>

          {/* Sparkle particles on hover around the icon */}
          {hover && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pointer-events-none absolute inset-0"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-violet-300"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    boxShadow: "0 0 6px #c4b5fd",
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    x: [0, (Math.random() - 0.5) * 40],
                    y: [0, (Math.random() - 0.5) * 40],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delayMs / 1000 + 0.1, duration: 0.5 }}
          className="mt-5 text-[17px] font-semibold tracking-[-0.02em] text-white"
        >
          {title}
        </motion.h3>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delayMs / 1000 + 0.18, duration: 0.5 }}
          className="mt-2.5 text-[14.5px] leading-relaxed text-slate-400"
        >
          {body}
        </motion.p>

        {/* Stat badge with icon */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delayMs / 1000 + 0.25, duration: 0.5 }}
          className="mt-5 flex items-center gap-2"
        >
          <motion.div
            animate={statPulse}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5 ring-1 ring-white/10"
          >
            <StatIcon className={`h-3.5 w-3.5 ${text}`} />
          </motion.div>
          <p className={cn("text-[12px] font-semibold", text)}>{stat}</p>
        </motion.div>

        {/* CTA button — slides in on hover */}
        <motion.div
          animate={{ x: ctaX, opacity: ctaOpacity }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className={cn(
              "group w-full rounded-xl border bg-white/8 px-4 py-2.5 text-[12.5px] font-semibold text-white",
              "transition-all",
              "ring-1 ring-white/12",
              "hover:bg-[linear-gradient(100deg,#7c3aed,#0891b2)] hover:border-white/25",
              "active:scale-[0.98]",
            )}
            aria-label={`Learn more about ${title}`}
          >
            <span className="flex items-center gap-2">
              {title}
              <motion.span
                animate={{ x: hover ? 0 : 4 }}
                className="inline-flex h-3.5 w-3.5 items-center justify-center"
              >
                <ChevronRight className="h-3.5 w-3.5 text-white/70" />
              </motion.span>
            </span>
          </button>
        </motion.div>

        {/* Click hint indicator (subtle, bottom-right) */}
        <div
          className={cn(
            "pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] font-medium text-slate-600",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          )}
        >
          <ArrowRight className="h-3 w-3" />
          <span>click to learn more</span>
        </div>
      </div>
    </motion.div>
  );
}
