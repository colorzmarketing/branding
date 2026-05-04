"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { GatheringKpi, GatheringCompany } from "@/types";
import { removeCompanyFromGathering } from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  companies: GatheringCompany[];
  onAdd: () => void;
  onRefresh: () => void;
}

export default function CompaniesTab({ gathering, companies, onAdd, onRefresh }: Props) {
  const [, startTransition] = useTransition();

  function handleRemove(companyId: string, name: string) {
    if (!confirm(`"${name}"을(를) 이 게더링에서 제거할까요?`)) return;
    startTransition(async () => {
      await removeCompanyFromGathering(gathering.id, companyId);
      onRefresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">
          협력업체
          <span className="ml-1.5 text-sm font-normal text-gray-400">
            {gathering.company_count}개
          </span>
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
        >
          + 연결
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 text-gray-400 text-xs">
              <th className="px-4 py-2 text-left font-medium">업체명</th>
              <th className="px-4 py-2 text-left font-medium">업종</th>
              <th className="px-4 py-2 text-left font-medium">역할</th>
              <th className="px-4 py-2 text-left font-medium">담당자</th>
              <th className="px-4 py-2 text-left font-medium">연락처</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {companies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-xs">
                  아직 연결된 협력업체가 없습니다.
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
                <td className="px-4 py-2.5 text-gray-500 text-xs">
                  {gc.company?.industry ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-xs">
                  {gc.role ? (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {gc.role}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-gray-500 text-xs">
                  {gc.company?.contact_name ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-gray-400 text-xs">
                  {gc.company?.contact_phone ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => handleRemove(gc.company_id, gc.company?.name ?? "")}
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
