import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://schemaforge.dev'
  ),
  title: "SchemaForge — Free SQL Schema Converter & Code Generator",
  description: "Convert SQL CREATE TABLE scripts to C# POCO, TypeScript interfaces, and realistic mock data. 100% free, private, and runs entirely in your browser.",
  keywords: ["SQL converter", "schema to C#", "SQL to TypeScript", "mock data generator", "DDL converter", "free SQL tool"],
  authors: [{ name: "SchemaForge" }],
  openGraph: {
    title: "SchemaForge — Free SQL Schema Converter & Code Generator",
    description: "Convert SQL CREATE TABLE scripts to C# POCO, TypeScript interfaces, and realistic mock data. 100% client-side & private.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://schemaforge.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SchemaForge — Free SQL Schema Converter & Code Generator",
    description: "Convert SQL CREATE TABLE scripts to C# POCO, TypeScript interfaces, and realistic mock data. 100% client-side & private.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950">{children}</body>
    </html>
  );
}
