"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { GatheringFormData, GatheringStatus } from "@/types";
import { createGathering } from "@/lib/actions/gatherings";

const HEADER_MAP: Record<string, keyof GatheringFormData> = {
  게더링명: "name",
  이름: "name",
  name: "name",
  상태: "status",
  status: "status",
  날짜: "date",
  date: "date",
  장소: "location",
  location: "location",
  목표참여자: "target_participants",
  목표참여자수: "target_participants",
  target_participants: "target_participants",
  목표수익: "target_profit",
  target_profit: "target_profit",
  수익: "revenue",
  실제수익: "revenue",
  revenue: "revenue",
  비용: "cost",
  cost: "cost",
  메모: "notes",
  notes: "notes",
};

const VALID_STATUS: GatheringStatus[] = ["기획중", "진행중", "완료"];

function parseCSV(text: string): GatheringFormData[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const fieldMap = headers.map((h) => HEADER_MAP[h] ?? null);

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: GatheringFormData = {
      name: "",
      status: "기획중",
      date: null,
      location: null,
      target_participants: null,
      target_profit: null,
      revenue: 0,
      cost: 0,
      notes: null,
    };

    fieldMap.forEach((field, i) => {
      if (!field) return;
      const val = values[i] ?? "";
      if (field === "status") {
        row.status = (VALID_STATUS.includes(val as GatheringStatus) ? val : "기획중") as GatheringStatus;
      } else if (field === "target_participants") {
        row.target_participants = val ? Number(val) : null;
      } else if (field === "target_profit") {
        row.target_profit = val ? Number(val) : null;
      } else if (field === "revenue") {
        row.revenue = val ? Number(val) : 0;
      } else if (field === "cost") {
        row.cost = val ? Number(val) : 0;
      } else if (field === "date") {
        row.date = val || null;
      } else if (field === "location" || field === "notes") {
        row[field] = val || null;
      } else if (field === "name") {
        row.name = val;
      }
    });

    return row;
  }).filter((r) => r.name);
}

interface Props {
  onClose: () => void;
}

export default function GatheringCsvImport({ onClose }: Props) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<GatheringFormData[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("CSV 파일만 업로드할 수 있습니다.");
      return;
    }
    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setError("유효한 데이터가 없습니다. 헤더와 데이터를 확인해주세요.");
      } else {
        setPreview(rows);
      }
    };
    reader.readAsText(file, "utf-8");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  async function handleImport() {
    if (!preview) return;
    setLoading(true);
    try {
      await Promise.all(preview.map((row) => createGathering(row)));
      router.refresh();
      onClose();
    } catch (e) {
      setError("가져오기 실패: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {!preview && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
            dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
          }`}
          onClick={() => document.getElementById("gathering-csv-input")?.click()}
        >
          <p className="text-3xl mb-2">📂</p>
          <p className="text-sm font-medium text-gray-700">CSV 파일을 드래그하거나 클릭해서 선택</p>
          <p className="text-xs text-gray-400 mt-1">UTF-8 인코딩 CSV만 지원</p>
          <input
            id="gathering-csv-input"
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          />
        </div>
      )}

      {!preview && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">CSV 컬럼 형식 (순서 무관)</p>
          <p className="font-mono">게더링명, 상태, 날짜, 장소, 목표참여자수, 목표수익, 수익, 비용, 메모</p>
          <p>상태: <span className="font-mono">기획중 / 진행중 / 완료</span> 중 하나 (기본값: 기획중)</p>
          <p>날짜 형식: <span className="font-mono">2024-03-15</span></p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {preview && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-800">📄 {fileName} — {preview.length}개 감지됨</p>
              <p className="text-xs text-gray-400">아래 데이터를 확인 후 가져오기 하세요.</p>
            </div>
            <button onClick={() => { setPreview(null); setFileName(""); }} className="text-xs text-gray-400 hover:text-gray-600">
              다시 선택
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-auto max-h-60">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                  <th className="px-3 py-2 text-left">게더링명</th>
                  <th className="px-3 py-2 text-left">상태</th>
                  <th className="px-3 py-2 text-left">날짜</th>
                  <th className="px-3 py-2 text-left">장소</th>
                  <th className="px-3 py-2 text-right">목표참여자</th>
                  <th className="px-3 py-2 text-right">수익률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((g, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 font-medium">{g.name}</td>
                    <td className="px-3 py-1.5 text-gray-500">{g.status}</td>
                    <td className="px-3 py-1.5 text-gray-500">{g.date ?? "-"}</td>
                    <td className="px-3 py-1.5 text-gray-500">{g.location ?? "-"}</td>
                    <td className="px-3 py-1.5 text-right text-gray-500">{g.target_participants ?? "-"}</td>
                    <td className="px-3 py-1.5 text-right text-gray-500">
                      {g.cost ? `${Math.round(((g.revenue - g.cost) / g.cost) * 100)}%` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          취소
        </button>
        {preview && (
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "가져오는 중..." : `${preview.length}개 가져오기`}
          </button>
        )}
      </div>
    </div>
  );
}
