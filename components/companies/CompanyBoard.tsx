"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Company, CompanyFormData, CompanyStatus, GatheringStatus } from "@/types";
import { CompanyBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import CompanyForm from "./CompanyForm";
import { createCompany, updateCompany, deleteCompany } from "@/lib/actions/companies";

const PIPELINE: { status: CompanyStatus; label: string; color: string }[] = [
  { status: "신규접촉",   label: "신규접촉",   color: "border-gray-300" },
  { status: "협업중",     label: "협업중",     color: "border-blue-400" },
  { status: "재협업검토", label: "재협업검토", color: "border-purple-400" },
  { status: "장기파트너", label: "장기파트너", color: "border-green-400" },
];

const GATHERING_STATUS_COLOR: Record<GatheringStatus, string> = {
  기획중: "bg-yellow-50 text-yellow-600 border-yellow-200",
  진행중: "bg-blue-50 text-blue-600 border-blue-200",
  완료:   "bg-green-50 text-green-600 border-green-200",
};

type GatheringEntry = {
  id: string;
  name: string;
  status: string;
  date: string | null;
  role: string | null;
};

interface Props {
  companies: Company[];
  gatheringMap: Record<string, GatheringEntry[]>;
}

export default function CompanyBoard({ companies, gatheringMap }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);

  async function handleCreate(data: CompanyFormData) {
    await createCompany(data);
    setShowCreate(false);
    router.refresh();
  }

  async function handleUpdate(data: CompanyFormData) {
    if (!editing) return;
    await updateCompany(editing.id, data);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}"을(를) 삭제할까요?`)) return;
    await deleteCompany(id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">협업기업</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {companies.length}개사</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          + 기업 추가
        </button>
      </div>

      {/* 파이프라인 칸반 보드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PIPELINE.map(({ status, label, color }) => {
          const cols = companies.filter((c) => c.status === status);
          return (
            <div key={status} className="flex flex-col">
              <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${color}`}>
                <span className="font-semibold text-sm text-gray-700">{label}</span>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  {cols.length}
                </span>
              </div>
              <div className="space-y-3">
                {cols.length === 0 && (
                  <p className="text-xs text-gray-400 py-4 text-center">없음</p>
                )}
                {cols.map((company) => {
                  const gatherings = gatheringMap[company.id] ?? [];
                  return (
                    <div
                      key={company.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
                      onClick={() => setDetailCompany(company)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{company.name}</p>
                          {company.industry && (
                            <p className="text-xs text-gray-400 mt-0.5">{company.industry}</p>
                          )}
                        </div>
                        <CompanyBadge status={company.status} />
                      </div>
                      {company.contact_name && (
                        <p className="text-xs text-gray-500 mb-2">담당: {company.contact_name}</p>
                      )}

                      {/* 협업 게더링 태그 */}
                      {gatherings.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {gatherings.slice(0, 3).map((g) => (
                            <span
                              key={g.id}
                              className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs ${
                                GATHERING_STATUS_COLOR[g.status as GatheringStatus] ?? "bg-gray-50 text-gray-500 border-gray-200"
                              }`}
                            >
                              🎉 {g.name}
                            </span>
                          ))}
                          {gatherings.length > 3 && (
                            <span className="text-xs text-gray-400 px-1">+{gatherings.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div
                        className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setEditing(company)}
                          className="text-xs text-indigo-500 hover:text-indigo-700"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(company.id, company.name)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 기업 상세 모달 (협업 게더링 이력) */}
      {detailCompany && (
        <Modal title={detailCompany.name} onClose={() => setDetailCompany(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">업종</p>
                <p className="font-medium">{detailCompany.industry ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">담당자</p>
                <p className="font-medium">{detailCompany.contact_name ?? "-"}</p>
              </div>
            </div>
            {detailCompany.notes && (
              <div>
                <p className="text-xs text-gray-400 mb-1">메모</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detailCompany.notes}</p>
              </div>
            )}

            {/* 협업 게더링 이력 */}
            <div>
              <p className="text-xs text-gray-400 mb-2">협업 게더링 이력</p>
              {(gatheringMap[detailCompany.id] ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 py-3 text-center">협업 게더링이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {(gatheringMap[detailCompany.id] ?? []).map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎉</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{g.name}</p>
                          <p className="text-xs text-gray-400">{g.date ?? "날짜 미정"}{g.role ? ` · ${g.role}` : ""}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          GATHERING_STATUS_COLOR[g.status as GatheringStatus] ?? "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => { setDetailCompany(null); setEditing(detailCompany); }}
                className="px-3 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
              >
                수정
              </button>
              <button
                onClick={() => setDetailCompany(null)}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showCreate && (
        <Modal title="기업 추가" onClose={() => setShowCreate(false)}>
          <CompanyForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="기업 수정" onClose={() => setEditing(null)}>
          <CompanyForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
