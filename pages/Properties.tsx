import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { Building2, PlusCircle, Search, SlidersHorizontal } from "lucide-react";
import { listings as listingsApi } from "../lib/api";
import type { Listing, Property } from "../lib/types";
import { AppLayout, Alert, inputCls } from "../components/app/Shell";
import PropertyCard from "../components/app/PropertyCard";
import { RevealGrid, RevealGridItem, SkeletonGrid } from "../components/app/AnimatedKit";

const sorts = [
  { id: "new", label: "Newest" },
  { id: "low", label: "Price: low → high" },
  { id: "high", label: "Price: high → low" },
] as const;

export default function PropertiesPage() {
  const [all, setAll] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [beds, setBeds] = useState(0);
  const [sort, setSort] = useState<(typeof sorts)[number]["id"]>("new");

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await listingsApi.listApproved();
      if (!alive) return;
      if (res.error) setError(res.error);
      else setAll((res.data ?? []).map(listingToProperty));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = all.filter((p) => {
      const matches =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term);
      return matches && p.price <= maxPrice && (beds === 0 || p.bedrooms >= beds);
    });

    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [all, q, maxPrice, beds, sort]);

  return (
    <AppLayout>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-[2.2rem] leading-tight font-semibold tracking-[-0.03em] text-white">
            Verified homes
          </h1>
          <p className="mt-2 text-[14px] text-slate-400">
            {loading ? "Loading homes…" : `${visible.length} of ${all.length} homes`} ·
            Zero brokerage on every single one.
          </p>
        </div>
        <Link
          to="/add-property"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-2.5 text-[13.5px] font-semibold text-white ring-1 ring-white/20"
        >
          <PlusCircle className="h-4 w-4" /> List your property
        </Link>
      </div>

      {/* filters */}
      <div className="glass mt-7 rounded-2xl p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by locality, title or landmark…"
              aria-label="Search properties"
              className={inputCls + " pl-10"}
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-baseline justify-between text-[11.5px] text-slate-500">
              <span>Max rent</span>
              <span className="font-mono text-slate-300">
                ₹{maxPrice.toLocaleString("en-IN")}
              </span>
            </label>
            <input
              type="range"
              min={5000}
              max={200000}
              step={1000}
              value={maxPrice}
              aria-label="Maximum rent"
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              style={{
                background: `linear-gradient(90deg,#7c3aed ${((maxPrice - 5000) / 195000) * 100}%, rgba(255,255,255,0.1) ${((maxPrice - 5000) / 195000) * 100}%)`,
              }}
            />
          </div>

          <div>
            <p className="mb-1.5 text-[11.5px] text-slate-500">Bedrooms</p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((b) => (
                <button
                  key={b}
                  onClick={() => setBeds(b)}
                  className={`flex-1 rounded-lg py-2 text-[12px] font-semibold transition-colors ${
                    beds === b
                      ? "bg-white/14 text-white ring-1 ring-white/20"
                      : "bg-white/4 text-slate-400 hover:text-white"
                  }`}
                >
                  {b === 0 ? "Any" : `${b}+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[11.5px] text-slate-500">
              <SlidersHorizontal className="h-3 w-3" /> Sort
            </p>
            <select
              value={sort}
              aria-label="Sort properties"
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className={inputCls + " py-2.5"}
            >
              {sorts.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0b0d18]">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <Alert kind="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={6} />
      ) : visible.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mt-8 flex flex-col items-center gap-4 rounded-2xl px-6 py-20 text-center"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-slate-500">
            <Building2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[16px] font-semibold text-white">No homes match that</p>
            <p className="mt-1.5 text-[13.5px] text-slate-500">
              Try widening your budget or clearing the search box.
            </p>
          </div>
          <button
            onClick={() => {
              setQ("");
              setMaxPrice(200000);
              setBeds(0);
            }}
            className="rounded-full bg-white/8 px-5 py-2.5 text-[13px] font-semibold text-white ring-1 ring-white/12 hover:bg-white/14"
          >
            Reset filters
          </button>
        </motion.div>
      ) : (
        <RevealGrid className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" delay={0.1}>
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <RevealGridItem key={p.id}>
                <PropertyCard property={p} index={i} />
              </RevealGridItem>
            ))}
          </AnimatePresence>
        </RevealGrid>
      )}
    </AppLayout>
  );
}

function listingToProperty(l: Listing): Property {
  return {
    id: l.id,
    title: l.title,
    price: l.price,
    location: l.location,
    image: l.image,
    description: l.description,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    area: l.area,
    property_type: l.property_type,
    furnishing: l.furnishing,
    available: l.status === "approved",
    verified: l.status === "approved",
    user_id: l.user_id,
    created_at: l.created_at,
  };
}
