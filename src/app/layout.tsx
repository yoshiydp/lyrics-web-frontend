import type { Metadata } from "next";
import { Geist, Geist_Mono, Qwigley } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const qwigley = Qwigley({
  variable: "--font-qwigley",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Lyrics",
  description: "Your Music. Your Words.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${qwigley.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
