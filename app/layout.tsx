import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";
import localFont from "next/font/local";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

const typeVF = localFont({
    src: "../public/fonts/TypeVF.woff2",
    variable: "--font-sans",
    display: "swap",
});

const typeLight = localFont({
    src: "../public/fonts/Type-Light.woff2",
    variable: "--font-type-light",
    display: "swap",
});

const libreBaskerville = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["normal", "italic"],
    variable: "--font-serif",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Bryan Yung",
    description: "Currently a CS student at CMU. Incoming @ Stripe. Interested in 3D, AI, design.",
    icons: {
        icon: "/favicon.ico",
    },
};

import Navbar from "@/components/navbar";
import PageTransition from "@/components/page-transition";
import FooterWrapper from "@/components/footer-wrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preload" href="/p/runway/runway.png" as="image" />
                <link rel="preload" href="/p/eeg-classification/umd_eeg_tsne.png" as="image" />
                <link rel="icon" href="/favicon.ico" sizes="any" />
            </head>
            <body className={`${typeVF.variable} ${typeLight.variable} ${libreBaskerville.variable} font-sans antialiased bg-white text-gray-900 min-h-screen flex flex-col`}>
                <ThemeProvider>
                    <Navbar />
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
