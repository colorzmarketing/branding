"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  GatheringKpi,
  GatheringCompany,
  GatheringParticipant,
  GatheringFormData,
  GatheringTask,
  GatheringMeeting,
  GatheringSnsItem,
  GatheringArchive,
} from "@/types";
import { GatheringBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import GatheringForm from "./GatheringForm";
import AddParticipantModal from "./AddParticipantModal";
import AddCompanyModal from "./AddCompanyModal";
import PipelineTab from "./tabs/PipelineTab";
import TasksTab from "./tabs/TasksTab";
import MeetingsTab from "./tabs/MeetingsTab";
import MembersTab from "./tabs/MembersTab";
import CompaniesTab from "./tabs/CompaniesTab";
import SnsChecklistTab from "./tabs/SnsChecklistTab";
import TemplatesTab from "./tabs/TemplatesTab";
import FeeTab from "./tabs/FeeTab";
import ArchiveTab from "./tabs/ArchiveTab";
import NotesTab from "./tabs/NotesTab";
import { updateGathering } from "@/lib/actions/gatherings";

interface Props {
  gathering: GatheringKpi;
  participants: GatheringParticipant[];
  companies: GatheringCompany[];
  tasks: GatheringTask[];
  meetings: GatheringMeeting[];
  snsItems: GatheringSnsItem[];
  archives: GatheringArchive[];
}

const TABS = [
  { id: "pipeline", label: "파이프라인" },
  { id: "members", label: "참여 멤버" },
  { id: "companies", label: "협력업체" },
  { id: "tasks", label: "구매/준비" },
  { id: "fee", label: "참가비" },
  { id: "meetings", label: "회의록" },
  { id: "sns", label: "SNS" },
  { id: "templates", label: "설문/홍보" },
  { id: "notes", label: "메모" },
  { id: "archive", label: "Archive" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function GatheringDetail({
  gathering,
  participants,
  companies,
  tasks,
  meetings,
  snsItems,
  archives,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");
  const [showEdit, setShowEdit] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);

  async function handleUpdate(data: GatheringFormData) {
    await updateGathering(gathering.id, data);
    setShowEdit(false);
    router.refresh();
  }

  const alreadyParticipantIds = participants.map((gp) => gp.participant_id);
  const alreadyCompanyIds = companies.map((gc) => gc.company_id);

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <Link
            href="/gatherings"
            className="text-xs text-gray-400 hover:text-indigo-600 mb-1.5 inline-block"
          >
            ← 게더링 목록
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {gathering.name}
            <GatheringBadge status={gathering.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {gathering.round ? `${gathering.round}회차` : ""}
            {gathering.round && (gathering.date || gathering.location) ? " · " : ""}
            {gathering.date ?? "날짜 미정"}
            {gathering.location ? ` · ${gathering.location}` : ""}
          </p>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
        >
          수정
        </button>
      </div>

      {/* KPI 요약 배지 */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
          참여자 {gathering.participant_count}명
        </span>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
          협력업체 {gathering.company_count}개
        </span>
        {gathering.fee ? (
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            참가비 {gathering.fee.toLocaleString("ko-KR")}원
          </span>
        ) : null}
        {gathering.profit_rate != null && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              gathering.profit_rate >= 0
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            수익률 {gathering.profit_rate}%
          </span>
        )}
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <div>
        {activeTab === "pipeline" && (
          <PipelineTab gathering={gathering} onRefresh={() => router.refresh()} />
        )}
        {activeTab === "members" && (
          <MembersTab
            gathering={gathering}
            participants={participants}
            onAdd={() => setShowAddParticipant(true)}
            onRefresh={() => router.refresh()}
          />
        )}
        {activeTab === "companies" && (
          <CompaniesTab
            gathering={gathering}
            companies={companies}
            onAdd={() => setShowAddCompany(true)}
            onRefresh={() => router.refresh()}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab gathering={gathering} tasks={tasks} onRefresh={() => router.refresh()} />
        )}
        {activeTab === "fee" && (
          <FeeTab
            gathering={gathering}
            participants={participants}
            onRefresh={() => router.refresh()}
          />
        )}
        {activeTab === "meetings" && (
          <MeetingsTab
            gathering={gathering}
            meetings={meetings}
            onRefresh={() => router.refresh()}
          />
        )}
        {activeTab === "sns" && (
          <SnsChecklistTab
            gathering={gathering}
            items={snsItems}
            onRefresh={() => router.refresh()}
          />
        )}
        {activeTab === "templates" && <TemplatesTab gathering={gathering} />}
        {activeTab === "notes" && (
          <NotesTab gathering={gathering} onRefresh={() => router.refresh()} />
        )}
        {activeTab === "archive" && (
          <ArchiveTab
            gathering={gathering}
            archives={archives}
            onRefresh={() => router.refresh()}
          />
        )}
      </div>

      {/* 모달 */}
      {showEdit && (
        <Modal title="게더링 수정" onClose={() => setShowEdit(false)}>
          <GatheringForm
            initial={gathering}
            onSubmit={handleUpdate}
            onCancel={() => setShowEdit(false)}
          />
        </Modal>
      )}

      {showAddParticipant && (
        <Modal title="참여자 추가" onClose={() => setShowAddParticipant(false)}>
          <AddParticipantModal
            gatheringId={gathering.id}
            alreadyIds={alreadyParticipantIds}
            onClose={() => setShowAddParticipant(false)}
            onAdded={() => router.refresh()}
          />
        </Modal>
      )}

      {showAddCompany && (
        <Modal title="협력업체 연결" onClose={() => setShowAddCompany(false)}>
          <AddCompanyModal
            gatheringId={gathering.id}
            alreadyIds={alreadyCompanyIds}
            onClose={() => setShowAddCompany(false)}
            onAdded={() => router.refresh()}
          />
        </Modal>
      )}
    </div>
  );
}
