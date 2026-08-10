import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  Home,
  Mail,
  MapPin,
  MessageSquare,
  Ruler,
  ShieldCheck,
  Sofa,
  User,
} from "lucide-react";
import { bookings as bookingsApi, listings as listingsApi, properties as propertiesApi } from "../lib/api";
import type { Listing, Property } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import {
  Alert,
  AppLayout,
  Field,
  PageLoader,
  SubmitButton,
  inputCls,
} from "../components/app/Shell";
import { PropertyImage, inr } from "../components/app/PropertyCard";
import { WaveCard } from "../components/app/AnimatedKit";
import ChatBox from "../components/app/ChatBox";

const today = () => new Date().toISOString().slice(0, 10);

export default function PropertyDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [date, setDate] = useState(today());
  const [message, setMessage] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const listingRes = await listingsApi.byId(id);
      if (!alive) return;
      if (!listingRes.error && listingRes.data) {
        setListing(listingRes.data);
        setProperty(listingToProperty(listingRes.data));
      } else {
        const res = await propertiesApi.byId(id);
        if (res.error) setLoadError(res.error);
        else setProperty(res.data);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function onBook(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/properties/${id}` } });
      return;
    }
    setBooking(true);
    setBookError(null);
    const res = await bookingsApi.create({
      property_id: id,
      user_id: user.id,
      date,
      message,
    });
    setBooking(false);
    if (res.error) setBookError(res.error);
    else setDone(true);
  }

  if (loading)
    return (
      <AppLayout>
        <PageLoader label="Loading property" />
      </AppLayout>
    );

  if (loadError || !property)
    return (
      <AppLayout>
        <div className="mx-auto max-w-lg pt-10">
          <Alert kind="error">{loadError ?? "Property not found."}</Alert>
          <Link
            to="/properties"
            className="mt-6 inline-flex items-center gap-2 text-[13.5px] text-violet-300 hover:text-violet-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all homes
          </Link>
        </div>
      </AppLayout>
    );

  const facts = [
    { icon: BedDouble, label: "Bedrooms", value: `${property.bedrooms}` },
    { icon: Bath, label: "Bathrooms", value: `${property.bathrooms}` },
    { icon: Ruler, label: "Area", value: property.area ? `${property.area} sqft` : "—" },
    { icon: Home, label: "Type", value: property.property_type },
    { icon: Sofa, label: "Furnishing", value: property.furnishing },
  ];

  return (
    <AppLayout>
      <Link
        to="/properties"
        className="inline-flex items-center gap-2 text-[13px] text-slate-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All homes
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        {/* ------------------------------ left ------------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass relative aspect-16/10 overflow-hidden rounded-3xl">
            <PropertyImage
              src={property.image}
              alt={property.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-[#05060c] to-transparent p-4">
              {property.verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur">
                  <BadgeCheck className="h-3.5 w-3.5" /> VIDEO-VERIFIED
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/15 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" /> 0% BROKERAGE
              </span>
            </div>
          </div>

          <h1 className="mt-7 text-[2rem] leading-tight font-semibold tracking-[-0.03em] text-white">
            {property.title}
          </h1>
          <p className="mt-2.5 flex items-center gap-2 text-[14px] text-slate-400">
            <MapPin className="h-4 w-4" /> {property.location}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {facts.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.02 * i }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="glass rounded-xl p-4 transition-shadow hover:shadow-[0_16px_40px_-14px_rgba(99,102,241,0.5)]"
              >
                <f.icon className="h-4 w-4 text-violet-300" />
                <p className="mt-2.5 text-[11px] tracking-wide text-slate-500 uppercase">
                  {f.label}
                </p>
                <p className="mt-0.5 text-[13.5px] font-semibold text-white">{f.value}</p>
              </motion.div>
            ))}
          </div>

          {property.description && (
            <div className="mt-8">
              <h2 className="text-[16px] font-semibold text-white">About this home</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed whitespace-pre-line text-slate-400">
                {property.description}
              </p>
            </div>
          )}

          <div className="glass mt-8 flex items-center gap-4 rounded-2xl p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#7c3aed,#06b6d4)] text-[15px] font-bold text-white">
              {(property.owner_name ?? "O").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-white">
                <User className="h-3.5 w-3.5 text-slate-500" />
                {property.owner_name ?? "Verified owner"}
              </p>
              <p className="mt-0.5 flex items-center gap-2 truncate text-[12.5px] text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                {property.owner_email ?? "Contact unlocked after booking a visit"}
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25 sm:block">
              Direct contact
            </span>
          </div>

          <ChatBox
            currentUser={user}
            ownerId={listing?.user_id ?? property.user_id}
            listingId={listing?.id ?? property.id}
          />
        </motion.div>

        {/* ------------------------------ right ----------------------------- */}
        <motion.aside
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <WaveCard className="rounded-3xl p-6" glowColor="rgba(124,58,237,0.4)">
            <div className="flex items-baseline gap-2">
              <span className="text-[2.1rem] leading-none font-semibold tracking-[-0.03em] text-white">
                {inr(property.price)}
              </span>
              <span className="text-[13px] text-slate-500">/ month</span>
            </div>
            <p className="mt-2 text-[12.5px] text-emerald-300">
              + ₹0 brokerage · you save {inr(property.price)} today
            </p>

            <div className="my-5 h-px w-full bg-white/8" />

            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-6 text-center"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/30">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-[16px] font-semibold text-white">Visit requested</p>
                  <p className="mt-1.5 text-[13px] text-slate-400">
                    The owner has been notified and typically replies within 8 minutes.
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="w-full rounded-xl bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-3 text-[13.5px] font-semibold text-white ring-1 ring-white/20"
                >
                  View in dashboard
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={onBook} className="flex flex-col gap-4">
                <p className="flex items-center gap-2 text-[13.5px] font-semibold text-white">
                  <CalendarCheck className="h-4 w-4 text-violet-300" /> Book a visit
                </p>

                {bookError && <Alert kind="error">{bookError}</Alert>}

                <Field label="Preferred date">
                  <input
                    type="date"
                    required
                    min={today()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label="Message to owner" hint="optional">
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi! I'd like to see the flat this weekend. Is parking included?"
                    className={inputCls + " resize-none"}
                  />
                </Field>

                <SubmitButton loading={booking}>
                  {user
                    ? booking
                      ? "Sending request"
                      : "Request visit"
                    : "Log in to book"}
                </SubmitButton>

                <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-slate-600">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Requesting a visit is free and non-binding. You'll get the owner's direct
                  contact immediately.
                </p>
              </form>
            )}
          </WaveCard>
        </motion.aside>
      </div>
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
