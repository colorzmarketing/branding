"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "전체현황", icon: "📊" },
  { href: "/gatherings", label: "게더링 목록", icon: "🎉" },
  { href: "/companies", label: "협업기업", icon: "🏢" },
  { href: "/participants", label: "참여자 DB", icon: "👥" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-white border-r border-gray-200 flex flex-col z-10">
      {/* 로고 */}
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight text-indigo-600">Colorz</span>
        <p className="text-xs text-gray-400 mt-0.5">마케팅 학회 CRM</p>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
      </nav>

      {/* 하단 */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2025 Colorz</p>
      </div>
    </aside>
  );
}
