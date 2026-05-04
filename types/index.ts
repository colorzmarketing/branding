// =============================================
// Colorz CRM — 공통 타입 정의
// =============================================

export type GatheringStatus = "기획중" | "진행중" | "완료";
export type CompanyStatus = "미컨택" | "컨택중" | "협의중" | "계약완료" | "종료";

export const PIPELINE_STAGES = [
  "기획",
  "컨택/섭외",
  "수요조사",
  "신청접수",
  "행사진행",
  "만족도조사",
  "랩업",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

// ── 게더링 ──────────────────────────────────
export interface Gathering {
  id: string;
  name: string;
  status: GatheringStatus;
  date: string | null;
  location: string | null;
  round: string | null;
  target_participants: number | null;
  target_profit: number | null;
  revenue: number;
  cost: number;
  fee: number | null;
  profit_rate: number | null;
  pipeline_completed: string[] | null;
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

// ── 협력업체 ──────────────────────────────
export interface Company {
  id: string;
  name: string;
  industry: string | null;
  contact_name: string | null;
  contact_phone: string | null;
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
  gender: string | null;
  birth_year: number | null;
  school: string | null;
  student_id: string | null;
  grade: string | null;
  channel: string | null;
  tags: string[] | null;
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
  fee_paid: boolean;
  refund_account: string | null;
  refunded: boolean;
  created_at: string;
  participant?: Participant;
}

// ── 구매/준비 목록 ─────────────────────────
export interface GatheringTask {
  id: string;
  gathering_id: string;
  title: string;
  assignee: string | null;
  budget: number | null;
  completed: boolean;
  created_at: string;
}

export type GatheringTaskFormData = Omit<GatheringTask, "id" | "created_at">;

// ── 회의록 ────────────────────────────────
export interface GatheringMeeting {
  id: string;
  gathering_id: string;
  meeting_date: string | null;
  attendees: string | null;
  content: string | null;
  created_at: string;
}

export type GatheringMeetingFormData = Omit<GatheringMeeting, "id" | "created_at">;

// ── SNS 체크리스트 ─────────────────────────
export interface GatheringSnsItem {
  id: string;
  gathering_id: string;
  phase: "행사 전" | "행사 후";
  item: string;
  completed: boolean;
  created_at: string;
}

// ── Archive ───────────────────────────────
export type ArchiveCategory =
  | "홍보/디자인"
  | "기획 문서"
  | "홍보 채널"
  | "설문 폼"
  | "행사 사진"
  | "랩업 인사이트";

export interface GatheringArchive {
  id: string;
  gathering_id: string;
  category: ArchiveCategory;
  title: string;
  url: string | null;
  content: string | null;
  created_at: string;
}

export type GatheringArchiveFormData = Omit<GatheringArchive, "id" | "created_at">;

// ── 대시보드 ───────────────────────────────
export interface DashboardSummary {
  total_participants: number;
  total_gatherings: number;
  completed_gatherings: number;
  total_companies: number;
  avg_profit_rate: number | null;
}
