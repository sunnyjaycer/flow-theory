/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': 'hsla(220, 94%, 45%, 1)',
        'brand-purple': 'hsla(266, 100%, 59%, 1)',
        'superfluid-accent': 'hsla(126, 99%, 36%, 1)',
        'blue--3': 'hsla(238, 14%, 70%, 1)',
        'blue-0': 'hsla(230, 34%, 27%, 1)',
        'blue-3': 'hsla(241, 13%, 14%, 1)',
        background: 'hsla(238, 12%, 11%, 1)',
      },
    },
  },
  plugins: [],
};
