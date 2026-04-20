/** @type {import('tailwindcss').Config} */
// Configuração do Tailwind CSS para o projeto 
module.exports = {
  // Define quais arquivos o Tailwind deve monitorar para gerar classes
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Paleta de cores da identidade visual Saúde+
      colors: {
        "azul-saude": {
          claro: "#60A5FA",   // Azul principal (botões, destaques)
          medio: "#3B82F6",   // Azul médio (hover)
          escuro: "#1D4ED8",  // Azul escuro (textos importantes)
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
