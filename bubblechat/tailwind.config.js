/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html', 
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('tailwind-scrollbar')
  ],
  daisyui: {
    themes: ["light", "dark", "coffee","synthwave", "retro", "cyberpunk", "sunset", "business"],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils:true,
    logs:true,
    rtl: false,
    prefix: '',    
  },
}
