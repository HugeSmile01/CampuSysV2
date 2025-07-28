/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js",
    "./JavaScript/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        dark: {
          100: '#1f2937',
          200: '#374151',
          300: '#4b5563',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}