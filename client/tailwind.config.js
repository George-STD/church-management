/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4fe',
          100: '#dde6fc',
          200: '#c3d3f9',
          300: '#9cbaf5',
          400: '#6e97ef',
          500: '#4a74e7',
          600: '#3457dc',
          700: '#2a43c7',
          800: '#2738a1',
          900: '#1e2b6b',
          950: '#0f172a', // Deep Royal Midnight
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
        traditional: ['Amiri', 'serif'],
      },
    },
  },
  plugins: [],
}
