/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14B8A6',
          light: '#2DD4BF',
        },
        default: {
          DEFAULT: '#F9F9F9',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}

