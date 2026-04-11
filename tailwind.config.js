/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        wed: {
          primary: "#2d2d2d",
          "primary-light": "#3d3d3d",
          accent: "#C28B84",
          "accent-light": "#E5D5D2",
          "accent-lighter": "#F5EDEB",
          bg: "#F8F4F2",
        },
      },
    },
  },
  plugins: [],
};
