import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AnalysisProvider } from '@/lib/AnalysisContext';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Meeting Analytics Platform",
  description: "AI-powered meeting analytics platform for better team collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AnalysisProvider>
          <Providers>
            <div className={`${inter.variable} antialiased`}>
              {children}
            </div>
          </Providers>
        </AnalysisProvider>
      </body>
    </html>
  );
}
