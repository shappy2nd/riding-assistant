import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "내 라이딩 비서", description: "카카오 지도와 함께 오늘의 안전한 라이딩을 준비하세요.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
