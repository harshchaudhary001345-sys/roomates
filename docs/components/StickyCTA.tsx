import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, X } from "lucide-react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX: x }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[linear-gradient(90deg,#7c3aed,#4f46e5_45%,#22d3ee)] shadow-[0_0_14px_rgba(124,58,237,0.9)]"
    />
  );
}

export default function StickyCTA() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.body.scrollHeight - window.innerHeight;
      setShow(y > window.innerHeight * 0.95 && y < h - 700);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:pb-5"
        >
          <div className="glass-strong flex w-full max-w-3xl items-center gap-3 rounded-2xl py-2.5 pr-2.5 pl-4 shadow-[0_25px_70px_-25px_rgba(0,0,0,0.95)] sm:gap-5">
            <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/25 sm:grid">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-semibold text-white">
                Stop paying brokerage. Start today.
              </p>
              <p className="hidden truncate text-[11.5px] text-slate-400 sm:block">
                Free for tenants · 41,208 video-verified homes · Premium free for early users
              </p>
            </div>
            <Link
              to="/properties"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[linear-gradient(100deg,#7c3aed,#4f46e5_45%,#0891b2)] px-4 py-2.5 text-[13px] font-semibold text-white ring-1 shadow-[0_10px_32px_-8px_rgba(109,40,217,0.9)] ring-white/20 transition-transform hover:scale-[1.04] active:scale-[0.97] sm:px-5"
            >
              Find Your Home <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-white/8 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
