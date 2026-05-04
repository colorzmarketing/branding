"use client";

import { useState, useTransition } from "react";
import type { GatheringKpi, GatheringArchive, ArchiveCategory } from "@/types";
import {
  createGatheringArchive,
  deleteGatheringArchive,
} from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  archives: GatheringArchive[];
  onRefresh: () => void;
}

const CATEGORIES: ArchiveCategory[] = [
  "홍보/디자인",
  "기획 문서",
  "홍보 채널",
  "설문 폼",
  "행사 사진",
  "랩업 인사이트",
];

const CATEGORY_COLORS: Record<ArchiveCategory, string> = {
  "홍보/디자인": "bg-pink-50 text-pink-700",
  "기획 문서": "bg-blue-50 text-blue-700",
  "홍보 채널": "bg-yellow-50 text-yellow-700",
  "설문 폼": "bg-purple-50 text-purple-700",
  "행사 사진": "bg-orange-50 text-orange-700",
  "랩업 인사이트": "bg-green-50 text-green-700",
};

const EMPTY_FORM = {
  category: "홍보/디자인" as ArchiveCategory,
  title: "",
  url: "",
  content: "",
};

export default function ArchiveTab({ gathering, archives, onRefresh }: Props) {
  const [, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState<ArchiveCategory | "전체">("전체");

  const filtered = filter === "전체" ? archives : archives.filter((a) => a.category === filter);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    startTransition(async () => {
      await createGatheringArchive({
        gathering_id: gathering.id,
        category: form.category,
        title: form.title.trim(),
        url: form.url.trim() || null,
        content: form.content.trim() || null,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      onRefresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("항목을 삭제할까요?")) return;
    startTransition(async () => {
      await deleteGatheringArchive(id, gathering.id);
      onRefresh();
    });
  }

  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = filtered.filter((a) => a.category === cat);
      return acc;
    },
    {} as Record<ArchiveCategory, GatheringArchive[]>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-gray-900">게더링 Archive</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            산출물 링크 및 파일을 카테고리별로 모아 관리합니다
          </p>
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
          className="mb-5 p-5 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">카테고리</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as ArchiveCategory })
                }
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">제목 *</label>
              <input
                autoFocus
                placeholder="항목 제목"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">링크 URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">메모/내용</label>
            <textarea
              rows={3}
              placeholder="내용 또는 인사이트..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
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
              className="text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700"
            >
              추가
            </button>
          </div>
        </form>
      )}

      {/* 카테고리 필터 */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(["전체", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filter === c
                ? "bg-indigo-600 text-white border-indigo-600"
                : "text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            {c}
            {c !== "전체" && (
              <span className="ml-1 opacity-60">
                {archives.filter((a) => a.category === c).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {archives.length === 0 && !showForm && (
        <div className="py-16 text-center text-gray-300 text-sm">
          아직 Archive 항목이 없습니다. 산출물 링크를 추가해 보세요.
        </div>
      )}

      {/* 카테고리별 그룹 */}
      <div className="space-y-5">
        {CATEGORIES.map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {cat}
              </h3>
              <div className="space-y-2">
                {items.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 group flex gap-3"
                  >
                    <span
                      className={`flex-none text-xs px-2 py-0.5 rounded-full font-medium h-fit ${CATEGORY_COLORS[a.category]}`}
                    >
                      {a.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-medium text-gray-900">{a.title}</p>
                        {a.url && (
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-none text-xs text-indigo-500 hover:text-indigo-700 underline"
                          >
                            링크 열기
                          </a>
                        )}
                      </div>
                      {a.content && (
                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                          {a.content}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="flex-none text-xs text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
    </div>
  );
}
