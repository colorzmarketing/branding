"use client";

import { useState } from "react";
import type { GatheringKpi } from "@/types";
import { updateGathering } from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  onRefresh: () => void;
}

export default function NotesTab({ gathering, onRefresh }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(gathering.notes ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await updateGathering(gathering.id, { notes: value || null });
      setEditing(false);
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">메모</h2>
        {!editing && (
          <button
            onClick={() => {
              setValue(gathering.notes ?? "");
              setEditing(true);
            }}
            className="text-xs text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
          >
            {gathering.notes ? "수정" : "작성"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            autoFocus
            rows={12}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="운영 관련 아이디어, 공유 사항, 이슈 등을 자유롭게 기록하세요..."
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              저장
            </button>
          </div>
        </div>
      ) : gathering.notes ? (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {gathering.notes}
          </p>
        </div>
      ) : (
        <div className="py-16 text-center text-gray-300 text-sm">
          아직 메모가 없습니다.
        </div>
      )}
    </div>
  );
}
