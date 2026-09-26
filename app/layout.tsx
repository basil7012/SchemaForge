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

// Canonical base — always www to match Vercel's primary domain config
const SITE_URL = "https://www.schemaforge.online";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "SchemaForge — SQL to C# & TypeScript Converter",
  description:
    "Convert SQL CREATE TABLE scripts to C# POCO, TypeScript interfaces, Mock JSON, and SQL Inserts. 100% free, private, and runs entirely in your browser.",
  keywords: [
    "SQL converter",
    "schema to C#",
    "SQL to TypeScript",
    "postgres to csharp",
    "mysql to typescript",
    "mock data generator",
    "DDL converter",
    "free SQL tool",
    "CREATE TABLE converter",
    "SQL schema generator",
  ],
  authors: [{ name: "SchemaForge" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "SchemaForge — SQL to C# & TypeScript Converter",
    description:
      "Convert SQL CREATE TABLE scripts to C# POCO, TypeScript interfaces, and realistic mock data. 100% client-side & private.",
    type: "website",
    url: SITE_URL,
    siteName: "SchemaForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "SchemaForge — SQL to C# & TypeScript Converter",
    description:
      "Convert SQL CREATE TABLE scripts to C# POCO, TypeScript interfaces, and realistic mock data. 100% client-side & private.",
  },
  verification: {
    google: "tRB_DAf4Sx9lHG5MeD9LT5cLucGjvoqZ1d0zABuwjL0",
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
