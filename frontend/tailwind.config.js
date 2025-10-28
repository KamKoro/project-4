/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fad7a5',
          300: '#f7ba6d',
          400: '#f49332',
          500: '#f17a0a',
          600: '#e25d00',
          700: '#bb4502',
          800: '#953608',
          900: '#782e0a',
        },
      },
    },
  },
  plugins: [],
}
