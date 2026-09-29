import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        card: "0 14px 36px rgba(18, 54, 64, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
