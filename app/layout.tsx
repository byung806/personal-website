import type { Metadata } from "next";
import { Sora, Inter, Libre_Baskerville, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";

const sora = Sora({
    subsets: ["latin"],
    variable: "--font-heading",
});

const inter = Inter({
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
        <html lang="en" suppressHydrationWarning className="bg-bg text-text">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className={`${sora.variable} ${inter.variable} ${libreBaskerville.variable} ${jetbrainsMono.variable} font-sans antialiased bg-bg text-text`}>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
