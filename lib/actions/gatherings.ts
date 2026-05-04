"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  GatheringFormData,
  GatheringTaskFormData,
  GatheringMeetingFormData,
  GatheringArchiveFormData,
} from "@/types";

// ── 게더링 CRUD ────────────────────────────────

export async function getGatherings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gathering_kpi")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getGathering(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gathering_kpi")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createGathering(formData: GatheringFormData) {
  const supabase = createClient();
  const { error } = await supabase.from("gatherings").insert(formData);
  if (error) throw error;
  revalidatePath("/gatherings");
  revalidatePath("/");
}

export async function updateGathering(id: string, formData: Partial<GatheringFormData>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gatherings")
    .update(formData)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/gatherings");
  revalidatePath(`/gatherings/${id}`);
  revalidatePath("/");
}

export async function deleteGathering(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("gatherings").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/gatherings");
  revalidatePath("/");
}

// ── 파이프라인 ─────────────────────────────────

export async function updatePipeline(id: string, completedStages: string[]) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gatherings")
    .update({ pipeline_completed: completedStages })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/gatherings/${id}`);
}

// ── 협업기업 ───────────────────────────────────

export async function getGatheringCompanies(gatheringId: string) {
  const supabase = createClient();

  const { data: gcData, error: gcError } = await supabase
    .from("gathering_companies")
    .select("*")
    .eq("gathering_id", gatheringId);
  if (gcError) throw gcError;
  if (!gcData || gcData.length === 0) return [];

  const companyIds = gcData.map((gc) => gc.company_id);
  const { data: cData, error: cError } = await supabase
    .from("companies")
    .select("*")
    .in("id", companyIds);
  if (cError) throw cError;

  return gcData.map((gc) => ({
    ...gc,
    company: (cData ?? []).find((c) => c.id === gc.company_id) ?? null,
  }));
}

export async function addCompanyToGathering(
  gatheringId: string,
  companyId: string,
  role: string | null
) {
  const supabase = createClient();
  const { error } = await supabase.from("gathering_companies").insert({
    gathering_id: gatheringId,
    company_id: companyId,
    role: role || null,
  });
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
  revalidatePath("/companies");
}

export async function removeCompanyFromGathering(
  gatheringId: string,
  companyId: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gathering_companies")
    .delete()
    .eq("gathering_id", gatheringId)
    .eq("company_id", companyId);
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
  revalidatePath("/companies");
}

// ── 참여자 ────────────────────────────────────

export async function getGatheringParticipants(gatheringId: string) {
  const supabase = createClient();

  const { data: gpData, error: gpError } = await supabase
    .from("gathering_participants")
    .select("*")
    .eq("gathering_id", gatheringId);
  if (gpError) throw gpError;
  if (!gpData || gpData.length === 0) return [];

  const participantIds = gpData.map((gp) => gp.participant_id);
  const { data: pData, error: pError } = await supabase
    .from("participants")
    .select("*")
    .in("id", participantIds);
  if (pError) throw pError;

  return gpData.map((gp) => ({
    ...gp,
    fee_paid: gp.fee_paid ?? false,
    refund_account: gp.refund_account ?? null,
    refunded: gp.refunded ?? false,
    participant: (pData ?? []).find((p) => p.id === gp.participant_id) ?? null,
  }));
}

export async function updateParticipantFee(
  gatheringId: string,
  participantId: string,
  data: { fee_paid?: boolean; refund_account?: string | null; refunded?: boolean }
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gathering_participants")
    .update(data)
    .eq("gathering_id", gatheringId)
    .eq("participant_id", participantId);
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

// ── 구매/준비 목록 ─────────────────────────────

export async function getGatheringTasks(gatheringId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gathering_tasks")
    .select("*")
    .eq("gathering_id", gatheringId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createGatheringTask(formData: GatheringTaskFormData) {
  const supabase = createClient();
  const { error } = await supabase.from("gathering_tasks").insert(formData);
  if (error) throw error;
  revalidatePath(`/gatherings/${formData.gathering_id}`);
}

export async function updateGatheringTask(
  id: string,
  gatheringId: string,
  data: Partial<GatheringTaskFormData>
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gathering_tasks")
    .update(data)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function deleteGatheringTask(id: string, gatheringId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("gathering_tasks").delete().eq("id", id);
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

// ── 회의록 ────────────────────────────────────

export async function getGatheringMeetings(gatheringId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gathering_meetings")
    .select("*")
    .eq("gathering_id", gatheringId)
    .order("meeting_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createGatheringMeeting(formData: GatheringMeetingFormData) {
  const supabase = createClient();
  const { error } = await supabase.from("gathering_meetings").insert(formData);
  if (error) throw error;
  revalidatePath(`/gatherings/${formData.gathering_id}`);
}

export async function updateGatheringMeeting(
  id: string,
  gatheringId: string,
  data: Partial<GatheringMeetingFormData>
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gathering_meetings")
    .update(data)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function deleteGatheringMeeting(id: string, gatheringId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gathering_meetings")
    .delete()
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

// ── SNS 체크리스트 ─────────────────────────────

export async function getGatheringSnsChecklist(gatheringId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gathering_sns_checklist")
    .select("*")
    .eq("gathering_id", gatheringId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function initSnsChecklist(gatheringId: string) {
  const supabase = createClient();
  const defaults = [
    { phase: "행사 전", item: "피드 1 업로드" },
    { phase: "행사 전", item: "피드 2 업로드" },
    { phase: "행사 전", item: "릴스 1 업로드" },
    { phase: "행사 후", item: "후기 피드 1 업로드" },
    { phase: "행사 후", item: "후기 피드 2 업로드" },
  ];
  const { error } = await supabase.from("gathering_sns_checklist").insert(
    defaults.map((d) => ({ ...d, gathering_id: gatheringId, completed: false }))
  );
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function toggleSnsItem(id: string, gatheringId: string, completed: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gathering_sns_checklist")
    .update({ completed })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function addSnsItem(
  gatheringId: string,
  phase: "행사 전" | "행사 후",
  item: string
) {
  const supabase = createClient();
  const { error } = await supabase.from("gathering_sns_checklist").insert({
    gathering_id: gatheringId,
    phase,
    item,
    completed: false,
  });
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function deleteSnsItem(id: string, gatheringId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gathering_sns_checklist")
    .delete()
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

// ── Archive ───────────────────────────────────

export async function getGatheringArchives(gatheringId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gathering_archives")
    .select("*")
    .eq("gathering_id", gatheringId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createGatheringArchive(formData: GatheringArchiveFormData) {
  const supabase = createClient();
  const { error } = await supabase.from("gathering_archives").insert(formData);
  if (error) throw error;
  revalidatePath(`/gatherings/${formData.gathering_id}`);
}

export async function deleteGatheringArchive(id: string, gatheringId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("gathering_archives")
    .delete()
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}
