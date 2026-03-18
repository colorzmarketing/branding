"use client";

import { useState, useEffect, useTransition } from "react";
import type { Participant } from "@/types";
import { getParticipants } from "@/lib/actions/participants";
import { addParticipantToGathering } from "@/lib/actions/participants";

interface Props {
  gatheringId: string;
  alreadyIds: string[];   // 이미 참여 중인 participant_id 목록
  onClose: () => void;
  onAdded: () => void;
}

export default function AddParticipantModal({ gatheringId, alreadyIds, onClose, onAdded }: Props) {
  const [all, setAll] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [referral, setReferral] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getParticipants().then((data) => {
      setAll(data as Participant[]);
      setLoading(false);
    });
  }, []);

  const filtered = all.filter((p) => {
    if (alreadyIds.includes(p.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.school ?? "").toLowerCase().includes(q) ||
      (p.student_id ?? "").toLowerCase().includes(q)
    );
  });

  async function handleAdd() {
    if (!selected) return;
    startTransition(async () => {
      await addParticipantToGathering(gatheringId, selected, referral);
      onAdded();
      onClose();
    });
  }

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <input
        type="text"
        placeholder="이름, 학교, 학번으로 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        autoFocus
      />

      {/* 참여자 목록 */}
      <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-60">
        {loading && (
          <p className="text-sm text-gray-400 text-center py-6">불러오는 중...</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            {search ? "검색 결과 없음" : "추가 가능한 참여자가 없습니다."}
          </p>
        )}
        {filtered.map((p) => (
          <label
            key={p.id}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors ${
              selected === p.id ? "bg-indigo-50" : "hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              className="accent-indigo-600"
              checked={selected === p.id}
              onChange={() => setSelected(p.id)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-400">
                {[p.school, p.student_id, p.grade].filter(Boolean).join(" · ") || "정보 없음"}
              </p>
            </div>
            {p.channel && (
              <span className="text-xs text-gray-400 shrink-0">{p.channel}</span>
            )}
          </label>
        ))}
      </div>

      {/* 추천 유입 여부 */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={referral}
          onChange={(e) => setReferral(e.target.checked)}
          className="w-4 h-4 rounded accent-indigo-600"
        />
        <span className="text-sm text-gray-700">추천 유입으로 등록</span>
      </label>

      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleAdd}
          disabled={!selected || isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
        >
          {isPending ? "추가 중..." : "참여자 추가"}
        </button>
      </div>
    </div>
  );
}
