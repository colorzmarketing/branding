"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GatheringKpi, GatheringCompany, GatheringParticipant, GatheringFormData } from "@/types";
import { GatheringBadge } from "@/components/ui/Badge";
import KpiCard from "@/components/ui/KpiCard";
import Modal from "@/components/ui/Modal";
import GatheringForm from "./GatheringForm";
import { updateGathering } from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  participants: GatheringParticipant[];
  companies: GatheringCompany[];
}

function fmt(n: number | null | undefined) {
  if (n == null) return "-";
  return n.toLocaleString("ko-KR");
}

export default function GatheringDetail({ gathering, participants, companies }: Props) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  async function handleUpdate(data: GatheringFormData) {
    await updateGathering(gathering.id, data);
    setShowEdit(false);
    router.refresh();
  }

  return (
    <div>
      {/* 상단 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/gatherings" className="text-sm text-gray-400 hover:text-indigo-600 mb-1 inline-block">
            ← 게더링 목록
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {gathering.name}
            <GatheringBadge status={gathering.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {gathering.date ?? "날짜 미정"} {gathering.location ? `· ${gathering.location}` : ""}
          </p>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
        >
          수정
        </button>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="참여자 수" value={`${gathering.participant_count}명`} icon="👥" color="indigo" />
        <KpiCard
          label="추천 유입 비율"
          value={`${gathering.referral_rate}%`}
          sub={`추천 ${gathering.referral_count}명`}
          icon="🔗"
          color="blue"
        />
        <KpiCard
          label="수익률"
          value={gathering.profit_rate != null ? `${gathering.profit_rate}%` : "-"}
          sub={`수익 ${fmt(gathering.revenue)}원 / 비용 ${fmt(gathering.cost)}원`}
          icon="📈"
          color="green"
        />
        <KpiCard label="협업기업" value={`${gathering.company_count}개`} icon="🏢" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 참여자 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">참여자 ({gathering.participant_count}명)</h2>
          </div>
          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 text-xs">
                  <th className="px-4 py-2 text-left font-medium">이름</th>
                  <th className="px-4 py-2 text-left font-medium">학교</th>
                  <th className="px-4 py-2 text-left font-medium">유입경로</th>
                  <th className="px-4 py-2 text-center font-medium">추천</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">참여자 없음</td>
                  </tr>
                )}
                {participants.map((gp) => (
                  <tr key={gp.participant_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{gp.participant?.name}</td>
                    <td className="px-4 py-2 text-gray-500">{gp.participant?.school ?? "-"}</td>
                    <td className="px-4 py-2 text-gray-500">{gp.participant?.channel ?? "-"}</td>
                    <td className="px-4 py-2 text-center">
                      {gp.referral ? (
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">추천</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 협업기업 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">협업기업 ({gathering.company_count}개)</h2>
          </div>
          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 text-xs">
                  <th className="px-4 py-2 text-left font-medium">기업명</th>
                  <th className="px-4 py-2 text-left font-medium">업종</th>
                  <th className="px-4 py-2 text-left font-medium">역할</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-400 text-xs">협업기업 없음</td>
                  </tr>
                )}
                {companies.map((gc) => (
                  <tr key={gc.company_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">
                      <Link href={`/companies`} className="hover:text-indigo-600">
                        {gc.company?.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{gc.company?.industry ?? "-"}</td>
                    <td className="px-4 py-2 text-gray-500">{gc.role ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 메모 */}
      {gathering.notes && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">메모</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{gathering.notes}</p>
        </div>
      )}

      {showEdit && (
        <Modal title="게더링 수정" onClose={() => setShowEdit(false)}>
          <GatheringForm
            initial={gathering}
            onSubmit={handleUpdate}
            onCancel={() => setShowEdit(false)}
          />
        </Modal>
      )}
    </div>
  );
}
