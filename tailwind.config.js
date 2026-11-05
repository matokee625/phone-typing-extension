/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E31E24',
          dark: '#c41a1f',
          light: '#fff0f0',
          muted: '#ffd5d5',
        },
      },
    },
  },
  plugins: [],
};
