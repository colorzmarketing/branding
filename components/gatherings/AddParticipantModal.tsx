"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import type { Participant, ParticipantFormData } from "@/types";
import {
  getParticipants,
  addParticipantToGathering,
  bulkAddParticipantsToGathering,
} from "@/lib/actions/participants";

// ── CSV 파서 ──────────────────────────────────────────────
const HEADER_MAP: Record<string, keyof ParticipantFormData> = {
  이름: "name", name: "name",
  학교: "school", school: "school",
  학번: "student_id", student_id: "student_id",
  학년: "grade", grade: "grade",
  유입경로: "channel", 유입_경로: "channel", channel: "channel",
  마케팅동의: "marketing_consent", 마케팅_동의: "marketing_consent", marketing_consent: "marketing_consent",
  이메일: "email", email: "email",
  전화번호: "phone", 연락처: "phone", phone: "phone",
};

function parseCSV(text: string): ParticipantFormData[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const fieldMap = headers.map((h) => HEADER_MAP[h] ?? null);

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: ParticipantFormData = {
      name: "", school: null, student_id: null, grade: null,
      channel: null, marketing_consent: false, email: null, phone: null,
    };
    fieldMap.forEach((field, i) => {
      if (!field) return;
      const val = values[i] ?? "";
      if (field === "marketing_consent") {
        row[field] = ["true", "1", "예", "동의", "y", "yes"].includes(val.toLowerCase());
      } else {
        (row as Record<string, unknown>)[field] = val || null;
      }
    });
    return row;
  }).filter((r) => r.name);
}

// ── Props ────────────────────────────────────────────────
interface Props {
  gatheringId: string;
  alreadyIds: string[];
  onClose: () => void;
  onAdded: () => void;
}

type Tab = "search" | "csv";

export default function AddParticipantModal({ gatheringId, alreadyIds, onClose, onAdded }: Props) {
  const [tab, setTab] = useState<Tab>("search");

  // ── 기존 참여자 검색 탭 ──
  const [all, setAll] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [referral, setReferral] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getParticipants().then((data) => {
      setAll(data as Participant[]);
      setLoadingList(false);
    });
  }, []);

  const filtered = all.filter((p) => {
    if (alreadyIds.includes(p.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.school ?? "").toLowerCase().includes(q) ||
      (p.student_id ?? "").toLowerCase().includes(q)
    );
  });

  function handleAdd() {
    if (!selected) return;
    startTransition(async () => {
      await addParticipantToGathering(gatheringId, selected, referral);
      onAdded();
      onClose();
    });
  }

  // ── CSV 탭 ──
  const [dragging, setDragging] = useState(false);
  const [csvPreview, setCsvPreview] = useState<ParticipantFormData[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState("");

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setCsvError("CSV 파일만 업로드할 수 있습니다.");
      return;
    }
    setCsvError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) setCsvError("유효한 데이터가 없습니다.");
      else setCsvPreview(rows);
    };
    reader.readAsText(file, "utf-8");
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  async function handleCsvImport() {
    if (!csvPreview) return;
    setCsvLoading(true);
    try {
      await bulkAddParticipantsToGathering(gatheringId, csvPreview);
      onAdded();
      onClose();
    } catch (e) {
      setCsvError("가져오기 실패: " + (e as Error).message);
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        {(["search", "csv"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "search" ? "기존 참여자 검색" : "📂 CSV 업로드"}
          </button>
        ))}
      </div>

      {/* ── 기존 참여자 검색 탭 ── */}
      {tab === "search" && (
        <>
          <input
            type="text"
            placeholder="이름, 학교, 학번으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            autoFocus
          />
          <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-52">
            {loadingList && <p className="text-sm text-gray-400 text-center py-6">불러오는 중...</p>}
            {!loadingList && filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                {search ? "검색 결과 없음" : "추가 가능한 참여자가 없습니다."}
              </p>
            )}
            {filtered.map((p) => (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors ${
                  selected === p.id ? "bg-indigo-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  className="accent-indigo-600"
                  checked={selected === p.id}
                  onChange={() => setSelected(p.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">
                    {[p.school, p.student_id, p.grade].filter(Boolean).join(" · ") || "정보 없음"}
                  </p>
                </div>
                {p.channel && <span className="text-xs text-gray-400 shrink-0">{p.channel}</span>}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={referral}
              onChange={(e) => setReferral(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            <span className="text-sm text-gray-700">추천 유입으로 등록</span>
          </label>
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">취소</button>
            <button
              onClick={handleAdd}
              disabled={!selected || isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
            >
              {isPending ? "추가 중..." : "참여자 추가"}
            </button>
          </div>
        </>
      )}

      {/* ── CSV 업로드 탭 ── */}
      {tab === "csv" && (
        <>
          {!csvPreview && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById("gathering-participant-csv")?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <p className="text-2xl mb-1">📂</p>
                <p className="text-sm font-medium text-gray-700">CSV 파일을 드래그하거나 클릭해서 선택</p>
                <p className="text-xs text-gray-400 mt-1">참여자가 새로 생성되고 이 게더링에 바로 연결됩니다</p>
                <input
                  id="gathering-participant-csv"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-600">CSV 컬럼 형식</p>
                <p className="font-mono">이름, 학교, 학번, 학년, 유입경로, 마케팅동의, 이메일, 전화번호</p>
              </div>
            </>
          )}

          {csvError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{csvError}</p>}

          {csvPreview && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-800">📄 {fileName} — {csvPreview.length}명 감지됨</p>
                <button onClick={() => { setCsvPreview(null); setFileName(""); }} className="text-xs text-gray-400 hover:text-gray-600">다시 선택</button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-auto max-h-48">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                      <th className="px-3 py-2 text-left">이름</th>
                      <th className="px-3 py-2 text-left">학교</th>
                      <th className="px-3 py-2 text-left">학번</th>
                      <th className="px-3 py-2 text-left">학년</th>
                      <th className="px-3 py-2 text-left">유입경로</th>
                      <th className="px-3 py-2 text-center">동의</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {csvPreview.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 font-medium">{p.name}</td>
                        <td className="px-3 py-1.5 text-gray-500">{p.school ?? "-"}</td>
                        <td className="px-3 py-1.5 text-gray-500">{p.student_id ?? "-"}</td>
                        <td className="px-3 py-1.5 text-gray-500">{p.grade ?? "-"}</td>
                        <td className="px-3 py-1.5 text-gray-500">{p.channel ?? "-"}</td>
                        <td className="px-3 py-1.5 text-center">
                          {p.marketing_consent ? <span className="text-green-600">✓</span> : <span className="text-gray-300">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">취소</button>
            {csvPreview && (
              <button
                onClick={handleCsvImport}
                disabled={csvLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {csvLoading ? "추가 중..." : `${csvPreview.length}명 추가`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
