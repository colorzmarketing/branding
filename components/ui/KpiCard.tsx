interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  color?: "indigo" | "green" | "blue" | "purple";
}

const COLOR_MAP = {
  indigo: "bg-indigo-50 text-indigo-600",
  green: "bg-green-50 text-green-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
};

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  color = "indigo",
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <span className={`text-xl p-2 rounded-lg ${COLOR_MAP[color]}`}>
            {icon}
          </span>
        )}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
