import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wedding: {
          cream: "#FDF8F0",
          sage: "#A8B5A0",
          "sage-dark": "#7A8F6F",
          gold: "#C4A35A",
          "gold-light": "#E8D5A8",
          charcoal: "#2C2C2C",
          muted: "#8B8680",
          blush: "#F0E0D6",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Cormorant Garamond", "serif"],
        accent: ["Italiana", "serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 1s ease-out forwards",
        "scale-in": "scaleIn 0.6s ease-out forwards",
        "slide-left": "slideLeft 0.7s ease-out forwards",
        "draw-line": "drawLine 1.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        drawLine: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
