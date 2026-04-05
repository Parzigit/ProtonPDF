/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // required for React
  ],
  theme: {
    extend: {
      boxShadow: {
        'pdf-page': '0 2px 8px rgba(0, 0, 0, 0.15)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
