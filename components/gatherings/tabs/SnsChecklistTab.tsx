"use client";

import { useState } from "react";
import type { GatheringKpi, GatheringSnsItem } from "@/types";
import {
  toggleSnsItem,
  initSnsChecklist,
  addSnsItem,
  deleteSnsItem,
} from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  items: GatheringSnsItem[];
  onRefresh: () => void;
}

export default function SnsChecklistTab({ gathering, items, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [addingPhase, setAddingPhase] = useState<"행사 전" | "행사 후" | null>(null);
  const [newItem, setNewItem] = useState("");

  const before = items.filter((i) => i.phase === "행사 전");
  const after = items.filter((i) => i.phase === "행사 후");

  async function run(fn: () => Promise<void>) {
    setLoading(true);
    try {
      await fn();
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleToggle(item: GatheringSnsItem) {
    run(() => toggleSnsItem(item.id, gathering.id, !item.completed));
  }

  function handleInit() {
    run(() => initSnsChecklist(gathering.id));
  }

  function handleDelete(id: string) {
    run(() => deleteSnsItem(id, gathering.id));
  }

  async function handleAdd(phase: "행사 전" | "행사 후") {
    if (!newItem.trim()) return;
    await run(async () => {
      await addSnsItem(gathering.id, phase, newItem.trim());
      setNewItem("");
      setAddingPhase(null);
    });
  }

  const doneCount = items.filter((i) => i.completed).length;

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-gray-900">SNS 콘텐츠 체크리스트</h2>
          {items.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {doneCount}/{items.length} 완료
            </p>
          )}
        </div>
        {items.length === 0 && (
          <button
            onClick={handleInit}
            disabled={loading}
            className="text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50 disabled:opacity-60"
          >
            기본 항목 불러오기
          </button>
        )}
      </div>

      {items.length === 0 && (
        <div className="py-12 text-center text-gray-300 text-sm">
          체크리스트가 없습니다.
          <br />
          위 버튼으로 기본 항목을 불러오거나 직접 추가하세요.
        </div>
      )}

      {(["행사 전", "행사 후"] as const).map((phase) => {
        const phaseItems = phase === "행사 전" ? before : after;
        return (
          <div key={phase} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {phase}
              </h3>
              <button
                onClick={() => setAddingPhase(addingPhase === phase ? null : phase)}
                className="text-xs text-indigo-500 hover:text-indigo-700"
              >
                + 항목 추가
              </button>
            </div>

            {addingPhase === phase && (
              <div className="flex gap-2 mb-2">
                <input
                  autoFocus
                  placeholder="새 항목 이름"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd(phase)}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                />
                <button
                  onClick={() => handleAdd(phase)}
                  disabled={loading}
                  className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setAddingPhase(null);
                    setNewItem("");
                  }}
                  className="text-xs text-gray-400 px-2 py-1.5 hover:text-gray-600"
                >
                  취소
                </button>
              </div>
            )}

            {phaseItems.length === 0 && addingPhase !== phase && (
              <p className="text-xs text-gray-300 py-2">항목 없음</p>
            )}

            <div className="space-y-2">
              {phaseItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 group"
                >
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={loading}
                    className={`flex-none w-5 h-5 rounded border-2 flex items-center justify-center transition-colors disabled:opacity-60 ${
                      item.completed
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-300 hover:border-indigo-400"
                    }`}
                  >
                    {item.completed && <span className="text-xs">✓</span>}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      item.completed ? "line-through text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {item.item}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={loading}
                    className="text-xs text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
