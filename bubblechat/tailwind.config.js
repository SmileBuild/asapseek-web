/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F2',
        'paper-soft': '#F2EEE3',
        'paper-deep': '#E9E3D2',
        ink: {
          DEFAULT: '#16140F',
          strong: '#0B0A07',
          soft: '#3D3A33',
          mute: '#7A766C',
          faint: '#A8A498',
        },
        accent: {
          DEFAULT: '#4D6BFE',
          violet: '#8B5CF6',
          deep: '#2C3FBF',
        },
        signal: {
          warn: '#D97757',
          good: '#3B7A57',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        sans: ['Inter', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace'],
      },
      maxWidth: {
        canvas: '1240px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
};
