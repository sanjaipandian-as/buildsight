import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: { DEFAULT: "#0A0A0F", 50: "#F4F4F6", 100: "#E8E8ED", 200: "#C8C8D4", 300: "#9898AA", 400: "#606070", 500: "#3A3A48", 600: "#252530", 700: "#16161E", 800: "#0E0E14", 900: "#0A0A0F" },
        volt: { DEFAULT: "#C8FF00", 50: "#F6FFD6", 100: "#EEFF99", 200: "#DEFF55", 300: "#C8FF00", 400: "#A8D600", 500: "#88AA00" },
        azure: { DEFAULT: "#0066FF", 50: "#E5EEFF", 100: "#B8CCFF", 200: "#6699FF", 300: "#3377FF", 400: "#0066FF", 500: "#0044CC" },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "scan": "scan 3s linear infinite",
        "pulse-ring": "pulseRing 2s ease-out infinite",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(400%)" } },
        pulseRing: { "0%": { transform: "scale(0.8)", opacity: "1" }, "100%": { transform: "scale(2)", opacity: "0" } },
      },
    },
  },
  plugins: [],
} satisfies Config;
