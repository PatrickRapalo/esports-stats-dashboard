/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0f16',
          800: '#0f1923',
          700: '#162030',
          600: '#1d2d3e',
          500: '#243548',
        },
        accent: {
          red: '#ff4655',
          blue: '#00b4d8',
          green: '#2ecc71',
          yellow: '#f39c12',
          purple: '#9b59b6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
