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
