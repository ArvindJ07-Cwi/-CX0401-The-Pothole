// ── User roles ──────────────────────────────────────────────────────────────
export type UserRole = 'citizen' | 'authority' | 'contractor';

// ── Complaint status lifecycle ───────────────────────────────────────────────
export type ComplaintStatus =
  | 'pending'       // citizen submitted, not yet assigned
  | 'assigned'      // authority assigned a contractor
  | 'in_progress'   // contractor acknowledged
  | 'submitted'     // contractor submitted repair evidence
  | 'verified'      // AI + authority confirmed
  | 'flagged'       // mismatch / needs manual review
  | 'rejected';     // invalid complaint

// ── Severity ─────────────────────────────────────────────────────────────────
export type Severity = 'low' | 'medium' | 'high' | 'critical';

// ── Location ─────────────────────────────────────────────────────────────────
export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeographicArea {
  id: number;
  name: string;
  level: 'state' | 'region' | 'city' | 'locality';
  parent_id: number | null;
  full_path: string;
}

export interface Complaint {
  id: string;
  referenceNo: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: LatLng;
    ward?: string;
  };
  severity: Severity;
  status: ComplaintStatus;
  reportedBy: string;         // citizen name / id
  reportedAt: string;         // ISO date string
  assignedTo?: string;        // contractor id
  contractorName?: string;
  contractorEmail?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  repairNote?: string;
  locationArea?: GeographicArea;
  verificationResult?: VerificationResult;
  updatedAt: string;
}

// ── AI Verification ───────────────────────────────────────────────────────────
export type VerificationOutcome = 'verified' | 'flagged' | 'inconclusive';

export interface VerificationCheck {
  label: string;
  passed: boolean;
  detail?: string;
}

export interface VerificationResult {
  outcome: VerificationOutcome;
  confidence: number;           // 0–100
  checks: VerificationCheck[];
  flagReason?: string;
  reviewedAt?: string;
}

// ── Contractor ────────────────────────────────────────────────────────────────
export interface Contractor {
  id: string;
  name: string;
  email: string;
  role: string;
  serviceAreas: GeographicArea[];
}

// ── Stats summary (for dashboards) ───────────────────────────────────────────
export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  verified: number;
  flagged: number;
}
