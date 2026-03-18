"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GatheringKpi, GatheringCompany, GatheringParticipant, GatheringFormData } from "@/types";
import { GatheringBadge } from "@/components/ui/Badge";
import KpiCard from "@/components/ui/KpiCard";
import Modal from "@/components/ui/Modal";
import GatheringForm from "./GatheringForm";
import AddParticipantModal from "./AddParticipantModal";
import AddCompanyModal from "./AddCompanyModal";
import { updateGathering, removeCompanyFromGathering } from "@/lib/actions/gatherings";
import { removeParticipantFromGathering } from "@/lib/actions/participants";

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
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [search, setSearch] = useState("");

  async function handleUpdate(data: GatheringFormData) {
    await updateGathering(gathering.id, data);
    setShowEdit(false);
    router.refresh();
  }

  async function handleRemoveParticipant(participantId: string, name: string) {
    if (!confirm(`"${name}"을(를) 이 게더링에서 제거할까요?`)) return;
    await removeParticipantFromGathering(gathering.id, participantId);
    router.refresh();
  }

  const filteredParticipants = participants.filter((gp) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (gp.participant?.name ?? "").toLowerCase().includes(q) ||
      (gp.participant?.school ?? "").toLowerCase().includes(q) ||
      (gp.participant?.student_id ?? "").toLowerCase().includes(q)
    );
  });

  const alreadyIds = participants.map((gp) => gp.participant_id);
  const alreadyCompanyIds = companies.map((gc) => gc.company_id);

  async function handleRemoveCompany(companyId: string, name: string) {
    if (!confirm(`"${name}"을(를) 이 게더링에서 제거할까요?`)) return;
    await removeCompanyFromGathering(gathering.id, companyId);
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
        {/* ── 참여자 목록 ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              참여자
              <span className="ml-1.5 text-sm font-normal text-gray-400">
                {gathering.participant_count}명
                {gathering.referral_count > 0 && ` · 추천 ${gathering.referral_count}명`}
              </span>
            </h2>
            <button
              onClick={() => setShowAddParticipant(true)}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
            >
              + 참여자 추가
            </button>
          </div>

          {/* 검색 */}
          <div className="px-5 py-2 border-b border-gray-50">
            <input
              type="text"
              placeholder="이름, 학교, 학번 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>

          <div className="overflow-y-auto flex-1" style={{ maxHeight: "320px" }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-50 text-gray-400 text-xs">
                  <th className="px-4 py-2 text-left font-medium">이름</th>
                  <th className="px-4 py-2 text-left font-medium">학교</th>
                  <th className="px-4 py-2 text-left font-medium">학번</th>
                  <th className="px-4 py-2 text-left font-medium">유입경로</th>

                  <th className="px-4 py-2 text-center font-medium">추천</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-xs">
                      아직 참여자가 없습니다.
                    </td>
                  </tr>
                )}
                {filteredParticipants.length === 0 && participants.length > 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-xs">
                      검색 결과 없음
                    </td>
                  </tr>
                )}
                {filteredParticipants.map((gp) => (
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
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">추천</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleRemoveParticipant(gp.participant_id, gp.participant?.name ?? "")}
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

          {/* 요약 푸터 */}
          {participants.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 flex gap-4 text-xs text-gray-400">
              <span>총 <b className="text-gray-700">{gathering.participant_count}명</b></span>
              <span>추천유입 <b className="text-blue-600">{gathering.referral_count}명</b> ({gathering.referral_rate}%)</span>
              <span>마케팅동의 <b className="text-green-600">
                {participants.filter((gp) => gp.participant?.marketing_consent).length}명
              </b></span>
            </div>
          )}
        </div>

        {/* ── 협업기업 목록 ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              협업기업
              <span className="ml-1.5 text-sm font-normal text-gray-400">{gathering.company_count}개</span>
            </h2>
            <button
              onClick={() => setShowAddCompany(true)}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
            >
              + 기업 연결
            </button>
          </div>
          <div className="overflow-y-auto flex-1" style={{ maxHeight: "320px" }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-50 text-gray-400 text-xs">
                  <th className="px-4 py-2 text-left font-medium">기업명</th>
                  <th className="px-4 py-2 text-left font-medium">업종</th>
                  <th className="px-4 py-2 text-left font-medium">역할</th>
                  <th className="px-4 py-2 text-left font-medium">담당자</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">
                      아직 연결된 협업기업이 없습니다.
                    </td>
                  </tr>
                )}
                {companies.map((gc) => (
                  <tr key={gc.company_id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-2.5 font-medium text-gray-900">
                      <Link href="/companies" className="hover:text-indigo-600">
                        {gc.company?.name ?? "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{gc.company?.industry ?? "-"}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {gc.role ? (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{gc.role}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{gc.company?.contact_name ?? "-"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleRemoveCompany(gc.company_id, gc.company?.name ?? "")}
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

      {showAddParticipant && (
        <Modal title="참여자 추가" onClose={() => setShowAddParticipant(false)}>
          <AddParticipantModal
            gatheringId={gathering.id}
            alreadyIds={alreadyIds}
            onClose={() => setShowAddParticipant(false)}
            onAdded={() => router.refresh()}
          />
        </Modal>
      )}

      {showAddCompany && (
        <Modal title="협업기업 연결" onClose={() => setShowAddCompany(false)}>
          <AddCompanyModal
            gatheringId={gathering.id}
            alreadyIds={alreadyCompanyIds}
            onClose={() => setShowAddCompany(false)}
            onAdded={() => router.refresh()}
          />
        </Modal>
      )}
    </div>
  );
}
