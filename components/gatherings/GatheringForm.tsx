"use client";

import { useState } from "react";
import type { Gathering, GatheringFormData, GatheringStatus } from "@/types";

const STATUSES: GatheringStatus[] = ["기획중", "진행중", "완료"];

interface Props {
  initial?: Partial<Gathering>;
  onSubmit: (data: GatheringFormData) => Promise<void>;
  onCancel: () => void;
}

export default function GatheringForm({ initial, onSubmit, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<GatheringFormData>({
    name: initial?.name ?? "",
    status: initial?.status ?? "기획중",
    date: initial?.date ?? null,
    location: initial?.location ?? null,
    target_participants: initial?.target_participants ?? null,
    target_profit: initial?.target_profit ?? null,
    revenue: initial?.revenue ?? 0,
    cost: initial?.cost ?? 0,
    notes: initial?.notes ?? null,
  });

  const set = (key: keyof GatheringFormData, value: unknown) =>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">게더링명 *</label>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="예: Colorz 5th 게더링"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as GatheringStatus)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
          <input
            type="date"
            value={form.date ?? ""}
            onChange={(e) => set("date", e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
        <input
          value={form.location ?? ""}
          onChange={(e) => set("location", e.target.value || null)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="예: 홍대 카페"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">목표 참여자 수</label>
          <input
            type="number"
            min={0}
            value={form.target_participants ?? ""}
            onChange={(e) => set("target_participants", e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">목표 수익 (원)</label>
          <input
            type="number"
            min={0}
            value={form.target_profit ?? ""}
            onChange={(e) => set("target_profit", e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">실제 수익 (원)</label>
          <input
            type="number"
            min={0}
            value={form.revenue}
            onChange={(e) => set("revenue", Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비용 (원)</label>
          <input
            type="number"
            min={0}
            value={form.cost}
            onChange={(e) => set("cost", Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
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
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
