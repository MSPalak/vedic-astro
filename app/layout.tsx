import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechPandit — Vedic Astrology · No bluff. Just real stuff.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Marcellus&family=Inter:wght@400;600;700;800&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
