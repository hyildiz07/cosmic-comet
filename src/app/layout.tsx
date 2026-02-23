import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AssistantWidget from "@/components/AssistantWidget";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Site Yönetimi | Çamlıtepe Evleri",
  description: "Site sakinleri iletişim ve yönetim platformu",
};

import PersonaSwitcher from "@/components/PersonaSwitcher";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <SiteProvider>
          <LanguageProvider>
            <Navbar />
            <div className="flex pt-14 justify-center w-full">
              <Sidebar />
              <main className="w-full max-w-[680px] lg:ml-[280px] lg:mr-[280px] min-h-screen px-4 py-6">
                {children}
              </main>
              {/* Right sidebar placeholder (e.g. for events/contacts) */}
              <aside className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-[280px] hidden lg:block overflow-y-auto p-4">
                <h3 className="text-gray-500 font-semibold mb-3">Yaklaşan Etkinlikler</h3>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm font-medium">Bahar Şenliği</p>
                  <p className="text-xs text-gray-500 mt-1">12 Mayıs • Havuz Başı</p>
                </div>
              </aside>
            </div>
            <AssistantWidget />
            <PersonaSwitcher />
          </LanguageProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
