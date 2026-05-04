import { getGatherings } from "@/lib/actions/gatherings";
import GatheringList from "@/components/gatherings/GatheringList";

export const dynamic = "force-dynamic";

export default async function GatheringsPage() {
  const gatherings = await getGatherings();
  return <GatheringList gatherings={gatherings} />;
}
