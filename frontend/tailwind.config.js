/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Set Poppins as default sans-serif
      },
      colors: {
        'bookit-dark': '#4A4A4A',
        'bookit-primary': '#54514A', // Ini yg ada 65% transparancy juga, pakenya nanti 'bg-bookit-primary/65'
        'bookit-bg': '#F7F7F7',
        'bookit-text-medium': '#757575',
        'bookit-divider': '#D9D9D9',
        'bookit-white': '#FFFFFF',
        'bookit-input-bg': '#EDEDED',
        'bookit-border': '#DEE0E3',
        'bookit-bg-light': '#F2F4F7',
      }
    },
  },
  plugins: [],
}

export default config;
