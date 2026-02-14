import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Bryan Yung, Software",
    description: "Currently a CS student at CMU. Interested in 3D, AI, design.",
    icons: {
        icon: "/favicon.ico",
    },
};

import HeroSection from "@/components/hero-section";
import PageTransition from "@/components/page-transition";
import FooterWrapper from "@/components/footer-wrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preload" href="/runway.png" as="image" />
                <link rel="preload" href="/umd_eeg_tsne.png" as="image" />
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900 min-h-screen flex flex-col`}>
                <ThemeProvider>
                    <HeroSection />
                    <PageTransition>
                        <div className="flex-1">
                            {children}
                        </div>
                    </PageTransition>
                    <FooterWrapper />
                </ThemeProvider>
            </body>
            {process.env.NEXT_PUBLIC_GA_ID ? (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            ) : null}
        </html>
    );
}
