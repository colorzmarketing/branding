"use client";

import { useState } from "react";
import type { GatheringKpi, GatheringMeeting, GatheringMeetingFormData } from "@/types";
import {
  createGatheringMeeting,
  updateGatheringMeeting,
  deleteGatheringMeeting,
} from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  meetings: GatheringMeeting[];
  onRefresh: () => void;
}

const EMPTY_FORM: Omit<GatheringMeetingFormData, "gathering_id"> = {
  meeting_date: "",
  attendees: "",
  content: "",
};

export default function MeetingsTab({ gathering, meetings, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

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

  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(m: GatheringMeeting) {
    setEditId(m.id);
    setForm({
      meeting_date: m.meeting_date ?? "",
      attendees: m.attendees ?? "",
      content: m.content ?? "",
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: GatheringMeetingFormData = {
      gathering_id: gathering.id,
      meeting_date: form.meeting_date || null,
      attendees: form.attendees || null,
      content: form.content || null,
    };

    await run(async () => {
      if (editId) {
        await updateGatheringMeeting(editId, gathering.id, payload);
      } else {
        await createGatheringMeeting(payload);
      }
      handleCancel();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("회의록을 삭제할까요?")) return;
    run(() => deleteGatheringMeeting(id, gathering.id));
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">회의록</h2>
        <button
          onClick={openNew}
          className="text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
        >
          + 회의록 추가
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 p-5 bg-indigo-50 rounded-xl border border-indigo-100 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">날짜</label>
              <input
                type="date"
                value={form.meeting_date ?? ""}
                onChange={(e) => setForm({ ...form, meeting_date: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">참여 멤버</label>
              <input
                placeholder="예: 김철수, 이영희"
                value={form.attendees ?? ""}
                onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">회의 내용</label>
            <textarea
              rows={6}
              placeholder="회의 내용을 입력하세요..."
              value={form.content ?? ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-white"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {editId ? "수정" : "추가"}
            </button>
          </div>
        </form>
      )}

      {meetings.length === 0 && !showForm && (
        <div className="py-16 text-center text-gray-300 text-sm">
          회의록이 없습니다. 추가해 보세요.
        </div>
      )}

      <div className="space-y-4">
        {meetings.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-xl border border-gray-100 p-5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-3 items-center flex-wrap">
                {m.meeting_date && (
                  <span className="text-sm font-medium text-gray-900">
                    {m.meeting_date}
                  </span>
                )}
                {m.attendees && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                    {m.attendees}
                  </span>
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(m)}
                  className="text-xs text-indigo-400 hover:text-indigo-600"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={loading}
                  className="text-xs text-red-300 hover:text-red-500 disabled:opacity-30"
                >
                  삭제
                </button>
              </div>
            </div>
            {m.content && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {m.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
