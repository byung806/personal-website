import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
            <div className="text-center space-y-6 max-w-md">
                {/* Big 404 */}
                <h1 className="text-8xl md:text-9xl font-bold text-gray-900">
                    404
                </h1>

                {/* Error Message */}
                <div className="space-y-2">
                    <p className="text-xl text-gray-900 font-semibold">
                        Page not found
                    </p>
                    <p className="text-sm text-gray-600">
                        Looks like you've wandered into the void
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