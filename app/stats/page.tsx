import { getGatherings } from "@/lib/actions/gatherings";
import { getDashboardSummary } from "@/lib/actions/participants";
import KpiCard from "@/components/ui/KpiCard";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [gatherings, summary] = await Promise.all([
    getGatherings(),
    getDashboardSummary(),
  ]);

  const completed = gatherings.filter((g) => g.status === "완료");
  const avgParticipants =
    completed.length > 0
      ? Math.round(
          completed.reduce((s, g) => s + (g.participant_count ?? 0), 0) /
            completed.length
        )
      : null;

  const schoolMap: Record<string, number> = {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">통계/리포트</h1>
      <p className="text-sm text-gray-500 mb-6">
        전체 게더링 운영 현황 요약 ({gatherings.length}개 게더링)
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="누적 참여자"
          value={`${summary?.total_participants ?? 0}명`}
          sub="전체 게더링 합산"
          icon="👥"
          color="indigo"
        />
        <KpiCard
          label="완료 게더링"
          value={`${summary?.completed_gatherings ?? 0}회`}
          sub={`전체 ${summary?.total_gatherings ?? 0}회`}
          icon="✅"
          color="green"
        />
        <KpiCard
          label="평균 참여자"
          value={avgParticipants ? `${avgParticipants}명` : "-"}
          sub="완료 게더링 기준"
          icon="📊"
          color="blue"
        />
        <KpiCard
          label="평균 수익률"
          value={
            summary?.avg_profit_rate != null
              ? `${summary.avg_profit_rate}%`
              : "-"
          }
          sub="완료 게더링 기준"
          icon="📈"
          color="purple"
        />
      </div>

      {/* 게더링별 수익률 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">게더링별 현황</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 text-left font-medium">게더링명</th>
                <th className="pb-2 text-right font-medium">참여자</th>
                <th className="pb-2 text-right font-medium">추천비율</th>
                <th className="pb-2 text-right font-medium">수익</th>
                <th className="pb-2 text-right font-medium">비용</th>
                <th className="pb-2 text-right font-medium">수익률</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gatherings.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="py-2.5 font-medium text-gray-900">{g.name}</td>
                  <td className="py-2.5 text-right text-gray-700">
                    {g.participant_count}명
                  </td>
                  <td className="py-2.5 text-right text-gray-700">
                    {g.referral_rate}%
                  </td>
                  <td className="py-2.5 text-right text-gray-700">
                    {g.revenue > 0
                      ? `${g.revenue.toLocaleString("ko-KR")}원`
                      : "-"}
                  </td>
                  <td className="py-2.5 text-right text-gray-700">
                    {g.cost > 0
                      ? `${g.cost.toLocaleString("ko-KR")}원`
                      : "-"}
                  </td>
                  <td className="py-2.5 text-right">
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
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        더 상세한 통계(학교 분포, 재참여율, SNS 완료율 등)는 추후 업데이트 예정입니다.
      </p>
    </div>
  );
}
