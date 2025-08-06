import type { Metadata } from "next";
import { Inter, Libre_Baskerville, Fredoka } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const libreBaskerville = Libre_Baskerville({ 
    subsets: ["latin"],
    weight: ["400", "700"]
});
const fredoka = Fredoka({ 
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
            <body className={`${inter.className} antialiased`}>
                {children}
            </body>
        </html>
    );
}
