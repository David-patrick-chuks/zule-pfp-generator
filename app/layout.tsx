import type React from "react"
import "./globals.css"
import { Orbitron, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

// ✅ Full SEO metadata object
export const metadata: Metadata = {
  title: "ZULE Raider PFP Generator",
  description: "Customize your character and rep the $ZULE token with style!",
  generator: "v0.dev",
  keywords: ["ZULE", "meme coin", "PFP Generator", "crypto avatar", "ZULE raiders", "ZULE AI"],
  themeColor: "#000000",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "ZULE Raider PFP Generator",
    description: "Create custom crypto avatars with your own ZULE branding!",
    url: "https://pfp.zuleai.xyz",
    siteName: "ZULE Raider",
    images: [
      {
        url: "/og-image.png", // Make sure to place this image in public folder
        width: 1200,
        height: 630,
        alt: "ZULE Raider PFP Generator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZULE Raider PFP Generator",
    description: "Create custom crypto avatars with your own ZULE branding!",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Optional: add manifest.json if planning PWA support */}
        {/* <link rel="manifest" href="/manifest.json" /> */}
      </head>
      <body className={`${orbitron.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
