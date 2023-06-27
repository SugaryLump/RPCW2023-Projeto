/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: ["./views/**/*.pug"],
  theme: {
    extend: {
      colors: {
        primary: colors.cyan,
      }
    },
  },
  plugins: [],
}

