import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        voltix: {
          red: "#DC2626",      // Primary action red
          redDark: "#B91C1C",  // Hover red
          redLight: "#FEF2F2", // Background tint
          amber: "#D97706",    // Electrical accent
          amberDark: "#B45309",
          amberLight: "#FFFBEB",
          dark: "#0F172A",     // Deep slate/black for text & footer
          slate: "#334155",    // Secondary text
          muted: "#64748B",    // Tertiary text / captions
          border: "#E2E8F0",   // Clean subtle borders
          card: "#FFFFFF",     // White cards
          surface: "#F8FAFC",  // Subtle light background
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
    },
  },
  plugins: [],
};
export default config;
