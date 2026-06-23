import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Script Studio — Reverse-Engineer Viral Videos, Write Better Scripts",
  description:
    "AI-powered platform that decodes the retention architecture of high-performing videos and generates original, high-retention scripts in minutes. Stop guessing what goes viral — reverse-engineer it.",
  keywords: [
    "AI script writer",
    "video script generator",
    "content creator tools",
    "viral video analysis",
    "retention analysis",
    "hook generator",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
