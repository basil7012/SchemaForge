import React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  title: 'SQL to C# & TypeScript Converter — SchemaForge',
  description:
    'Convert SQL CREATE TABLE scripts to C#, TypeScript, Python, Java & more. 63 free online tools — PostgreSQL, MySQL, SQLite, SQL Server, Oracle, MariaDB. 100% private, runs in your browser.',
  keywords: [
    "SQL converter",
    "SQL schema generator",
    "schema to C#",
    "SQL to TypeScript",
    "postgres to csharp",
    "mysql to typescript",
    "mock data generator",
    "DDL converter",
    "free SQL tool",
    "CREATE TABLE converter",
    "postgres to python dataclass",
    "mysql to python",
    "SQL to java entity",
    "postgres to go struct",
    "postgres to mysql converter",
    "mysql to postgresql converter",
    "sqlite to postgres",
    "oracle to postgresql",
    "mariadb converter",
    "sql server converter",
    "SQL insert generator",
    "mock JSON generator",
  ],
  authors: [{ name: "SchemaForge" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'SQL to C# & TypeScript Converter — SchemaForge',
    description:
      'Convert SQL CREATE TABLE scripts to C#, TypeScript, Python, Java & more. 63 free tools — 100% private, runs in your browser.',
    type: "website",
    url: SITE_URL,
    siteName: "SchemaForge",
  },
  twitter: {
    card: "summary_large_image",
    title: 'SQL to C# & TypeScript Converter — SchemaForge',
    description:
      'Convert SQL CREATE TABLE scripts to C#, TypeScript, Python, Java & more. 63 free tools — 100% private, runs in your browser.',
  },
  verification: {
    google: "tRB_DAf4Sx9lHG5MeD9LT5cLucGjvoqZldOzABuwjL0",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
