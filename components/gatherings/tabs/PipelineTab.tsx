"use client";

import { useState, useTransition } from "react";
import { PIPELINE_STAGES } from "@/types";
import type { GatheringKpi } from "@/types";
import { updatePipeline } from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  onRefresh: () => void;
}

export default function PipelineTab({ gathering, onRefresh }: Props) {
  const completed = gathering.pipeline_completed ?? [];
  const [pending, startTransition] = useTransition();

  function toggle(stage: string) {
    const next = completed.includes(stage)
      ? completed.filter((s) => s !== stage)
      : [...completed, stage];

    startTransition(async () => {
      await updatePipeline(gathering.id, next);
      onRefresh();
    });
  }

  const currentStageIndex = (() => {
    let last = -1;
    PIPELINE_STAGES.forEach((s, i) => {
      if (completed.includes(s)) last = i;
    });
    return last;
  })();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-semibold text-gray-900">운영 파이프라인</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            단계별 체크로 현재 진행 상태를 추적합니다
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {completed.length} / {PIPELINE_STAGES.length} 완료
        </span>
      </div>

      <div className="relative">
        {/* 연결선 */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />

        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isDone = completed.includes(stage);
            const isCurrent = idx === currentStageIndex + 1 && !isDone;

            return (
              <button
                key={stage}
                onClick={() => toggle(stage)}
                disabled={pending}
                className={`relative flex items-center gap-4 w-full text-left p-4 rounded-xl border transition-all ${
                  isDone
                    ? "bg-indigo-50 border-indigo-200"
                    : isCurrent
                    ? "bg-white border-indigo-300 shadow-sm"
                    : "bg-white border-gray-100 hover:border-gray-200"
                }`}
              >
                {/* 체크 원 */}
                <span
                  className={`relative z-10 flex-none w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isDone
                      ? "bg-indigo-600 text-white"
                      : isCurrent
                      ? "bg-white border-2 border-indigo-400 text-indigo-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? "✓" : idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isDone
                        ? "text-indigo-700"
                        : isCurrent
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {stage}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-indigo-500 mt-0.5">진행 중인 단계</p>
                  )}
                </div>

                {isDone && (
                  <span className="text-xs text-indigo-400 font-medium">완료</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {completed.length === PIPELINE_STAGES.length && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
          <p className="text-sm font-medium text-green-700">
            모든 단계 완료! 게더링이 성공적으로 마무리되었습니다.
          </p>
        </div>
      )}
    </div>
  );
}
