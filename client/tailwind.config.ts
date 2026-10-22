import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kenya: {
          green: "#00853F",
          red: "#BB0000",
          black: "#0b0c10",
          gold: "#f59e0b"
        },
        cyber: {
          dark: "#08090d",
          card: "rgba(18, 22, 34, 0.75)",
          border: "rgba(255, 255, 255, 0.12)",
          neonGreen: "#10b981",
          neonRed: "#ef4444",
          neonYellow: "#facc15"
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'teargas-flicker': 'teargas 2s ease-in-out infinite',
      },
      keyframes: {
        teargas: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
