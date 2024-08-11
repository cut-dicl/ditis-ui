module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    'postcss-import': {},
    tailwindcss: {
      config: './renderer/tailwind.config.js',
    },
    autoprefixer: {},
  },
}
