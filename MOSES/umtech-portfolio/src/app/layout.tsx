import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UMTECH - Full-Stack Developer & UI/UX Designer",
  description:
    "UMTECH is a cutting-edge technology company specializing in full-stack web development, UI/UX design, and digital innovation. We build modern, scalable, and user-centric digital experiences.",
  keywords: [
    "UMTECH",
    "full-stack developer",
    "UI/UX designer",
    "web development",
    "software engineering",
    "portfolio",
  ],
  authors: [{ name: "UMTECH" }],
  creator: "UMTECH",
  publisher: "UMTECH",
  metadataBase: new URL("https://umtech.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://umtech.dev",
    siteName: "UMTECH",
    title: "UMTECH - Full-Stack Developer & UI/UX Designer",
    description:
      "UMTECH is a cutting-edge technology company specializing in full-stack web development, UI/UX design, and digital innovation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UMTECH Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UMTECH - Full-Stack Developer & UI/UX Designer",
    description:
      "UMTECH is a cutting-edge technology company specializing in full-stack web development, UI/UX design, and digital innovation.",
    images: ["/og-image.png"],
    creator: "@umtech",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans h-full antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
