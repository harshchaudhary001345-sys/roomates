import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  type LucideIcon,
  X,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
  stat: string;
  icon: LucideIcon;
  to: string; // link to relevant page
  tone: string; // gradient class
  text: string; // text color class
}

const FEATURE_EXTRA: Record<string, { bullets: string[]; linkText: string }> = {
  "Video-Verified Listings": {
    bullets: [
      "90-second continuous walkthrough",
      "Timestamped + geotagged inside the app",
      "No gallery uploads allowed",
      "Listing is rejected if the video isn't live",
    ],
    linkText: "Browse all verified homes",
  },
  "ID-Verified Owners": {
    bullets: [
      "Government ID verification",
      "Liveness face match (you, in real time)",
      "Ownership document cross-check",
      "Badge issued only after all 3 checks pass",
    ],
    linkText: "Meet verified owners",
  },
  "The Verified Badge System": {
    bullets: [
      "Bronze, Silver, Gold tiers",
      "Based on response speed & accuracy",
      "Decays if listing goes stale 14 days",
      "Data always stays fresh",
    ],
    linkText: "See badge levels",
  },
  "Two-Way Reviews": {
    bullets: [
      "Tenants rate owners on honesty",
      "Owners rate tenants in return",
      "Both reviews unlock after move-in",
      "No retaliation, no bias possible",
    ],
    linkText: "Read real reviews",
  },
};

export default function FeatureModal({
  isOpen,
  onClose,
  title,
  body,
  stat,
  icon: Icon,
  to,
  tone,
  text,
}: FeatureModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for 3D tilt on the modal backdrop
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 180, damping: 26 });
  const sy = useSpring(my, { stiffness: 180, damping: 26 });
  const rotateY = useTransform(sx, [0, 1], [-6, 6]);
  const rotateX = useTransform(sy, [0, 1], [6, -6]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Click outside to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === ref.current) onClose();
    },
    [onClose],
  );

  // Mouse move on the modal card for tilt (only if open)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      mx.set(Math.max(0, Math.min(1, px)));
      my.set(Math.max(0, Math.min(1, py)));
    },
    [mx, my],
  );

  const extra = FEATURE_EXTRA[title] ?? {
    bullets: ["Learn more about this feature."],
    linkText: "Explore this feature",
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        onClick={handleBackdropClick}
        className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      >
        {/* Backdrop — scrim with blur */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden
        />

        {/* Ambient glow particles in the background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-72 w-72 rounded-full"
              style={{
                background: `radial-gradient(circle, ${tone.replace("from-", "")}88, transparent 70%)`,
                left: `${10 + i * 15}%`,
                top: `${10 + (i % 3) * 25}%`,
                filter: "blur-[60px]",
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Modal card — click on the card itself does NOT close */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleMouseMove}
          style={{ rotateX, rotateY, transformPerspective: 1200 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "glass-strong relative w-full max-w-lg overflow-hidden rounded-3xl",
            "transition-shadow duration-500",
            "shadow-[0_40px_100px_-40px_rgba(139,92,246,0.75)]",
          )}
        >
          {/* Mouse-follow glow on modal */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
            style={{
              background: `radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(139,92,246,0.35), transparent 60%)`,
            }}
            aria-hidden
          />

          {/* Top accent bar */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
            aria-hidden
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/10 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Card body */}
          <div className="relative px-6 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
            {/* Icon + title */}
            <div className="flex items-start justify-between gap-4">
              <div className={cn(
                "grid h-14 w-14 shrink-0 place-items-center rounded-2xl",
                tone,
                "ring-1",
                "ring-white/15",
              )}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className={cn("text-white", text)}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
              </div>
              <div className="min-w-0">
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.4 }}
                  className="text-[17px] font-semibold tracking-[-0.02em] text-white"
                >
                  {title}
                </motion.h2>
                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Keyless core feature
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 h-px w-full bg-white/8" />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="text-[14px] leading-relaxed text-slate-300"
            >
              {body}
            </motion.p>

            {/* Stat highlight */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className={cn(
                "mt-5 flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3",
                "ring-1 ring-white/8",
              )}
            >
              <div className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", tone)}>
                <ShieldCheck className={cn("h-3.5 w-3.5", text)} />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">
                  Key benefit
                </p>
                <p className={cn("text-[13px] font-semibold", text)}>{stat}</p>
              </div>
            </motion.div>

            {/* Extra bullets */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-5 flex flex-col gap-2.5"
            >
              {extra.bullets.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.35 }}
                  className="flex items-start gap-3 rounded-xl bg-white/[0.03] px-4 py-2.5 ring-1 ring-white/6"
                >
                  <Zap
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300",
                    )}
                  />
                  <span className="text-[12.5px] leading-relaxed text-slate-400">
                    {b}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to={to}
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#7c3aed,#4f46e5_45%,#0891b2)] px-5 py-3 text-[13.5px] font-semibold text-white ring-1 ring-white/20 shadow-[0_12px_36px_-10px_rgba(109,40,217,0.8)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {extra.linkText}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-[13.5px] font-medium text-slate-300 ring-1 ring-white/10 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white sm:flex-1"
              >
                Maybe later
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
