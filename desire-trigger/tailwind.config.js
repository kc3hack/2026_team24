/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Adding custom colors from spec
        calm: {
          500: '#a78bfa',
        },
        warm: {
          500: '#fb923c',
        },
      }
    },
  },
  plugins: [],
}
