import { GatheringStatus, CompanyStatus } from "@/types";

const GATHERING_COLOR: Record<GatheringStatus, string> = {
  기획중: "bg-yellow-100 text-yellow-700",
  진행중: "bg-blue-100 text-blue-700",
  완료: "bg-green-100 text-green-700",
};

const COMPANY_COLOR: Record<CompanyStatus, string> = {
  신규접촉: "bg-gray-100 text-gray-600",
  협업중: "bg-blue-100 text-blue-700",
  재협업검토: "bg-purple-100 text-purple-700",
  장기파트너: "bg-green-100 text-green-700",
};

export function GatheringBadge({ status }: { status: GatheringStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${GATHERING_COLOR[status]}`}>
      {status}
    </span>
  );
}

export function CompanyBadge({ status }: { status: CompanyStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${COMPANY_COLOR[status]}`}>
      {status}
    </span>
  );
}
