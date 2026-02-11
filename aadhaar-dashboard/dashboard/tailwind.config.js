/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                orbitron: ['"Orbitron"', 'sans-serif'],
            },
            colors: {
                'dark-bg': '#0a0a0a',
                'dark-card': '#111111',
                'accent-red': '#ef4444',
                'accent-blue': '#3b82f6',
            },
            backdropBlur: {
                'glass': '12px',
            },
        },
    },
    plugins: [],
}
