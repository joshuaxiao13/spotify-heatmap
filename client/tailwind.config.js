/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        modal: 'rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
