import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jyotish — Vedic Astrology Calculator",
  description:
    "Real sidereal (Lahiri) Vedic astrology: Kundli, planets, Vimshottari Dasha and Panchang, powered by Swiss Ephemeris.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
