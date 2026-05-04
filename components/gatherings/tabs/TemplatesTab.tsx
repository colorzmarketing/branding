"use client";

import { useState } from "react";
import type { GatheringKpi } from "@/types";

interface Props {
  gathering: GatheringKpi;
}

const FORM_TEMPLATES = [
  {
    id: "demand",
    label: "수요조사 폼",
    description: "참여 의향 및 관심 주제 파악",
    fields: [
      "관심 주제 (복수 선택)",
      "선호 일정 (날짜/시간대)",
      "선호 장소 (지역/온오프라인)",
      "참여 의향 (척도 1~5)",
      "기타 의견 (주관식)",
    ],
  },
  {
    id: "apply",
    label: "신청서 폼",
    description: "참가자 정보 수집 및 입금 안내",
    fields: [
      "이름 (단답)",
      "연락처 (단답)",
      "학교 (단답)",
      "기수 또는 학번 (단답)",
      "입금 방식 선택 (계좌이체 등)",
      "개인정보 수집 및 이용 동의 (체크박스)",
      "기타 요청사항 (장문)",
    ],
  },
  {
    id: "satisfaction",
    label: "만족도 조사 폼",
    description: "행사 후 피드백 수집",
    fields: [
      "전반적 만족도 (척도 1~5)",
      "좋았던 점 (장문)",
      "아쉬웠던 점 및 개선 사항 (장문)",
      "재참여 의향 (예/아니오)",
      "NPS — 지인 추천 의향 (0~10점)",
      "후기 활용 동의 (체크박스)",
    ],
  },
];

function PromoTemplate({ gathering }: { gathering: GatheringKpi }) {
  const [copied, setCopied] = useState(false);

  const text = `[${gathering.name}]

안녕하세요! 컬러즈 브랜딩팀에서 [${gathering.name}] 참여자를 모집합니다.

1) 일시: ${gathering.date ?? "YYYY.MM.DD(요일) HH:MM"}
2) 장소: ${gathering.location ?? "장소 미정"}
3) 참가비: ${gathering.fee ? `${gathering.fee.toLocaleString("ko-KR")}원` : "참가비 미정"} / 입금 안내는 신청 완료 후 개별 안내
4) 모집 인원/마감: _명 / _일 마감
5) 신청 링크: [구글폼 링크]

- 이런 분께 추천: [대상/키워드 3개]
- 문의: [연락처/오픈채팅]

※ 포스터/이미지는 댓글(또는 첨부)로 확인 부탁드립니다.`;

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">카카오톡 홍보글 템플릿</h3>
          <p className="text-xs text-gray-400 mt-0.5">게더링 정보가 자동으로 채워집니다</p>
        </div>
        <button
          onClick={copy}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          }`}
        >
          {copied ? "복사됨!" : "복사하기"}
        </button>
      </div>
      <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4 font-mono">
        {text}
      </pre>
    </div>
  );
}

export default function TemplatesTab({ gathering }: Props) {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [copiedFields, setCopiedFields] = useState<string | null>(null);

  function copyFields(id: string, fields: string[]) {
    navigator.clipboard.writeText(fields.map((f, i) => `${i + 1}. ${f}`).join("\n"));
    setCopiedFields(id);
    setTimeout(() => setCopiedFields(null), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-semibold text-gray-900 mb-1">설문/홍보 템플릿</h2>
        <p className="text-xs text-gray-400">
          반복 작업을 줄이기 위한 표준 질문 목록입니다. 구글폼 작성 시 복사해서 사용하세요.
        </p>
      </div>

      {/* 구글폼 템플릿 */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          구글폼 질문 목록
        </h3>
        <div className="space-y-3">
          {FORM_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-xl border border-gray-100">
              <button
                onClick={() => setActiveForm(activeForm === tpl.id ? null : tpl.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">{tpl.label}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{tpl.description}</p>
                </div>
                <span className="text-gray-400 text-xs ml-4">
                  {activeForm === tpl.id ? "▲" : "▼"}
                </span>
              </button>

              {activeForm === tpl.id && (
                <div className="px-5 pb-4 border-t border-gray-50">
                  <ol className="mt-3 space-y-1.5">
                    {tpl.fields.map((f) => (
                      <li key={f} className="text-xs text-gray-600 flex gap-2">
                        <span className="text-gray-300">•</span>
                        {f}
                      </li>
                    ))}
                  </ol>
                  <button
                    onClick={() => copyFields(tpl.id, tpl.fields)}
                    className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      copiedFields === tpl.id
                        ? "bg-green-100 text-green-700"
                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    {copiedFields === tpl.id ? "복사됨!" : "질문 목록 복사"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 홍보글 템플릿 */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          홍보글 템플릿
        </h3>
        <PromoTemplate gathering={gathering} />
      </div>
    </div>
  );
}
