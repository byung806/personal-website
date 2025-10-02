import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
    title: "Bryan Yung",
    description: "Personal portfolio of Bryan Yung - Student at Poolesville High School",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${ibmPlexMono.className} antialiased bg-[#1E0033] text-white`}>
                {children}
            </body>
        </html>
    );
}
