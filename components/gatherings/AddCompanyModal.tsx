"use client";

import { useState, useEffect, useTransition } from "react";
import type { Company } from "@/types";
import { getCompanies } from "@/lib/actions/companies";
import { addCompanyToGathering } from "@/lib/actions/gatherings";
import { CompanyBadge } from "@/components/ui/Badge";

const ROLES = ["스폰서", "협찬", "강연사", "공동기획", "파트너", "기타"];

interface Props {
  gatheringId: string;
  alreadyIds: string[];
  onClose: () => void;
  onAdded: () => void;
}

export default function AddCompanyModal({ gatheringId, alreadyIds, onClose, onAdded }: Props) {
  const [all, setAll] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCompanies().then((data) => {
      setAll(data);
      setLoading(false);
    });
  }, []);

  const filtered = all.filter((c) => {
    if (alreadyIds.includes(c.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.industry ?? "").toLowerCase().includes(q) ||
      (c.contact_name ?? "").toLowerCase().includes(q)
    );
  });

  async function handleAdd() {
    if (!selected) return;
    startTransition(async () => {
      await addCompanyToGathering(gatheringId, selected, role || null);
      onAdded();
      onClose();
    });
  }

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <input
        type="text"
        placeholder="기업명, 업종, 담당자로 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        autoFocus
      />

      {/* 기업 목록 */}
      <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-56">
        {loading && (
          <p className="text-sm text-gray-400 text-center py-6">불러오는 중...</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            {alreadyIds.length > 0 && all.filter((c) => !alreadyIds.includes(c.id)).length === 0
              ? "모든 기업이 이미 연결되어 있습니다."
              : search
              ? "검색 결과 없음"
              : "등록된 기업이 없습니다."}
          </p>
        )}
        {filtered.map((c) => (
          <label
            key={c.id}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors ${
              selected === c.id ? "bg-indigo-50" : "hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              className="accent-indigo-600"
              checked={selected === c.id}
              onChange={() => setSelected(c.id)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-400">
                {[c.industry, c.contact_name ? `담당: ${c.contact_name}` : null]
                  .filter(Boolean)
                  .join(" · ") || "정보 없음"}
              </p>
            </div>
            <CompanyBadge status={c.status} />
          </label>
        ))}
      </div>

      {/* 역할 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">역할 (선택)</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(role === r ? "" : r)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                role === r
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r}
            </button>
          ))}
          <input
            type="text"
            value={ROLES.includes(role) ? "" : role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="직접 입력"
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 w-24"
          />
        </div>
      </div>

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
          {isPending ? "연결 중..." : "기업 연결"}
        </button>
      </div>
    </div>
  );
}
