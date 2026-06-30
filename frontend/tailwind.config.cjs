/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#0071e3", // Apple link/action blue
          "primary-content": "#ffffff",
          secondary: "#86868b", // Apple secondary gray text
          accent: "#34c759", // Apple system green
          neutral: "#1d1d1f", // Apple primary text
          "neutral-content": "#f5f5f7",
          "base-100": "#ffffff", // main background
          "base-200": "#f5f5f7", // sidebar / surface
          "base-300": "#e8e8ed", // hover / tertiary
          "base-content": "#1d1d1f", // primary text
          info: "#0071e3",
          success: "#34c759",
          warning: "#ff9f0a",
          error: "#ff453a", // Apple system red
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--animation-btn": "0.15s",
          "--animation-input": "0.15s",
          "--btn-focus-scale": "0.98",
        },
        dark: {
          primary: "#2997ff", // Apple dark theme blue
          "primary-content": "#ffffff",
          secondary: "rgba(255,255,255,0.55)",
          accent: "#34c759",
          neutral: "#ffffff",
          "neutral-content": "#161617",
          "base-100": "#161617", // Apple dark background
          "base-200": "rgba(29,29,31,0.85)", // translucent surface
          "base-300": "#2d2d2f", // dark tertiary/hover
          "base-content": "rgba(255,255,255,0.92)",
          info: "#2997ff",
          success: "#34c759",
          warning: "#ff9f0a",
          error: "#ff453a",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--animation-btn": "0.15s",
          "--animation-input": "0.15s",
          "--btn-focus-scale": "0.98",
        },
      },
    ],
  },
};
