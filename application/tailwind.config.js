/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./renderer/UI/**/*.{js,ts,jsx,tsx,mdx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/primereact/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
  },
  safelist:[
    {
      pattern:/grid-cols-./
    },
    { pattern:/h-./}
  ],
  plugins: [],
  darkMode: 'class',
}

