import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidade visual DL (Dental Lead)
        background: "#0A2647",
        surface: {
          DEFAULT: "rgba(255,255,255,0.055)",
          muted: "rgba(255,255,255,0.035)",
        },
        neon: {
          DEFAULT: "#A86017",
          soft: "#C8782A",
          border: "rgba(168,96,23,0.32)",
        },
        content: {
          DEFAULT: "#F8FAFC",
          muted: "#C8D2DE",
        },
        alert: "#FF5A5A",
        warning: "#D9A441",
        event: {
          blue: "#4F9BE8",
          purple: "#B9732A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.18em",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(168,96,23,0.26), 0 0 24px rgba(168,96,23,0.16)",
        "neon-strong": "0 0 0 1px rgba(168,96,23,0.42), 0 0 32px rgba(168,96,23,0.26)",
        card: "0 8px 30px rgba(0,0,0,0.28)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
