import { getParticipants } from "@/lib/actions/participants";
import ParticipantTable from "@/components/participants/ParticipantTable";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const participants = await getParticipants();
  return <ParticipantTable participants={participants} />;
}
