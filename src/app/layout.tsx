import type { Metadata } from "next";
import "./globals.css";
import { weddingConfig } from "@/data/wedding-config";

export const metadata: Metadata = {
  title: `Свадьба ${weddingConfig.bride} & ${weddingConfig.groom}`,
  description: `Приглашение на свадьбу — ${weddingConfig.date}`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="noise-overlay">{children}</body>
    </html>
  );
}
