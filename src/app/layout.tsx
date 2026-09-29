import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "設備計算ポケット | 現場ですぐ使える設備計算ツール集",
  description: "設備技術者・施工管理・営業担当者のための、現場ですぐ使える計算ツール集。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
