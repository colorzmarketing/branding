import { getGathering, getGatheringParticipants, getGatheringCompanies } from "@/lib/actions/gatherings";
import GatheringDetail from "@/components/gatherings/GatheringDetail";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GatheringDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const [gathering, participants, companies] = await Promise.all([
      getGathering(params.id),
      getGatheringParticipants(params.id),
      getGatheringCompanies(params.id),
    ]);
    return (
      <GatheringDetail
        gathering={gathering}
        participants={participants}
        companies={companies}
      />
    );
  } catch {
    notFound();
  }
}
