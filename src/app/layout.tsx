import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";
import { I18nProvider } from "@/components/I18nProvider";
import { getLocale } from 'next-intl/server';
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
  userScalable: true,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased min-h-[100dvh] selection:bg-cyan-500/30`}
        suppressHydrationWarning
      >
        <I18nProvider>
          {children}
        </I18nProvider>
        <Toaster
          position="top-center"
          offset={60}
          toastOptions={{
            style: {
              background: 'rgba(10, 15, 26, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              borderRadius: '1rem',
            },
          }}
        />
      </body>
    </html>
  );
}

