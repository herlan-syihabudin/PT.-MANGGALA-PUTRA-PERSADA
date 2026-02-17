/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#C9A24D",       // corporate soft gold
        goldDark: "#A8842D",   // darker accent (hover / border)
        goldSoft: "#F5EEDC",   // very subtle background
        darkMode: "class",
      },
    },
  },
  plugins: [],
}
