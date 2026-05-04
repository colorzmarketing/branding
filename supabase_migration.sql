-- =============================================
-- Colorz CRM — 올인원 플랫폼 마이그레이션
-- Supabase SQL Editor에서 순서대로 실행
-- =============================================

-- ── 1. gatherings 테이블 컬럼 추가 ─────────────

ALTER TABLE gatherings
  ADD COLUMN IF NOT EXISTS round text,
  ADD COLUMN IF NOT EXISTS fee integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pipeline_completed text[] DEFAULT '{}';

-- ── 2. companies 파이프라인 상태 변경 ──────────
-- 기존: 신규접촉 | 협업중 | 재협업검토 | 장기파트너
-- 신규: 미컨택 | 컨택중 | 협의중 | 계약완료 | 종료

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS contact_phone text;

-- status 컬럼 제약 업데이트 (기존 제약이 있으면 먼저 제거)
DO $$
BEGIN
  ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_status_check;
  ALTER TABLE companies ALTER COLUMN status TYPE text;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ── 3. participants 테이블 컬럼 추가 ───────────

ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS birth_year integer,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- ── 4. gathering_participants 참가비 컬럼 추가 ──

ALTER TABLE gathering_participants
  ADD COLUMN IF NOT EXISTS fee_paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS refund_account text,
  ADD COLUMN IF NOT EXISTS refunded boolean DEFAULT false;

-- ── 5. 구매/준비 목록 ──────────────────────────

CREATE TABLE IF NOT EXISTS gathering_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id uuid NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  title text NOT NULL,
  assignee text,
  budget integer,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gathering_tasks_gathering_id
  ON gathering_tasks(gathering_id);

-- ── 6. 회의록 ─────────────────────────────────

CREATE TABLE IF NOT EXISTS gathering_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id uuid NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  meeting_date date,
  attendees text,
  content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gathering_meetings_gathering_id
  ON gathering_meetings(gathering_id);

-- ── 7. SNS 체크리스트 ──────────────────────────

CREATE TABLE IF NOT EXISTS gathering_sns_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id uuid NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('행사 전', '행사 후')),
  item text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gathering_sns_gathering_id
  ON gathering_sns_checklist(gathering_id);

-- 기존 게더링에 SNS 기본 항목 삽입 (선택사항 — 필요시 실행)
-- INSERT INTO gathering_sns_checklist (gathering_id, phase, item)
-- SELECT id, '행사 전', '피드 1 업로드' FROM gatherings
-- UNION ALL
-- SELECT id, '행사 전', '피드 2 업로드' FROM gatherings
-- UNION ALL
-- SELECT id, '행사 전', '릴스 1 업로드' FROM gatherings
-- UNION ALL
-- SELECT id, '행사 후', '후기 피드 1 업로드' FROM gatherings
-- UNION ALL
-- SELECT id, '행사 후', '후기 피드 2 업로드' FROM gatherings;

-- ── 8. Archive ────────────────────────────────

CREATE TABLE IF NOT EXISTS gathering_archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id uuid NOT NULL REFERENCES gatherings(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (
    category IN (
      '홍보/디자인',
      '기획 문서',
      '홍보 채널',
      '설문 폼',
      '행사 사진',
      '랩업 인사이트'
    )
  ),
  title text NOT NULL,
  url text,
  content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gathering_archives_gathering_id
  ON gathering_archives(gathering_id);

CREATE INDEX IF NOT EXISTS idx_gathering_archives_category
  ON gathering_archives(category);

-- ── 9. gathering_kpi 뷰 재생성 ────────────────
-- 기존 뷰에 새 컬럼(round, fee, pipeline_completed)이 반영되도록

DROP VIEW IF EXISTS gathering_kpi;

CREATE VIEW gathering_kpi AS
SELECT
  g.*,
  COALESCE(p.participant_count, 0)::int AS participant_count,
  COALESCE(p.referral_count, 0)::int     AS referral_count,
  CASE
    WHEN COALESCE(p.participant_count, 0) = 0 THEN 0
    ELSE ROUND(
      COALESCE(p.referral_count, 0)::numeric
      / p.participant_count * 100,
      1
    )
  END AS referral_rate,
  COALESCE(c.company_count, 0)::int      AS company_count
FROM gatherings g
LEFT JOIN (
  SELECT
    gathering_id,
    COUNT(*)                          AS participant_count,
    COUNT(*) FILTER (WHERE referral)  AS referral_count
  FROM gathering_participants
  GROUP BY gathering_id
) p ON p.gathering_id = g.id
LEFT JOIN (
  SELECT gathering_id, COUNT(*) AS company_count
  FROM gathering_companies
  GROUP BY gathering_id
) c ON c.gathering_id = g.id;

-- ── 10. RLS 정책 (필요시 활성화) ─────────────
-- 현재 개발 환경에서는 RLS 비활성화 상태로 진행
-- ALTER TABLE gathering_tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gathering_meetings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gathering_sns_checklist ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gathering_archives ENABLE ROW LEVEL SECURITY;
