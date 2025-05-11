import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import PlausibleProvider from "next-plausible";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

let title = "Master Builder – AI Personal Mentor";
let description = "Build faster with your personal AI mentor for the new stack";
let url = "https://masterbuilder.com/";
let ogimage = "https://masterbuilder.together.ai/og-image.png";
let sitename = "masterbuilder.com";

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <PlausibleProvider domain="masterbuilder.together.ai" />
      </head>

      <body
        className={`${montserrat.className} flex h-full flex-col justify-between text-gray-700 antialiased`}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#FFF6EF] via-[#FFF0E6] to-[#FFE8D9] opacity-80" />
        {children}
      </body>
    </html>
  );
}
