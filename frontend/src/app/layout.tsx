import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChemLab — Mô phỏng phản ứng hoá học 2.5D",
  description:
    "Sân chơi kéo-thả mô phỏng phản ứng hoá học 2.5D. Khám phá hợp chất, điều kiện phản ứng và mô phỏng trực quan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen font-sans bg-background text-foreground antialiased selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
