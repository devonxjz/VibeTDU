import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";

/* ─── Font Loading via next/font (avoids FOUT, auto-subsets) ───────── */

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

/* ─── Page Metadata ─────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "ChemLab",
  description:
    "Sân chơi kéo-thả mô phỏng phản ứng hoá học 2.5D. Khám phá hợp chất, điều kiện phản ứng và mô phỏng trực quan.",
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

/* ─── Root Layout ────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${plusJakarta.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body
        className="min-h-screen font-sans bg-background text-foreground antialiased selection:bg-primary/20"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
