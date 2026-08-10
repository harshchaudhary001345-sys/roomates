export type Profile = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "tenant";
  avatar_url?: string | null;
  phone?: string | null;
  created_at: string;
};

export type Property = {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string | null;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  property_type: string;
  furnishing: string;
  available: boolean;
  verified: boolean;
  user_id: string;
  created_at: string;
  /** joined */
  owner_name?: string | null;
  owner_email?: string | null;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  property_id: string;
  user_id: string;
  date: string;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  /** joined */
  property?: Property | null;
};

export type NewProperty = {
  title: string;
  price: number;
  location: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  property_type: string;
  furnishing: string;
  imageFile?: File | null;
};

/* ==========================================================================
 *  VERIFICATION PIPELINE
 * ========================================================================== */

/** Ordered verification steps. `step0` is the created-but-unstarted listing. */
export const VERIFICATION_STEPS = [
  "step1", // Owner signs up
  "step2", // Govt ID + face match
  "step3", // Ownership document check
  "step4", // 90s video walkthrough
  "step5", // Human review
  "step6", // Badge issued
] as const;

export type VerificationStep = (typeof VERIFICATION_STEPS)[number];

export const STEP_META: Record<
  VerificationStep,
  { label: string; description: string; kind: "auto" | "upload" | "review" }
> = {
  step1: {
    label: "Owner signs up",
    description: "Your account is created and identity session starts.",
    kind: "auto",
  },
  step2: {
    label: "Govt ID + face match",
    description: "Upload a government ID and complete a liveness selfie.",
    kind: "upload",
  },
  step3: {
    label: "Ownership document check",
    description: "Upload sale deed, khata, or latest utility bill.",
    kind: "upload",
  },
  step4: {
    label: "90s video walkthrough",
    description: "Record a continuous in-app video tour of the property.",
    kind: "upload",
  },
  step5: {
    label: "Human review",
    description: "A verification specialist reviews your submission.",
    kind: "review",
  },
  step6: {
    label: "Badge issued",
    description: "Verified badge is published on your listing.",
    kind: "auto",
  },
};

export type Listing = {
  id: string;
  user_id: string;
  owner_id?: string;
  title: string;
  location: string;
  price: number;
  image: string | null;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  property_type: string;
  furnishing: string;
  status: "draft" | "pending_review" | "approved" | "rejected";
  payment_status: "unpaid" | "paid";
  tier: PlanTier;
  transaction_id: string | null;
  verification_status: VerificationStep;
  id_doc_url: string | null;
  ownership_doc_url: string | null;
  video_url: string | null;
  face_match_url: string | null;
  face_match_passed: boolean;
  review_note: string | null;
  created_at: string;
  updated_at: string;
};

/* ==========================================================================
 *  PAYMENTS — Razorpay listing fee
 * ========================================================================== */

export type PlanTier = "basic" | "premium";

export type Transaction = {
  id: string;
  user_id: string;
  listing_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number; // paise
  currency: string; // "INR"
  tier: PlanTier;
  status: "created" | "paid" | "failed";
  created_at: string;
  paid_at: string | null;
};

/** Plans shown on the listing-payment screen. */
export const PLANS: Record<
  PlanTier,
  { label: string; amount: number; perks: string[]; highlight?: boolean }
> = {
  basic: {
    label: "Basic listing",
    amount: 49900, // paise → ₹499
    perks: ["90-day live listing", "Verified badge", "Tenant chat", "Zero commission"],
  },
  premium: {
    label: "Premium listing",
    amount: 149900, // paise → ₹1,499
    perks: [
      "Everything in Basic",
      "Featured placement",
      "Priority in search",
      "14-day no-enquiry refund",
    ],
    highlight: true,
  },
};

/** One row of the verification audit trail. */
export type StepRecord = {
  id: string;
  listing_id: string;
  step: VerificationStep;
  status: "completed" | "pending" | "failed";
  note: string | null;
  actor: string; // 'owner' | 'admin' | 'system'
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string | null;
  text: string;
  read_at: string | null;
  created_at: string;
  sender_name?: string | null;
};

/** One conversation thread, summarised for the inbox list. */
export type Conversation = {
  peerId: string;
  peerName: string;
  listingId: string | null;
  listingTitle: string;
  lastText: string;
  lastAt: string;
  unread: number;
};

export type ApiResult<T> = { data: T | null; error: string | null };
