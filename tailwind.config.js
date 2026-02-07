/** @type {import('tailwindcss').Config} */
module.exports = {
  // ✅ 精准匹配源码目录，不包含 node_modules
  content: [
    // 只扫描 app 目录下的所有目标文件
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // 只扫描 pages 目录下的所有目标文件
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    // 只扫描 components 目录下的所有目标文件
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // 只扫描 src 目录下的所有目标文件（如果有）
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: "#141A29",
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};