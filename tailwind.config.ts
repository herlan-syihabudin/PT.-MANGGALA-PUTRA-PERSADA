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
        gold: "#C9A24D",
        goldDark: "#A8842D",
        goldSoft: "#F5EEDC",
      },
    },
  },

  plugins: [require("@tailwindcss/typography")],
}
