import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700", "800"],
});

const name = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-name",
  weight: "400",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Shahar Band",
  description: "Building something new.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${name.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
