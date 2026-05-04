"use client";

import { useState, useTransition } from "react";
import type { GatheringKpi, GatheringParticipant } from "@/types";
import { removeParticipantFromGathering } from "@/lib/actions/participants";

interface Props {
  gathering: GatheringKpi;
  participants: GatheringParticipant[];
  onAdd: () => void;
  onRefresh: () => void;
}

export default function MembersTab({ gathering, participants, onAdd, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const filtered = participants.filter((gp) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (gp.participant?.name ?? "").toLowerCase().includes(q) ||
      (gp.participant?.school ?? "").toLowerCase().includes(q) ||
      (gp.participant?.student_id ?? "").toLowerCase().includes(q)
    );
  });

  function handleRemove(participantId: string, name: string) {
    if (!confirm(`"${name}"을(를) 이 게더링에서 제거할까요?`)) return;
    startTransition(async () => {
      await removeParticipantFromGathering(gathering.id, participantId);
      onRefresh();
    });
  }

  const paidCount = participants.filter((gp) => gp.fee_paid).length;
  const marketingCount = participants.filter(
    (gp) => gp.participant?.marketing_consent
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">
            참여 멤버
            <span className="ml-1.5 text-sm font-normal text-gray-400">
              {gathering.participant_count}명
            </span>
          </h2>
          {participants.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              추천유입 {gathering.referral_count}명 · 마케팅동의 {marketingCount}명 ·
              참가비납부 {paidCount}명
            </p>
          )}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
        >
          + 추가
        </button>
      </div>

      <div className="px-5 py-2 border-b border-gray-50">
        <input
          type="text"
          placeholder="이름, 학교, 학번 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 text-gray-400 text-xs">
              <th className="px-4 py-2 text-left font-medium">이름</th>
              <th className="px-4 py-2 text-left font-medium">학교</th>
              <th className="px-4 py-2 text-left font-medium">학번</th>
              <th className="px-4 py-2 text-left font-medium">유입경로</th>
              <th className="px-4 py-2 text-center font-medium">추천</th>
              <th className="px-4 py-2 text-center font-medium">참가비</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {participants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-xs">
                  아직 참여자가 없습니다.
                </td>
              </tr>
            )}
            {filtered.length === 0 && participants.length > 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400 text-xs">
                  검색 결과 없음
                </td>
              </tr>
            )}
            {filtered.map((gp) => (
              <tr key={gp.participant_id} className="hover:bg-gray-50 group">
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {gp.participant?.name ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">
                  {gp.participant?.school ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-gray-400 text-xs">
                  {gp.participant?.student_id ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">
                  {gp.participant?.channel ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {gp.referral && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                      추천
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      gp.fee_paid
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {gp.fee_paid ? "납부" : "미납"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() =>
                      handleRemove(gp.participant_id, gp.participant?.name ?? "")
                    }
                    className="text-xs text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    제거
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
