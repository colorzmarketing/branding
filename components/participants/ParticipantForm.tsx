"use client";

import { useState } from "react";
import type { Participant, ParticipantFormData } from "@/types";

interface Props {
  initial?: Partial<Participant>;
  onSubmit: (data: ParticipantFormData) => Promise<void>;
  onCancel: () => void;
}

const CHANNELS = ["인스타그램", "지인추천", "에브리타임", "페이스북", "기타"];

export default function ParticipantForm({ initial, onSubmit, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ParticipantFormData>({
    name: initial?.name ?? "",
    school: initial?.school ?? null,
    grade: initial?.grade ?? null,
    channel: initial?.channel ?? null,
    marketing_consent: initial?.marketing_consent ?? false,
    email: initial?.email ?? null,
    phone: initial?.phone ?? null,
  });

  const set = (key: keyof ParticipantFormData, value: unknown) =>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="예: 홍길동"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학교</label>
          <input
            value={form.school ?? ""}
            onChange={(e) => set("school", e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="예: 연세대"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
          <input
            value={form.grade ?? ""}
            onChange={(e) => set("grade", e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="예: 3학년"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">유입 경로</label>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((ch) => (
            <label
              key={ch}
              className={`px-3 py-1.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                form.channel === ch
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                value={ch}
                checked={form.channel === ch}
                onChange={() => set("channel", ch)}
              />
              {ch}
            </label>
          ))}
        </div>
      </div>

      {/* 마케팅 수신 동의 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.marketing_consent}
            onChange={(e) => {
              const checked = e.target.checked;
              setForm((f) => ({
                ...f,
                marketing_consent: checked,
                email: checked ? f.email : null,
                phone: checked ? f.phone : null,
              }));
            }}
            className="w-4 h-4 rounded accent-indigo-600"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">마케팅 수신 동의</p>
            <p className="text-xs text-gray-500">동의 시에만 이메일/연락처를 저장합니다</p>
          </div>
        </label>

        {form.marketing_consent && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">이메일</label>
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">전화번호</label>
              <input
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="010-0000-0000"
              />
            </div>
          </div>
        )}
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
