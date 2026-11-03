import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ovra: {
          orange: "#FF5C00",
          "orange-dark": "#E04E00",
          cream: "#FAF5EE",
          "cream-light": "#FAF7F2",
          card: "#FFFFFF",
          dark: "#121316",
          "dark-subtle": "#1E1F24",
          "dark-card": "#26282E",
          border: "#E9E4DC",
          "border-dark": "#2A2C33",
          text: "#1D1E20",
          muted: "#71747E",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
        card: "0 10px 30px -5px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        bevel: "0 20px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
      },
    },
  },
  plugins: [],
};

export default config;
