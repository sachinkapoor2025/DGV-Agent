import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DGV AI Business OS",
  description:
    "AI COO operating system for Divit Global Ventures — UsaRakhi, Blossompot, SpicyCenter, HalloweenReady.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body
        className="min-h-full"
        style={
          {
            ["--font-body" as string]: "var(--font-sora)",
            ["--font-display" as string]: "var(--font-fraunces)",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
