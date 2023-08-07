/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '375px',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      backgroundColor: {
        default: "#020f14",
        primary: "#F4F4F4",
        dark: "#2c3e4b",
        four: "#10282d",
        blur: "#030303",
      },
      colors: {
        primary: "#2c3e4b",
        secondary: "#020f14",
        four: "#10282d",
        accent: "#E58247",
        third: "#47E582",
        off: "#EBEBEB",
        light: "#02ffa7",
        newthird: "#02ffa7",
        green: "#02ffa7",
      },
      animation: {
        'background-shine': 'background-shine 4s linear infinite',
        'pulse': 'pulse 2s linear infinite',
        'wave': 'wave 1.5s linear infinite',
      },
      keyframes: {
        'background-shine': {
          '0%': { 'backgroundPosition': '0 0' },
          '100%': { 'backgroundPosition': '-170% 0' }
        },
        'pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        'wave': {
          '0%': { transform: 'scale(0.5)', opacity: 0 },
          '50%': { transform: 'scale(1)', opacity: 1 },
          '100%': { transform: 'scale(0.5)', opacity: 0 },
        }
      }
    },
  },
  variants: {
    extend: {
      scale: ['active'],
      transform: ['active']
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
  ],
}