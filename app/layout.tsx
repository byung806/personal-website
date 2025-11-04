import type { Metadata } from "next";
import { Sora, DM_Sans, Libre_Baskerville, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

const sora = Sora({
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const libreBaskerville = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-serif",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Bryan Yung, Software",
    description: "Currently a CS student at CMU. Interested in 3D, AI, design.",
};

import HeroSection from "@/components/hero-section";
import PageTransition from "@/components/page-transition";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${sora.variable} ${dmSans.variable} ${libreBaskerville.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
                <ThemeProvider>
                    <HeroSection />
                    <PageTransition>
                        {children}
                    </PageTransition>
                </ThemeProvider>
            </body>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
        </html>
    );
}
