"use client";

import { useState } from "react";
import Link from "next/link";
import type { GatheringKpi, GatheringFormData } from "@/types";
import { GatheringBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import GatheringForm from "./GatheringForm";
import GatheringCsvImport from "./GatheringCsvImport";
import { createGathering, deleteGathering } from "@/lib/actions/gatherings";
import { useRouter } from "next/navigation";

interface Props {
  gatherings: GatheringKpi[];
}

export default function GatheringList({ gatherings }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);

  async function handleCreate(data: GatheringFormData) {
    await createGathering(data);
    setShowCreate(false);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}"을(를) 삭제할까요?`)) return;
    await deleteGathering(id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">게더링 목록</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {gatherings.length}개</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCsvImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            📂 CSV 가져오기
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            + 게더링 추가
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs bg-gray-50">
                <th className="px-6 py-3 text-left font-medium">게더링명</th>
                <th className="px-6 py-3 text-left font-medium">상태</th>
                <th className="px-6 py-3 text-left font-medium">날짜</th>
                <th className="px-6 py-3 text-left font-medium">장소</th>
                <th className="px-6 py-3 text-right font-medium">참여자</th>
                <th className="px-6 py-3 text-right font-medium">추천비율</th>
                <th className="px-6 py-3 text-right font-medium">수익률</th>
                <th className="px-6 py-3 text-right font-medium">협업기업</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gatherings.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-400">
                    등록된 게더링이 없습니다.
                  </td>
                </tr>
              )}
              {gatherings.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-3">
                    <Link
                      href={`/gatherings/${g.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {g.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <GatheringBadge status={g.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-500">{g.date ?? "-"}</td>
                  <td className="px-6 py-3 text-gray-500">{g.location ?? "-"}</td>
                  <td className="px-6 py-3 text-right text-gray-700">{g.participant_count}명</td>
                  <td className="px-6 py-3 text-right text-gray-700">{g.referral_rate}%</td>
                  <td className="px-6 py-3 text-right">
                    {g.profit_rate != null ? (
                      <span className={g.profit_rate >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                        {g.profit_rate}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-700">{g.company_count}개</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(g.id, g.name)}
                      className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <Modal title="게더링 추가" onClose={() => setShowCreate(false)}>
          <GatheringForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      )}

      {showCsvImport && (
        <Modal title="CSV로 게더링 가져오기" onClose={() => setShowCsvImport(false)}>
          <GatheringCsvImport onClose={() => setShowCsvImport(false)} />
        </Modal>
      )}
    </div>
  );
}
