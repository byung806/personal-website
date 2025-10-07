"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

export default function NotFound() {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-bg text-text flex flex-col justify-center items-center">
            <div className="text-center space-y-8">
                {/* Big 404 */}
                <h1 className="text-9xl font-bold text-brand">
                    404
                </h1>

                {/* Error Message */}
                <div className="space-y-4">
                    <p className="text-xl">
                        page not found
                    </p>
                    <p className="text-lg text-subtext">
                        looks like you've wandered into the void
                    </p>
                </div>

                {/* Back to Home */}
                <div className="pt-8">
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 rounded-lg border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300"
                    >
                        return home
                    </Link>
                </div>
            </div>
        </div>
    );
}