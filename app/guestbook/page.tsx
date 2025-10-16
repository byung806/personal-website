import Link from "next/link";
import { IceCream } from "lucide-react";

export default function GuestbookPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
            <div className="text-center space-y-6 max-w-md">
                {/* Icon */}
                <div className="flex justify-center">
                    <IceCream className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h1 className="text-2xl text-gray-900 font-semibold">
                        Under Construction
                    </h1>
                    <p className="text-sm text-gray-600">
                        The guestbook is currently being built. Check back soon!
                    </p>
                </div>

                {/* Back to Home */}
                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        ← Return home
                    </Link>
                </div>
            </div>
        </div>
    );
}
