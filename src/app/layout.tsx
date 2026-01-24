import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "공공기관 채용정보 | Public Job Portal",
  description: "공공데이터포털 API를 활용한 실시간 공공기관 채용정보 서비스",
  keywords: ["공공기관", "채용", "취업", "공채", "공무원", "공기업"],
  openGraph: {
    title: "공공기관 채용정보",
    description: "공공데이터포털 API를 활용한 실시간 공공기관 채용정보 서비스",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
