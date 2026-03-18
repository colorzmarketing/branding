"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ParticipantFormData } from "@/types";

export async function getParticipants(filters?: {
  referral?: boolean;
  marketing_consent?: boolean;
  gathering_id?: string;
}) {
  const supabase = createClient();

  if (filters?.gathering_id) {
    // 특정 게더링 참여자 조회
    let query = supabase
      .from("gathering_participants")
      .select("*, participant:participants(*)")
      .eq("gathering_id", filters.gathering_id);

    if (filters.referral !== undefined) {
      query = query.eq("referral", filters.referral);
    }

    const { data, error } = await query;
    if (error) throw error;

    let rows = (data ?? []).map((r) => ({ ...r.participant, referral: r.referral }));
    if (filters.marketing_consent !== undefined) {
      rows = rows.filter((p) => p.marketing_consent === filters.marketing_consent);
    }
    return rows;
  }

  // 전체 참여자 조회
  let query = supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.marketing_consent !== undefined) {
    query = query.eq("marketing_consent", filters.marketing_consent);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createParticipant(formData: ParticipantFormData) {
  // 비동의자는 이메일/연락처 저장 불가
  const sanitized = { ...formData };
  if (!sanitized.marketing_consent) {
    sanitized.email = null;
    sanitized.phone = null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("participants")
    .insert(sanitized)
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/participants");
  return data.id as string;
}

export async function updateParticipant(id: string, formData: Partial<ParticipantFormData>) {
  const sanitized = { ...formData };
  if (sanitized.marketing_consent === false) {
    sanitized.email = null;
    sanitized.phone = null;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("participants")
    .update(sanitized)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/participants");
}

export async function deleteParticipant(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("participants").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/participants");
}

export async function addParticipantToGathering(
  gatheringId: string,
  participantId: string,
  referral: boolean,
  referrerId?: string
) {
  const supabase = createClient();
  const { error } = await supabase.from("gathering_participants").insert({
    gathering_id: gatheringId,
    participant_id: participantId,
    referral,
    referrer_id: referrerId ?? null,
  });
  if (error) throw error;
  revalidatePath(`/gatherings/${gatheringId}`);
}

export async function getDashboardSummary() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dashboard_summary")
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
