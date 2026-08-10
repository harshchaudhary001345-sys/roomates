import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Bath, BedDouble, BadgeCheck, ImageIcon, MapPin, Ruler } from "lucide-react";
import type { Property } from "../../lib/types";
import { SparkleBox } from "./AnimatedKit";

export const inr = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

export function PropertyImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src)
    return (
      <div
        className={
          "flex items-center justify-center bg-[linear-gradient(135deg,#0d1020,#141a2e)] " +
          (className ?? "")
        }
      >
        <ImageIcon className="h-8 w-8 text-slate-700" />
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" className={className} />;
}

export default function PropertyCard({
  property,
  index = 0,
}: {
  property: Property;
  index?: number;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -7, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className="group glass relative flex flex-col overflow-hidden rounded-2xl transition-shadow duration-[500ms] hover:shadow-[0_40px_100px_-40px_rgba(99,102,241,0.85)]"
    >
      {/* ---- mouse-reactive glow ---- */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(500px circle at var(--mx,50%) var(--my,50%), rgba(139,92,246,0.22), transparent 55%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 48%, transparent 66%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2.6s linear infinite",
        }}
        aria-hidden
      />
      {/* mouse-tracking glow pos */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        onMouseMove={(e) => {
          const r = e.currentTarget.parentElement?.getBoundingClientRect();
          if (!r) return;
          (e.currentTarget.parentElement as HTMLElement).style.setProperty(
            "--mx",
            `${((e.clientX - r.left) / r.width) * 100}%`,
          );
          (e.currentTarget.parentElement as HTMLElement).style.setProperty(
            "--my",
            `${((e.clientY - r.top) / r.height) * 100}%`,
          );
        }}
        aria-hidden
      />

      <Link
        to={`/properties/${property.id}`}
        className="relative block aspect-16/10 overflow-hidden"
      >
        <PropertyImage
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-106"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060c]/90 via-transparent to-transparent" />
        {property.verified && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10.5px] font-bold text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur">
            <BadgeCheck className="h-3 w-3" /> VERIFIED
          </span>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[10.5px] font-bold text-white ring-1 ring-white/15 backdrop-blur">
          0% BROKERAGE
        </span>
        {!property.available && (
          <span className="absolute bottom-3 left-3 rounded-full bg-rose-500/20 px-2.5 py-1 text-[10.5px] font-bold text-rose-200 ring-1 ring-rose-400/30 backdrop-blur">
            RENTED OUT
          </span>
        )}
      </Link>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <Link to={`/properties/${property.id}`} className="group/link">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-white transition-colors group-hover/link:text-violet-200">
            {property.title}
          </h3>
        </Link>
        <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </p>

        <div className="mt-4 flex items-center gap-4 text-[12px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-slate-600" /> {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-slate-600" /> {property.bathrooms}
          </span>
          {property.area ? (
            <span className="flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-slate-600" /> {property.area} sqft
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between pt-5">
          <p className="text-[20px] leading-none font-semibold text-white">
            {inr(property.price)}
            <span className="text-[12.5px] font-normal text-slate-500">/mo</span>
          </p>
          <SparkleBox sparkleColor="#a78bfa">
            <Link
              to={`/properties/${property.id}`}
              className="inline-block rounded-lg bg-white/8 px-3.5 py-2 text-[12.5px] font-semibold text-white ring-1 ring-white/12 transition-all hover:bg-[linear-gradient(100deg,#7c3aed,#0891b2)]"
            >
              View & book
            </Link>
          </SparkleBox>
        </div>
      </div>
    </motion.article>
  );
}
