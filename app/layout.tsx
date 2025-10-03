import type { Metadata } from "next";
import { IBM_Plex_Mono, Press_Start_2P, Crimson_Text } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/ui/components/client-layout";

const ibmPlexMono = IBM_Plex_Mono({ 
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
    title: "Bryan Yung",
    description: "Student at Carnegie Mellon University",
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${ibmPlexMono.className} antialiased`}>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
