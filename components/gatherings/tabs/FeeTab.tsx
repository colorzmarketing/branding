"use client";

import { useState } from "react";
import type { GatheringKpi, GatheringParticipant } from "@/types";
import { updateParticipantFee, updateGathering } from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  participants: GatheringParticipant[];
  onRefresh: () => void;
}

export default function FeeTab({ gathering, participants, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [editingRefund, setEditingRefund] = useState<string | null>(null);
  const [refundInput, setRefundInput] = useState("");
  const [editingFee, setEditingFee] = useState(false);
  const [feeInput, setFeeInput] = useState(String(gathering.fee ?? ""));

  const paidCount = participants.filter((gp) => gp.fee_paid).length;
  const fee = gathering.fee ?? 0;
  const collectedAmount = paidCount * fee;

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

  function handleTogglePaid(gp: GatheringParticipant) {
    run(() => updateParticipantFee(gathering.id, gp.participant_id, { fee_paid: !gp.fee_paid }));
  }

  function handleToggleRefunded(gp: GatheringParticipant) {
    run(() => updateParticipantFee(gathering.id, gp.participant_id, { refunded: !gp.refunded }));
  }

  function openRefundEdit(gp: GatheringParticipant) {
    setEditingRefund(gp.participant_id);
    setRefundInput(gp.refund_account ?? "");
  }

  function handleSaveRefund(participantId: string) {
    run(async () => {
      await updateParticipantFee(gathering.id, participantId, {
        refund_account: refundInput.trim() || null,
      });
      setEditingRefund(null);
    });
  }

  function handleSaveFee() {
    const val = Number(feeInput);
    if (isNaN(val)) return;
    run(async () => {
      await updateGathering(gathering.id, { fee: val });
      setEditingFee(false);
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">참가비 관리</h2>
          <div className="flex items-center gap-2">
            {editingFee ? (
              <>
                <input
                  type="number"
                  value={feeInput}
                  onChange={(e) => setFeeInput(e.target.value)}
                  className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  autoFocus
                />
                <button
                  onClick={handleSaveFee}
                  disabled={loading}
                  className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-60"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditingFee(false)}
                  className="text-xs text-gray-400 px-2 py-1.5"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setFeeInput(String(gathering.fee ?? ""));
                  setEditingFee(true);
                }}
                className="text-xs text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
              >
                참가비 설정
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{fee > 0 ? `${fee.toLocaleString("ko-KR")}원` : "-"}</p>
            <p className="text-xs text-gray-400 mt-1">참가비</p>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <p className="text-2xl font-bold text-indigo-700">
              {paidCount}/{participants.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">납부 완료</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">
              {collectedAmount > 0 ? `${collectedAmount.toLocaleString("ko-KR")}원` : "-"}
            </p>
            <p className="text-xs text-gray-400 mt-1">수납 금액</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">납부 현황</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-50">
              <th className="px-4 py-2 text-left font-medium">이름</th>
              <th className="px-4 py-2 text-left font-medium">학교</th>
              <th className="px-4 py-2 text-center font-medium">납부여부</th>
              <th className="px-4 py-2 text-center font-medium">환불계좌</th>
              <th className="px-4 py-2 text-center font-medium">환불완료</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {participants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-300 text-xs">
                  참여자가 없습니다.
                </td>
              </tr>
            )}
            {participants.map((gp) => (
              <tr key={gp.participant_id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-gray-900">
                  {gp.participant?.name ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-500">
                  {gp.participant?.school ?? "-"}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => handleTogglePaid(gp)}
                    disabled={loading}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-60 ${
                      gp.fee_paid
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {gp.fee_paid ? "납부" : "미납"}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-center">
                  {editingRefund === gp.participant_id ? (
                    <div className="flex gap-1 justify-center">
                      <input
                        autoFocus
                        value={refundInput}
                        onChange={(e) => setRefundInput(e.target.value)}
                        placeholder="은행/계좌번호"
                        className="text-xs border border-gray-200 rounded px-2 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      />
                      <button
                        onClick={() => handleSaveRefund(gp.participant_id)}
                        disabled={loading}
                        className="text-xs text-indigo-600 font-medium disabled:opacity-60"
                      >
                        저장
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openRefundEdit(gp)}
                      className="text-xs text-gray-400 hover:text-indigo-600"
                    >
                      {gp.refund_account ?? "입력"}
                    </button>
                  )}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {gp.refund_account ? (
                    <button
                      onClick={() => handleToggleRefunded(gp)}
                      disabled={loading}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-60 ${
                        gp.refunded
                          ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                          : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      }`}
                    >
                      {gp.refunded ? "완료" : "미완료"}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-200">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
