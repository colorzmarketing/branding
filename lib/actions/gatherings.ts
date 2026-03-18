"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { GatheringFormData } from "@/types";

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
  revalidatePath("/");
}

export async function deleteGathering(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("gatherings").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/gatherings");
  revalidatePath("/");
}

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
    participant: (pData ?? []).find((p) => p.id === gp.participant_id) ?? null,
  }));
}
