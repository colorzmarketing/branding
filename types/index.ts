// =============================================
// Colorz CRM — 공통 타입 정의
// =============================================

export type GatheringStatus = "기획중" | "진행중" | "완료";
export type CompanyStatus = "신규접촉" | "협업중" | "재협업검토" | "장기파트너";

// ── 게더링 ──────────────────────────────────
export interface Gathering {
  id: string;
  name: string;
  status: GatheringStatus;
  date: string | null;
  location: string | null;
  target_participants: number | null;
  target_profit: number | null;
  revenue: number;
  cost: number;
  profit_rate: number | null; // Generated column
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GatheringKpi extends Gathering {
  participant_count: number;
  referral_count: number;
  referral_rate: number;
  company_count: number;
}

export type GatheringFormData = Omit<
  Gathering,
  "id" | "profit_rate" | "created_at" | "updated_at"
>;

// ── 협업 기업 ──────────────────────────────
export interface Company {
  id: string;
  name: string;
  industry: string | null;
  contact_name: string | null;
  status: CompanyStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanyFormData = Omit<Company, "id" | "created_at" | "updated_at">;

// ── 참여자 ─────────────────────────────────
export interface Participant {
  id: string;
  name: string;
  school: string | null;
  grade: string | null;
  channel: string | null;
  marketing_consent: boolean;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type ParticipantFormData = Omit<
  Participant,
  "id" | "created_at" | "updated_at"
>;

// ── 중간 테이블 ────────────────────────────
export interface GatheringCompany {
  gathering_id: string;
  company_id: string;
  role: string | null;
  created_at: string;
  company?: Company;
}

export interface GatheringParticipant {
  gathering_id: string;
  participant_id: string;
  referral: boolean;
  referrer_id: string | null;
  created_at: string;
  participant?: Participant;
}

// ── 대시보드 ───────────────────────────────
export interface DashboardSummary {
  total_participants: number;
  total_gatherings: number;
  completed_gatherings: number;
  total_companies: number;
  avg_profit_rate: number | null;
}
