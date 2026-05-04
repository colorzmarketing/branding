"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CompanyFormData } from "@/types";

export async function getCompanies() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCompany(formData: CompanyFormData) {
  const supabase = createClient();
  const { error } = await supabase.from("companies").insert(formData);
  if (error) throw error;
  revalidatePath("/companies");
  revalidatePath("/");
}

export async function updateCompany(id: string, formData: Partial<CompanyFormData>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("companies")
    .update(formData)
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/companies");
}

export async function deleteCompany(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/companies");
  revalidatePath("/");
}

// 기업별 협업 게더링 목록 (company_id → gathering 정보 배열)
export async function getCompanyGatheringMap(): Promise<
  Record<string, { id: string; name: string; status: string; date: string | null; role: string | null }[]>
> {
  const supabase = createClient();

  const { data: gcData, error: gcError } = await supabase
    .from("gathering_companies")
    .select("company_id, gathering_id, role");
  if (gcError) throw gcError;
  if (!gcData || gcData.length === 0) return {};

  const gatheringIds = Array.from(new Set(gcData.map((r) => r.gathering_id)));
  const { data: gData, error: gError } = await supabase
    .from("gatherings")
    .select("id, name, status, date")
    .in("id", gatheringIds);
  if (gError) throw gError;

  const gMap = Object.fromEntries((gData ?? []).map((g) => [g.id, g]));

  const result: Record<string, { id: string; name: string; status: string; date: string | null; role: string | null }[]> = {};
  for (const gc of gcData) {
    const g = gMap[gc.gathering_id];
    if (!g) continue;
    if (!result[gc.company_id]) result[gc.company_id] = [];
    result[gc.company_id].push({ ...g, role: gc.role });
  }
  return result;
}
