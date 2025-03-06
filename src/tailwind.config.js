module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          'fade-in': 'fadeIn 0.3s ease-in',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          }
        }
      },
    },
    plugins: [require("daisyui"), require('@tailwindcss/forms')],
    daisyui: {
      themes: ["light", "dark", "cupcake"],
    },
  }