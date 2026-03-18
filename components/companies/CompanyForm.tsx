"use client";

import { useState } from "react";
import type { Company, CompanyFormData, CompanyStatus } from "@/types";

const STATUSES: CompanyStatus[] = ["신규접촉", "협업중", "재협업검토", "장기파트너"];

interface Props {
  initial?: Partial<Company>;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onCancel: () => void;
}

export default function CompanyForm({ initial, onSubmit, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CompanyFormData>({
    name: initial?.name ?? "",
    industry: initial?.industry ?? null,
    contact_name: initial?.contact_name ?? null,
    status: initial?.status ?? "신규접촉",
    notes: initial?.notes ?? null,
  });

  const set = (key: keyof CompanyFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">기업명 *</label>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="예: 브랜드스튜디오A"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">업종</label>
          <input
            value={form.industry ?? ""}
            onChange={(e) => set("industry", e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="예: 브랜딩"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
          <input
            value={form.contact_name ?? ""}
            onChange={(e) => set("contact_name", e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="예: 김담당"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">파이프라인 상태</label>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <label
              key={s}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                form.status === s
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                value={s}
                checked={form.status === s}
                onChange={() => set("status", s)}
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
        <textarea
          rows={3}
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || null)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          취소
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
