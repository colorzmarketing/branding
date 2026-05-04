import { GatheringStatus, CompanyStatus } from "@/types";

const GATHERING_COLOR: Record<GatheringStatus, string> = {
  기획중: "bg-yellow-100 text-yellow-700",
  진행중: "bg-blue-100 text-blue-700",
  완료: "bg-green-100 text-green-700",
};

const COMPANY_COLOR: Record<CompanyStatus, string> = {
  미컨택: "bg-gray-100 text-gray-500",
  컨택중: "bg-yellow-100 text-yellow-700",
  협의중: "bg-blue-100 text-blue-700",
  계약완료: "bg-green-100 text-green-700",
  종료: "bg-red-50 text-red-500",
};

export function GatheringBadge({ status }: { status: GatheringStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${GATHERING_COLOR[status]}`}
    >
      {status}
    </span>
  );
}

export function CompanyBadge({ status }: { status: CompanyStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${COMPANY_COLOR[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
}
