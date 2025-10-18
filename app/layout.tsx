import type { Metadata } from "next";
import { Sora, DM_Sans, Libre_Baskerville, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

const sora = Sora({
    subsets: ["latin"],
    variable: "--font-heading",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
});

const libreBaskerville = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "Bryan Yung, Software",
    description: "Currently a CS student at CMU. Interested in 3D, AI, design.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className={`${sora.variable} ${dmSans.variable} ${libreBaskerville.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white dark:bg-[#0F0F0F] text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
