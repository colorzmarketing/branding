"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Company, CompanyFormData, CompanyStatus } from "@/types";
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

interface Props {
  companies: Company[];
}

export default function CompanyBoard({ companies }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

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
                {cols.map((company) => (
                  <div
                    key={company.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
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
                    {company.notes && (
                      <p className="text-xs text-gray-400 line-clamp-2">{company.notes}</p>
                    )}
                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
