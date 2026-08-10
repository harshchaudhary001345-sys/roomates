import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  Check,
  FileCheck2,
  Fingerprint,
  Loader2,
  Lock,
  ScanFace,
  ShieldCheck,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { verification } from "../../lib/api";
import {
  STEP_META,
  VERIFICATION_STEPS,
  type Listing,
  type StepRecord,
  type VerificationStep,
} from "../../lib/types";
import { Alert, Field, inputCls } from "./Shell";
import { cn } from "../../utils/cn";

const icons = {
  step1: Fingerprint,
  step2: ScanFace,
  step3: FileCheck2,
  step4: Video,
  step5: ShieldCheck,
  step6: BadgeCheck,
} satisfies Record<VerificationStep, typeof Fingerprint>;

function stepIndex(step: VerificationStep) {
  return VERIFICATION_STEPS.indexOf(step);
}

function statusFor(listing: Listing, step: VerificationStep) {
  const current = stepIndex(listing.verification_status);
  const i = stepIndex(step);
  if (i < current || listing.verification_status === "step6") return "complete";
  if (i === current) return "active";
  if (i === current + 1) return "available";
  return "locked";
}

export default function VerificationPipeline({
  listing,
  onUpdated,
}: {
  listing: Listing;
  onUpdated: (listing: Listing) => void;
}) {
  const [openStep, setOpenStep] = useState<VerificationStep | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<StepRecord[]>([]);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [ownershipFile, setOwnershipFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const loadHistory = useCallback(async () => {
    const res = await verification.history(listing.id);
    if (!res.error) setHistory(res.data ?? []);
  }, [listing.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory, listing.verification_status]);

  const currentIndex = stepIndex(listing.verification_status);
  const progress = listing.verification_status === "step6" ? 100 : ((currentIndex + 1) / 6) * 100;

  const canOpen = (step: VerificationStep) => {
    const s = statusFor(listing, step);
    return s === "complete" || s === "active" || s === "available";
  };

  const activeMeta = useMemo(
    () => (openStep ? STEP_META[openStep] : null),
    [openStep],
  );

  async function runStep(step: VerificationStep) {
    setLoading(true);
    setError(null);
    const res =
      step === "step6"
        ? await verification.adminReview(listing, true)
        : await verification.advance({
            listing,
            nextStep: step,
            idFile,
            selfieFile,
            ownershipFile,
            videoFile,
          });
    setLoading(false);
    if (res.error) return setError(res.error);
    if (res.data) {
      onUpdated(res.data);
      setOpenStep(null);
      setIdFile(null);
      setSelfieFile(null);
      setOwnershipFile(null);
      setVideoFile(null);
    }
  }

  return (
    <div className="glass-strong overflow-hidden rounded-3xl p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-[11px] font-bold tracking-[0.18em] text-violet-300 uppercase">
            Listing verification pipeline
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">
            {listing.title}
          </h3>
          <p className="mt-1.5 text-[13px] text-slate-400">
            Status: <span className="font-semibold text-white">{listing.status.replace("_", " ")}</span>
          </p>
        </div>
        {listing.status === "approved" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400/12 px-4 py-2 text-[12px] font-bold text-emerald-300 ring-1 ring-emerald-400/30"
          >
            <BadgeCheck className="h-4 w-4" /> Verified Badge Issued
          </motion.div>
        )}
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#0891b2,#34e2b0)]"
        />
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {VERIFICATION_STEPS.map((step, i) => {
          const meta = STEP_META[step];
          const Icon = icons[step];
          const state = statusFor(listing, step);
          const clickable = canOpen(step);
          return (
            <motion.button
              key={step}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && setOpenStep(step)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              whileHover={clickable ? { y: -4, scale: 1.015 } : undefined}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl p-4 text-left ring-1 transition-all",
                state === "complete" && "bg-emerald-400/10 text-white ring-emerald-400/25",
                state === "active" && "bg-violet-500/12 text-white ring-violet-400/30 glow-violet",
                state === "available" && "bg-white/6 text-white ring-white/12 hover:bg-white/10",
                state === "locked" && "bg-white/[0.03] text-slate-600 ring-white/6 opacity-70",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition-transform group-hover:scale-110",
                    state === "complete" && "bg-emerald-400/15 text-emerald-300 ring-emerald-400/25",
                    state === "active" && "bg-violet-400/15 text-violet-200 ring-violet-400/30",
                    state === "available" && "bg-cyan-400/12 text-cyan-300 ring-cyan-400/25",
                    state === "locked" && "bg-white/5 text-slate-600 ring-white/8",
                  )}
                >
                  {state === "complete" ? (
                    <Check className="h-4.5 w-4.5" />
                  ) : state === "locked" ? (
                    <Lock className="h-4.5 w-4.5" />
                  ) : (
                    <Icon className="h-4.5 w-4.5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold">{meta.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-slate-400">
                    {meta.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ---------------------- audit trail timeline ---------------------- */}
      {history.length > 0 && (
        <div className="mt-7 rounded-2xl bg-black/20 p-5 ring-1 ring-white/8">
          <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500 uppercase">
            Verification history
          </p>
          <ol className="mt-4 flex flex-col gap-0">
            {history.map((h, i) => {
              const meta = STEP_META[h.step];
              const last = i === history.length - 1;
              return (
                <motion.li
                  key={h.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="relative flex gap-3 pb-4 last:pb-0"
                >
                  {!last && (
                    <span className="absolute top-6 left-[11px] h-full w-px bg-white/10" />
                  )}
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ring-1",
                      h.status === "completed" &&
                        "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
                      h.status === "failed" &&
                        "bg-rose-400/15 text-rose-300 ring-rose-400/30",
                      h.status === "pending" &&
                        "bg-amber-400/15 text-amber-300 ring-amber-400/30",
                    )}
                  >
                    {h.status === "failed" ? (
                      <X className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <p className="text-[13px] font-semibold text-white">
                        {meta?.label ?? h.step}
                      </p>
                      <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        {h.actor}
                      </span>
                    </div>
                    {h.note && (
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
                        {h.note}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-600">
                      {new Date(h.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      )}

      <AnimatePresence>
        {openStep && activeMeta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 30, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass-strong w-full max-w-lg rounded-3xl p-6 shadow-[0_40px_100px_-35px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.16em] text-violet-300 uppercase">
                    {openStep}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{activeMeta.label}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
                    {activeMeta.description}
                  </p>
                </div>
                <button
                  onClick={() => setOpenStep(null)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-slate-400 hover:text-white"
                  aria-label="Close verification step"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {error && <div className="mt-5"><Alert kind="error">{error}</Alert></div>}

              <div className="mt-6 flex flex-col gap-4">
                {openStep === "step2" && (
                  <>
                    <Field label="Government ID">
                      <input type="file" accept="image/*,.pdf" onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} className={inputCls} />
                    </Field>
                    <Field label="Selfie / face match image">
                      <input type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)} className={inputCls} />
                    </Field>
                    <p className="rounded-xl bg-emerald-400/8 px-4 py-3 text-[12px] text-emerald-300 ring-1 ring-emerald-400/20">
                      Fake AI face-match flag will be set to true after upload.
                    </p>
                  </>
                )}

                {openStep === "step3" && (
                  <Field label="Ownership document">
                    <input type="file" accept="image/*,.pdf" onChange={(e) => setOwnershipFile(e.target.files?.[0] ?? null)} className={inputCls} />
                  </Field>
                )}

                {openStep === "step4" && (
                  <Field label="90s video walkthrough">
                    <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} className={inputCls} />
                  </Field>
                )}

                {openStep === "step5" && (
                  <p className="rounded-xl bg-amber-400/8 px-4 py-3 text-[13px] leading-relaxed text-amber-200 ring-1 ring-amber-400/20">
                    This will mark the listing as under review. Then use the simulated admin approval to issue the badge.
                  </p>
                )}

                {openStep === "step6" && (
                  <p className="rounded-xl bg-emerald-400/8 px-4 py-3 text-[13px] leading-relaxed text-emerald-200 ring-1 ring-emerald-400/20">
                    Simulated admin approval will mark the listing approved and issue the Verified Badge.
                  </p>
                )}

                {openStep === "step1" && (
                  <p className="rounded-xl bg-white/5 px-4 py-3 text-[13px] leading-relaxed text-slate-300 ring-1 ring-white/10">
                    Step 1 was completed automatically when the owner account/listing was created.
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {openStep !== "step1" && (
                  <button
                    onClick={() => void runStep(openStep)}
                    disabled={loading || statusFor(listing, openStep) === "complete"}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-3 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                    {openStep === "step6" ? "Simulate Admin Approve" : openStep === "step5" ? "Submit For Review" : "Complete Step"}
                  </button>
                )}
                <button
                  onClick={() => setOpenStep(null)}
                  className="rounded-xl bg-white/6 px-5 py-3 text-[13px] font-medium text-slate-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
