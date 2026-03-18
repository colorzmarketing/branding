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
  const { data, error } = await supabase
    .from("gathering_companies")
    .select("*, company:companies(*)")
    .eq("gathering_id", gatheringId);
  if (error) throw error;
  return data ?? [];
}

export async function getGatheringParticipants(gatheringId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gathering_participants")
    .select("*, participant:participants(*)")
    .eq("gathering_id", gatheringId);
  if (error) throw error;
  return data ?? [];
}
