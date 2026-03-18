import { getDashboardSummary } from "@/lib/actions/participants";
import { getGatherings } from "@/lib/actions/gatherings";
import KpiCard from "@/components/ui/KpiCard";
import { GatheringBadge } from "@/components/ui/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

function fmt(n: number | null | undefined, unit = "") {
  if (n == null) return "-";
  return n.toLocaleString("ko-KR") + unit;
}

export default async function DashboardPage() {
  const [summary, gatherings] = await Promise.all([
    getDashboardSummary(),
    getGatherings(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">전체현황</h1>
      <p className="text-sm text-gray-500 mb-6">Colorz 마케팅 학회 CRM 대시보드</p>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="누적 참여자"
          value={fmt(summary?.total_participants)}
          sub="전체 게더링 합산"
          icon="👥"
          color="indigo"
        />
        <KpiCard
          label="게더링 수"
          value={fmt(summary?.total_gatherings)}
          sub={`완료 ${summary?.completed_gatherings ?? 0}회`}
          icon="🎉"
          color="blue"
        />
        <KpiCard
          label="협업기업 수"
          value={fmt(summary?.total_companies)}
          sub="누적 파트너"
          icon="🏢"
          color="purple"
        />
        <KpiCard
          label="평균 수익률"
          value={
            summary?.avg_profit_rate != null
              ? `${summary.avg_profit_rate}%`
              : "-"
          }
          sub="완료된 게더링 기준"
          icon="📈"
          color="green"
        />
      </div>

      {/* 게더링 목록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">게더링 목록</h2>
          <Link
            href="/gatherings"
            className="text-sm text-indigo-600 hover:underline"
          >
            전체보기 →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs">
                <th className="px-6 py-3 text-left font-medium">게더링명</th>
                <th className="px-6 py-3 text-left font-medium">상태</th>
                <th className="px-6 py-3 text-left font-medium">날짜</th>
                <th className="px-6 py-3 text-right font-medium">참여자</th>
                <th className="px-6 py-3 text-right font-medium">추천비율</th>
                <th className="px-6 py-3 text-right font-medium">수익률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gatherings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    게더링이 없습니다.
                  </td>
                </tr>
              )}
              {gatherings.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <Link
                      href={`/gatherings/${g.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {g.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <GatheringBadge status={g.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {g.date ?? "-"}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-700">
                    {g.participant_count}명
                  </td>
                  <td className="px-6 py-3 text-right text-gray-700">
                    {g.referral_rate}%
                  </td>
                  <td className="px-6 py-3 text-right">
                    {g.profit_rate != null ? (
                      <span
                        className={
                          g.profit_rate >= 0
                            ? "text-green-600 font-medium"
                            : "text-red-500 font-medium"
                        }
                      >
                        {g.profit_rate}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
