/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      'blue-0': 'hsla(230, 34%, 27%, 1)',
      'blue-3': 'hsla(241, 13%, 14%, 1)',
    },
    extend: {},
  },
  plugins: [],
};
