import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  IndianRupee,
  Info,
  MapPin,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { listings as listingsApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Alert,
  AppLayout,
  Field,
  SubmitButton,
  inputCls,
} from "../components/app/Shell";

const TYPES = ["Apartment", "Independent House", "Villa", "Studio", "PG / Shared"];
const FURNISHINGS = ["Unfurnished", "Semi-furnished", "Fully furnished"];
const MAX_MB = 8;

export default function AddPropertyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [area, setArea] = useState("");
  const [propertyType, setPropertyType] = useState(TYPES[0]);
  const [furnishing, setFurnishing] = useState(FURNISHINGS[1]);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file (JPG or PNG).");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Image is too large. Keep it under ${MAX_MB} MB.`);
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    const res = await listingsApi.create(
      {
        title,
        price: Number(price),
        location,
        description,
        bedrooms,
        bathrooms,
        area: area ? Number(area) : null,
        property_type: propertyType,
        furnishing,
        imageFile: file,
      },
      user,
    );

    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSaved(true);
    setTimeout(() => navigate(`/verification/${res.data!.id}`), 900);
  }

  return (
    <AppLayout>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-[13px] text-slate-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="mx-auto mt-6 max-w-3xl">
        <h1 className="text-[2.2rem] leading-tight font-semibold tracking-[-0.03em] text-white">
          List your property
        </h1>
        <p className="mt-2 text-[14px] text-slate-400">
          Takes about 9 minutes. You keep 100% of the rent — we never take a commission.
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-6">
          {error && <Alert kind="error">{error}</Alert>}
          {saved && (
            <Alert kind="success">
              Property published. Redirecting to your listing…
            </Alert>
          )}

          {/* ---------------------------- image ---------------------------- */}
          <section className="glass rounded-2xl p-6">
            <h2 className="text-[15px] font-semibold text-white">Cover photo</h2>
            <p className="mt-1 text-[12.5px] text-slate-500">
              One clear, well-lit photo of the main room. We compress it automatically.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />

            {preview ? (
              <div className="relative mt-4 aspect-16/9 overflow-hidden rounded-xl ring-1 ring-white/10">
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent p-3">
                  <span className="flex items-center gap-1.5 text-[12px] text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ready to upload
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-[12px] font-medium text-white ring-1 ring-white/15 hover:bg-rose-500/25"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`mt-4 flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 transition-colors ${
                  dragging
                    ? "border-violet-400/60 bg-violet-500/8"
                    : "border-white/12 hover:border-violet-400/40 hover:bg-white/3"
                }`}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/6 text-violet-300">
                  {dragging ? (
                    <UploadCloud className="h-5 w-5" />
                  ) : (
                    <ImagePlus className="h-5 w-5" />
                  )}
                </span>
                <span className="text-[13.5px] font-medium text-white">
                  Drop an image here, or click to browse
                </span>
                <span className="text-[11.5px] text-slate-600">
                  JPG or PNG · up to {MAX_MB} MB
                </span>
              </button>
            )}
          </section>

          {/* ---------------------------- basics --------------------------- */}
          <section className="glass flex flex-col gap-5 rounded-2xl p-6">
            <h2 className="text-[15px] font-semibold text-white">The basics</h2>

            <Field label="Listing title">
              <input
                required
                maxLength={90}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Light-filled 2BHK with open kitchen"
                className={inputCls}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Monthly rent (₹)">
                <div className="relative">
                  <IndianRupee className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-600" />
                  <input
                    required
                    type="number"
                    min={1000}
                    step={500}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="38000"
                    className={inputCls + " pl-10"}
                  />
                </div>
              </Field>

              <Field label="Location">
                <div className="relative">
                  <MapPin className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-600" />
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Koramangala 5th Block, Bengaluru"
                    className={inputCls + " pl-10"}
                  />
                </div>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Bedrooms">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(+e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Bathrooms">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(+e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Area (sqft)" hint="optional">
                <input
                  type="number"
                  min={100}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="1180"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Property type">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className={inputCls}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0b0d18]">
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Furnishing">
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className={inputCls}
                >
                  {FURNISHINGS.map((t) => (
                    <option key={t} value={t} className="bg-[#0b0d18]">
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Description" hint="optional but converts far better">
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Corner unit on the 7th floor with a wide balcony and covered parking. 18 minutes to Embassy Tech Village. Cauvery + borewell water…"
                className={inputCls + " resize-none"}
              />
            </Field>
          </section>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <SubmitButton loading={saving} className="sm:flex-1">
              {saving ? "Publishing" : "Publish listing"}
            </SubmitButton>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2 text-[11.5px] leading-relaxed text-slate-600 sm:flex-1"
            >
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Your listing goes live immediately and enters the verification queue. Median
              approval time is 4h 12m.
            </motion.p>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

