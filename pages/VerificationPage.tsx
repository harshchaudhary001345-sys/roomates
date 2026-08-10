import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { listings } from "../lib/api";
import type { Listing } from "../lib/types";
import { AppLayout, Alert, PageLoader } from "../components/app/Shell";
import VerificationPipeline from "../components/app/VerificationPipeline";

export default function VerificationPage() {
  const { id = "" } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await listings.byId(id);
      if (!alive) return;
      if (res.error) setError(res.error);
      else setListing(res.data);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <AppLayout>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-[13px] text-slate-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <div className="mt-6">
        {loading ? (
          <PageLoader label="Loading verification" />
        ) : error || !listing ? (
          <Alert kind="error">{error ?? "Listing not found."}</Alert>
        ) : (
          <VerificationPipeline listing={listing} onUpdated={setListing} />
        )}
      </div>
    </AppLayout>
  );
}
