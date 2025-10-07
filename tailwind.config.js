/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#d4af37",
      },
      boxShadow: {
        ring: "0 0 0 6px rgba(199, 168, 31, 0.73)",
      }
    },
  },
  plugins: [],
}
