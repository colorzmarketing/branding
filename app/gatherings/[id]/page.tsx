import {
  getGathering,
  getGatheringParticipants,
  getGatheringCompanies,
  getGatheringTasks,
  getGatheringMeetings,
  getGatheringSnsChecklist,
  getGatheringArchives,
} from "@/lib/actions/gatherings";
import GatheringDetail from "@/components/gatherings/GatheringDetail";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GatheringDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const [gathering, participants, companies, tasks, meetings, snsItems, archives] =
      await Promise.all([
        getGathering(params.id),
        getGatheringParticipants(params.id),
        getGatheringCompanies(params.id),
        getGatheringTasks(params.id),
        getGatheringMeetings(params.id),
        getGatheringSnsChecklist(params.id),
        getGatheringArchives(params.id),
      ]);

    if (!gathering) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-400">게더링을 찾을 수 없습니다.</p>
          <Link href="/gatherings" className="text-indigo-600 text-sm mt-2 inline-block">
            ← 목록으로
          </Link>
        </div>
      );
    }

    return (
      <GatheringDetail
        gathering={gathering}
        participants={participants}
        companies={companies}
        tasks={tasks}
        meetings={meetings}
        snsItems={snsItems}
        archives={archives}
      />
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return (
      <div className="text-center py-20 space-y-2">
        <p className="text-red-500 font-medium">데이터를 불러오지 못했습니다.</p>
        <p className="text-xs text-gray-400">{msg}</p>
        <Link href="/gatherings" className="text-indigo-600 text-sm inline-block mt-2">
          ← 목록으로
        </Link>
      </div>
    );
  }
}
