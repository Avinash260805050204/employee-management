/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        steel: {
          50: '#f4f6fa',
          100: '#e9edf5',
          200: '#cbd5e7',
          300: '#9eb2d1',
          400: '#6a89b8',
          500: '#47699d',
          600: '#36507c',
          700: '#2c4064',
          800: '#263753',
          900: '#222f46',
          950: '#172030'
        },
        industrial: {
          orange: '#f97316',
          amber: '#f59e0b',
          dark: '#0f172a',
          card: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
