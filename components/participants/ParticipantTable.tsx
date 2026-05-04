"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Participant, ParticipantFormData } from "@/types";
import Modal from "@/components/ui/Modal";
import ParticipantForm from "./ParticipantForm";
import CsvImport from "./CsvImport";
import { createParticipant, updateParticipant, deleteParticipant } from "@/lib/actions/participants";

interface Props {
  participants: Participant[];
}

export default function ParticipantTable({ participants }: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [editing, setEditing] = useState<Participant | null>(null);
  const [filter, setFilter] = useState<{
    referral?: boolean;
    consent?: boolean;
    search: string;
  }>({ search: "" });

  async function handleCreate(data: ParticipantFormData) {
    await createParticipant(data);
    setShowCreate(false);
    router.refresh();
  }

  async function handleUpdate(data: ParticipantFormData) {
    if (!editing) return;
    await updateParticipant(editing.id, data);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}"을(를) 삭제할까요?`)) return;
    await deleteParticipant(id);
    router.refresh();
  }

  const filtered = participants.filter((p) => {
    if (filter.consent !== undefined && p.marketing_consent !== filter.consent) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !(p.school ?? "").toLowerCase().includes(q) &&
        !(p.channel ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">참여자 DB</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {participants.length}명 · 필터 결과 {filtered.length}명</p>
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
            + 참여자 추가
          </button>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="이름, 학교, 유입경로 검색..."
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"
        />

        <div className="flex gap-2">
          {[
            { label: "전체", value: undefined },
            { label: "동의자만", value: true },
            { label: "비동의자", value: false },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setFilter((f) => ({ ...f, consent: value }))}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                filter.consent === value
                  ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs bg-gray-50">
                <th className="px-6 py-3 text-left font-medium">이름</th>
                <th className="px-6 py-3 text-left font-medium">학교</th>
                <th className="px-6 py-3 text-left font-medium">학번</th>
                <th className="px-6 py-3 text-left font-medium">유입경로</th>
                <th className="px-6 py-3 text-center font-medium">마케팅 동의</th>
                <th className="px-6 py-3 text-left font-medium">이메일</th>
                <th className="px-6 py-3 text-left font-medium">전화번호</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    참여자가 없습니다.
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-3 text-gray-500">{p.school ?? "-"}</td>
                  <td className="px-6 py-3 text-gray-500">{p.student_id ?? "-"}</td>
                  <td className="px-6 py-3 text-gray-500">{p.channel ?? "-"}</td>
                  <td className="px-6 py-3 text-center">
                    {p.marketing_consent ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        동의
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        미동의
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {p.marketing_consent && p.email ? p.email : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {p.marketing_consent && p.phone ? p.phone : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing(p)}
                        className="text-xs text-indigo-500 hover:text-indigo-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCsvImport && (
        <Modal title="CSV로 참여자 가져오기" onClose={() => setShowCsvImport(false)}>
          <CsvImport onClose={() => setShowCsvImport(false)} />
        </Modal>
      )}

      {showCreate && (
        <Modal title="참여자 추가" onClose={() => setShowCreate(false)}>
          <ParticipantForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="참여자 수정" onClose={() => setEditing(null)}>
          <ParticipantForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
