import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      keyframes: {
        slide: {
          "0%, 25%": {
            transform: "translateX(100%)",
          },

          "50%,75%,100%": {
            transform: "translateX(0%)",
          },
        },
      },
      animation: {
        slide: "slide 1s ease",
      },
    },
  },
  plugins: [],
} satisfies Config;
