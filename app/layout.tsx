import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RankFlow – SEO Report Automation for Agencies",
  description: "Automate your agency's SEO reporting. Connect SERanking once and generate beautiful, white-labeled PDF and web reports for all your clients — automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0A0F1C] text-white">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
