/** @type {import('tailwindcss').Config} */
// Configuracao do Tailwind CSS para o projeto
module.exports = {
  // Define quais arquivos o Tailwind deve monitorar para gerar classes
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Paleta de cores da identidade visual Saude+
      colors: {
        blue: {
          50: "#e6fafa",
          100: "#c5f2f2",
          200: "#93e3e3",
          300: "#55cfcf",
          400: "#069e9e",
          500: "#058b8b",
          600: "#047575",
          700: "#075e5e",
          800: "#084b4b",
          900: "#083f3f",
          950: "#022828",
        },
        sky: {
          50: "#e6fafa",
          100: "#c5f2f2",
          200: "#93e3e3",
          300: "#55cfcf",
          400: "#069e9e",
          500: "#058b8b",
          600: "#047575",
          700: "#075e5e",
          800: "#084b4b",
          900: "#083f3f",
          950: "#022828",
        },
        "azul-saude": {
          claro: "#069e9e",   // Cor principal (botoes, destaques)
          medio: "#058b8b",   // Hover
          escuro: "#047575",  // Textos importantes
        },
        "cinza-fundo": "#F8FAFC", // Fundo suave das telas
      },
      // Fontes do projeto
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
