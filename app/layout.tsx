import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Colorz CRM",
  description: "Colorz 마케팅 학회 CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="ml-52 flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
