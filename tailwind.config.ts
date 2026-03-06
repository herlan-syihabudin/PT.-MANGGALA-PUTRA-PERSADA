/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        gold: "#C9A24D",      // corporate gold
        goldDark: "#A8842D",  // hover / accent
        goldSoft: "#F5EEDC",  // soft background
      },
    },
  },

  plugins: [],
}
