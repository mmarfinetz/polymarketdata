/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: {
            primary: '#0a0a0f',
            secondary: '#12121a',
            panel: '#1a1a24',
            hover: '#22222e',
          },
          border: '#2a2a3a',
          text: {
            primary: '#e8e8e8',
            secondary: '#8888a0',
            muted: '#666680',
          },
          accent: {
            green: '#00d26a',
            red: '#ff3b5c',
            orange: '#ff9500',
            blue: '#0088ff',
            purple: '#8b5cf6',
            cyan: '#00d4ff',
          },
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
