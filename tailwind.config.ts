import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./ui/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                heading: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
                sans: ['var(--font-sans)', 'Inter', 'ui-sans-serif', 'system-ui'],
                serif: ['Libre Baskerville', 'ui-serif', 'Georgia', 'serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
            },
            colors: {
                bg: {
                    DEFAULT: '#F7F4F2',
                    dark: '#0B0C10',
                },
                card: {
                    DEFAULT: '#FFFFFF',
                    dark: '#111318',
                },
                border: {
                    DEFAULT: '#E8E2DE',
                    dark: '#22252D',
                },
                muted: {
                    DEFAULT: '#F1ECE9',
                    dark: '#151822',
                },
                text: {
                    DEFAULT: '#101828',
                    dark: '#ECEFF4',
                },
                subtext: {
                    DEFAULT: '#475569',
                    dark: '#A7B1C1',
                },
                accent: {
                    DEFAULT: '#EDECF8',
                    dark: '#1D2330',
                },
                teal: '#6FD7C4',        // tall project tile bg
                pink: '#F7B8C8',        // supporting decorative shape
                brand: '#001f3f'         // Bryan's navy (used sparingly for links/icons)
            },
            boxShadow: {
                soft: '0 1px 1px rgba(16,24,40,0.04), 0 10px 20px rgba(16,24,40,0.04)',
            },
            borderRadius: {
                xl2: '1.25rem',  // 20px
                xl3: '1.5rem',   // 24px — main card radius
                pill: '9999px'
            },
            spacing: {
                13: '3.25rem',
                18: '4.5rem'
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.3s ease-out',
            },
        }
    },
    plugins: [],
};
export default config;
