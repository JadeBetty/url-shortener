/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "san-serif"],
    },
    extend: {
      colors: {
        "background": "#080904",
        "text": "#EDEFE9"
      }
    }
  },
  plugins: [],
};
