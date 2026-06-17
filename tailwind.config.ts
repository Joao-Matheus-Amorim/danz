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
        background: "#050A07",
        surface: {
          DEFAULT: "rgba(255,255,255,0.04)",
          muted: "rgba(255,255,255,0.025)",
        },
        neon: {
          DEFAULT: "#B6FF00",
          soft: "#A3FF12",
          border: "rgba(182,255,0,0.18)",
        },
        content: {
          DEFAULT: "#F5F7F2",
          muted: "#A1A89A",
        },
        alert: "#FF3B3B",
        warning: "#FFD43B",
        event: {
          blue: "#2F8CFF",
          purple: "#A855F7",
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
        neon: "0 0 0 1px rgba(182,255,0,0.18), 0 0 24px rgba(182,255,0,0.12)",
        "neon-strong": "0 0 0 1px rgba(182,255,0,0.35), 0 0 32px rgba(182,255,0,0.22)",
        card: "0 8px 30px rgba(0,0,0,0.35)",
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
