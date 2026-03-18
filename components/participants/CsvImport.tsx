"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ParticipantFormData } from "@/types";
import { bulkCreateParticipants } from "@/lib/actions/participants";

// CSV 헤더 → DB 컬럼 매핑 (한국어 / 영어 모두 허용)
const HEADER_MAP: Record<string, keyof ParticipantFormData> = {
  이름: "name",
  name: "name",
  학교: "school",
  school: "school",
  학번: "student_id",
  student_id: "student_id",
  학년: "grade",
  grade: "grade",
  유입경로: "channel",
  유입_경로: "channel",
  channel: "channel",
  마케팅동의: "marketing_consent",
  마케팅_동의: "marketing_consent",
  marketing_consent: "marketing_consent",
  이메일: "email",
  email: "email",
  전화번호: "phone",
  연락처: "phone",
  phone: "phone",
};

function parseCSV(text: string): ParticipantFormData[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const fieldMap = headers.map((h) => HEADER_MAP[h] ?? null);

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Partial<ParticipantFormData> = {
      name: "",
      school: null,
      student_id: null,
      grade: null,
      channel: null,
      marketing_consent: false,
      email: null,
      phone: null,
    };

    fieldMap.forEach((field, i) => {
      if (!field) return;
      const val = values[i] ?? "";
      if (field === "marketing_consent") {
        row[field] = ["true", "1", "예", "동의", "y", "yes"].includes(
          val.toLowerCase()
        );
      } else {
        (row as Record<string, unknown>)[field] = val || null;
      }
    });

    return row as ParticipantFormData;
  }).filter((r) => r.name); // 이름 없는 행 제외
}

interface Props {
  onClose: () => void;
}

export default function CsvImport({ onClose }: Props) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<ParticipantFormData[] | null>(null);
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
      await bulkCreateParticipants(preview);
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
      {/* 드래그 영역 */}
      {!preview && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
            dragging
              ? "border-indigo-400 bg-indigo-50"
              : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
          }`}
          onClick={() => document.getElementById("csv-file-input")?.click()}
        >
          <p className="text-3xl mb-2">📂</p>
          <p className="text-sm font-medium text-gray-700">
            CSV 파일을 드래그하거나 클릭해서 선택
          </p>
          <p className="text-xs text-gray-400 mt-1">UTF-8 인코딩 CSV만 지원</p>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
          />
        </div>
      )}

      {/* 헤더 안내 */}
      {!preview && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">CSV 컬럼 형식 (순서 무관)</p>
          <p className="font-mono">이름, 학교, 학번, 학년, 유입경로, 마케팅동의, 이메일, 전화번호</p>
          <p>마케팅동의: <span className="font-mono">동의 / 예 / true / 1</span> 중 하나</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* 미리보기 */}
      {preview && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-800">
                📄 {fileName} — {preview.length}명 감지됨
              </p>
              <p className="text-xs text-gray-400">아래 데이터를 확인 후 가져오기 하세요.</p>
            </div>
            <button
              onClick={() => { setPreview(null); setFileName(""); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              다시 선택
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-auto max-h-60">
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
                {preview.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 font-medium">{p.name}</td>
                    <td className="px-3 py-1.5 text-gray-500">{p.school ?? "-"}</td>
                    <td className="px-3 py-1.5 text-gray-500">{p.student_id ?? "-"}</td>
                    <td className="px-3 py-1.5 text-gray-500">{p.grade ?? "-"}</td>
                    <td className="px-3 py-1.5 text-gray-500">{p.channel ?? "-"}</td>
                    <td className="px-3 py-1.5 text-center">
                      {p.marketing_consent ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
        {preview && (
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "가져오는 중..." : `${preview.length}명 가져오기`}
          </button>
        )}
      </div>
    </div>
  );
}
