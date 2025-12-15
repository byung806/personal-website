import type { Metadata } from "next";
import { Libre_Baskerville, JetBrains_Mono, DM_Serif_Display } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

const libreBaskerville = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-serif",
    display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-display",
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
import Navbar from "@/components/navbar";
import PageTransition from "@/components/page-transition";
import CandyCane from "@/components/candy-cane";
import { SnowfallProvider } from "@/components/snowfall-provider";
import SnowfallWrapper from "@/components/snowfall-wrapper";
import BackgroundProvider from "@/components/background-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preload" href="/runway.png" as="image" />
                <link rel="preload" href="/umd_eeg_tsne.png" as="image" />
            </head>
            <body className={`${libreBaskerville.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable} font-serif antialiased text-gray-900 transition-colors duration-300`}>
                <ThemeProvider>
                    <SnowfallProvider>
                        <BackgroundProvider />
                        <SnowfallWrapper />
                        {/* <CandyCane /> */}
                        <Navbar />
                        <HeroSection />
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </SnowfallProvider>
                </ThemeProvider>
            </body>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
        </html>
    );
}
