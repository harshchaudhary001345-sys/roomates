import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { Menu, X, KeyRound } from "lucide-react";
import { PrimaryButton } from "./ui";
import { cn } from "../utils/cn";

const links = [
  { label: "Why Keyless", href: "#problem" },
  { label: "Verification", href: "#trust" },
  { label: "How it works", href: "#how" },
  { label: "Listings", href: "#listings" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#7c3aed,#2563eb_60%,#06b6d4)] shadow-[0_0_28px_-6px_rgba(124,58,237,0.9)]">
        <KeyRound className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-white/25" />
      </span>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">
          Keyless
          <span className="ml-1 align-super text-[9px] font-bold tracking-[0.14em] text-cyan-300/80">
            BETA
          </span>
        </span>
      )}
    </a>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 sm:px-5",
            scrolled
              ? "glass-strong shadow-[0_18px_50px_-24px_rgba(0,0,0,0.95)]"
              : "border border-transparent bg-transparent",
          )}
        >
          <Logo />

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative rounded-full px-3.5 py-2 text-[13.5px] font-medium text-slate-300 transition-colors hover:text-white"
              >
                <span className="relative z-10">{l.label}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-full px-4 py-2 text-[13.5px] font-medium text-slate-300 transition-colors hover:text-white sm:block"
            >
              Log in
            </Link>
            <PrimaryButton size="sm" href="/signup" className="hidden sm:inline-flex">
              Get started free
            </PrimaryButton>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="glass grid h-10 w-10 place-items-center rounded-xl text-white lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass-strong mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl lg:hidden"
            >
              <div className="flex flex-col p-3">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    {l.label}
                  </a>
                ))}
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/8 hover:text-white"
                >
                  Log in
                </Link>
                <PrimaryButton
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="mt-2 w-full"
                >
                  Get started free
                </PrimaryButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
