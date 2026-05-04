"use client";

import { useState } from "react";
import type { GatheringKpi, GatheringTask } from "@/types";
import {
  createGatheringTask,
  updateGatheringTask,
  deleteGatheringTask,
} from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  tasks: GatheringTask[];
  onRefresh: () => void;
}

export default function TasksTab({ gathering, tasks, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", assignee: "", budget: "" });

  const totalBudget = tasks.reduce((s, t) => s + (t.budget ?? 0), 0);
  const completedCount = tasks.filter((t) => t.completed).length;

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

  function handleToggle(task: GatheringTask) {
    run(() => updateGatheringTask(task.id, gathering.id, { completed: !task.completed }));
  }

  function handleDelete(id: string) {
    if (!confirm("항목을 삭제할까요?")) return;
    run(() => deleteGatheringTask(id, gathering.id));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await run(async () => {
      await createGatheringTask({
        gathering_id: gathering.id,
        title: form.title.trim(),
        assignee: form.assignee.trim() || null,
        budget: form.budget ? Number(form.budget) : null,
        completed: false,
      });
      setForm({ title: "", assignee: "", budget: "" });
      setShowForm(false);
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">구매/준비 목록</h2>
          {tasks.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {completedCount}/{tasks.length} 완료 ·{" "}
              예산 합계 {totalBudget.toLocaleString("ko-KR")}원
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
        >
          + 항목 추가
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3"
        >
          <div className="grid grid-cols-3 gap-2">
            <input
              autoFocus
              placeholder="항목명 *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="col-span-3 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <input
              placeholder="담당자"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              className="col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <input
              type="number"
              placeholder="예산(원)"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-white"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              추가
            </button>
          </div>
        </form>
      )}

      {tasks.length === 0 && !showForm && (
        <div className="py-16 text-center text-gray-300 text-sm">
          준비 항목이 없습니다. 추가해 보세요.
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-xl border group transition-colors ${
              task.completed
                ? "bg-gray-50 border-gray-100"
                : "bg-white border-gray-200"
            }`}
          >
            <button
              onClick={() => handleToggle(task)}
              disabled={loading}
              className={`flex-none w-5 h-5 rounded border-2 flex items-center justify-center transition-colors disabled:opacity-60 ${
                task.completed
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-gray-300 hover:border-indigo-400"
              }`}
            >
              {task.completed && <span className="text-xs">✓</span>}
            </button>

            <div className="flex-1 min-w-0">
              <span
                className={`text-sm ${
                  task.completed ? "line-through text-gray-400" : "text-gray-900"
                }`}
              >
                {task.title}
              </span>
              <div className="flex gap-3 mt-0.5">
                {task.assignee && (
                  <span className="text-xs text-gray-400">{task.assignee}</span>
                )}
                {task.budget != null && (
                  <span className="text-xs text-gray-400">
                    {task.budget.toLocaleString("ko-KR")}원
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleDelete(task.id)}
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
}
