import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      colors: {
        cream:   "var(--color-cream)",
        ink:     "var(--color-ink)",
        muted:   "var(--color-muted)",
        hint:    "var(--color-hint)",
        border:  "var(--color-border)",
        surface: "var(--color-surface)",
        green: {
          DEFAULT: "var(--color-green)",
          light:   "var(--color-green-light)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
