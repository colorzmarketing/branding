"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "대시보드", icon: "📊", exact: true },
      { href: "/gatherings", label: "게더링 목록", icon: "🎉", exact: false },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/participants", label: "고객(참가자)", icon: "👥", exact: false },
      { href: "/companies", label: "협력업체", icon: "🏢", exact: false },
    ],
  },
  {
    label: "기타",
    items: [
      { href: "/archive", label: "Archive", icon: "📁", exact: false },
      { href: "/stats", label: "통계/리포트", icon: "📈", exact: false },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-white border-r border-gray-200 flex flex-col z-10">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight text-indigo-600">Colorz</span>
        <p className="text-xs text-gray-400 mt-0.5">브랜딩팀 운영 플랫폼</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2025 Colorz</p>
      </div>
    </aside>
  );
}
