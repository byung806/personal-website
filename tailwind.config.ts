import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./ui/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'serif': ['Libre Baskerville', 'serif'],
                'sans': ['Inter', 'sans-serif'],
            },
            animation: {
                fadeIn: "fadeIn 0.5s ease-in forwards",
                fadeInUp: "fadeInUp 0.8s ease-out forwards",
                float: "float 3s ease-in-out infinite",
                glow: "glow 2s ease-in-out infinite",
                infiniteScroll: 'infinite-scroll 25s linear infinite',
                bounce: 'bounce 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" }
                },
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" }
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" }
                },
                glow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.1)" },
                    "50%": { boxShadow: "0 0 30px rgba(99, 102, 241, 0.2)" }
                },
                infiniteScroll: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-100%)' },
                }
            },
            colors: {
                'cream': '#fefefe',
                'accent': '#6366f1',
                'accent-light': '#818cf8',
                'accent-dark': '#4f46e5',
            },
            maxWidth: {
                'content': '60%',
                'content-mobile': '90%',
            }
        }
    },
    plugins: [],
};
export default config;
