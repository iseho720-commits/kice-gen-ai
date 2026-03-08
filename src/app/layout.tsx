import type { Metadata } from "next";
import { Inter, Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nanum-myeongjo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KICE-Gen AI | 수능 비문학 지문 생성기",
  description: "독서량이 아니라 평가원의 논리를 묻습니다. 당신의 관심사로 수능 국어 지문을 생성하세요.",
  keywords: ["수능", "국어", "비문학", "지문", "AI", "KICE", "평가원"],
  openGraph: {
    title: "KICE-Gen AI | 수능 비문학 지문 생성기",
    description: "독서량이 아니라 평가원의 논리를 묻습니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${nanumMyeongjo.variable}`}>
      <body className="font-sans bg-navy text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
