import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { ArchiveCategory } from "@/types";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<ArchiveCategory, string> = {
  "홍보/디자인": "bg-pink-50 text-pink-700",
  "기획 문서": "bg-blue-50 text-blue-700",
  "홍보 채널": "bg-yellow-50 text-yellow-700",
  "설문 폼": "bg-purple-50 text-purple-700",
  "행사 사진": "bg-orange-50 text-orange-700",
  "랩업 인사이트": "bg-green-50 text-green-700",
};

async function getAllArchives() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gathering_archives")
    .select("*, gatherings(name, date)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export default async function ArchivePage() {
  let archives: Awaited<ReturnType<typeof getAllArchives>> = [];
  let err = "";

  try {
    archives = await getAllArchives();
  } catch (e) {
    err = e instanceof Error ? e.message : String(e);
  }

  const categories = Array.from(new Set(archives.map((a) => a.category)));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          전체 게더링의 산출물 라이브러리 · {archives.length}개 항목
        </p>
      </div>

      {err && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {err}
          <br />
          <span className="text-xs text-red-400">
            Supabase에서 SQL 마이그레이션을 먼저 실행해 주세요.
          </span>
        </div>
      )}

      {archives.length === 0 && !err && (
        <div className="py-24 text-center text-gray-300">
          <p className="text-lg mb-2">아직 Archive 항목이 없습니다.</p>
          <p className="text-sm">
            게더링 상세 페이지 → Archive 탭에서 산출물을 추가해 보세요.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {categories.map((cat) => {
          const items = archives.filter((a) => a.category === cat);
          return (
            <div key={cat}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {cat}
                <span className="ml-2 text-gray-300 font-normal normal-case">
                  {items.length}개
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span
                        className={`flex-none text-xs px-2 py-0.5 rounded-full font-medium ${
                          CATEGORY_COLORS[a.category as ArchiveCategory] ??
                          "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {a.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{a.title}</p>
                    {a.content && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {a.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <Link
                        href={`/gatherings/${a.gathering_id}`}
                        className="text-xs text-indigo-500 hover:text-indigo-700"
                      >
                        {(a as { gatherings?: { name?: string } }).gatherings?.name ?? "게더링"}
                      </Link>
                      {a.url && (
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-indigo-600 underline"
                        >
                          링크 열기
                        </a>
                      )}
                    </div>
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
