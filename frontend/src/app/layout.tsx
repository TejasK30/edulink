import { ThemeProvider } from "@/lib/next-theme-provider"
import { AuthProvider } from "@/lib/auth-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { twMerge } from "tailwind-merge"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "Edumanage - Education Management System",
  description: "A comprehensive education management system",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={twMerge(`bg-background ${inter.variable} antialiased`)}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
