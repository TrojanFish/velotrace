import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import { Providers } from "@/components/Providers";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "VeloTrace - 公路车骑手每日仪表盘",
  description: "一站式公路车骑手辅助工具，包含穿衣指南、补给规划及器材维护。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VeloTrace",
  },
};

export const viewport: Viewport = {
  themeColor: "#050810",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${inter.variable} antialiased min-h-[100dvh] selection:bg-cyan-500/30`}
      >
        <Providers>
          <div className="relative z-10 max-w-md mx-auto min-h-[100dvh] flex flex-col pt-[calc(env(safe-area-inset-top)+1rem)] pb-32 px-4 overflow-x-hidden">
            {children}
          </div>
          <Navigation />
        </Providers>
      </body>
    </html>
  );
}
