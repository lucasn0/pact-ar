import type { Config } from "tailwindcss";

const config: Config = {
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
        cream: "#F8F7F4",
        ink: "#1C1C1A",
        muted: "#5F5E5A",
        hint: "#888780",
        border: "#D6D3CC",
        green: {
          DEFAULT: "#2C5F2E",
          light: "#EAF3DE",
        },
      },
    },
  },
  plugins: [],
};

export default config;
