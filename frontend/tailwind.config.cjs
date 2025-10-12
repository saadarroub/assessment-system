/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/main/react/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",  // optional für große Displays
        "4xl": "2160px",  // optional
      },
      colors: {
        "brand-navy":  "#264555",
        "brand-steel": "#56768f",
        "brand-gray":  "#808080",
        "brand-sand":  "#d2c9b9",
        "brand-ice":   "#ebebec",
        "brand-gold":  "#E3BB62",
      },
    },
  },
  plugins: [],
};
