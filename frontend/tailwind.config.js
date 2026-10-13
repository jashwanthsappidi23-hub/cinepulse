/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          bg: '#0B0F19',
          card: '#131926',
          border: '#1E293B',
          red: '#E50914',
          'red-hover': '#B80710',
          gold: '#F59E0B',
          muted: '#94A3B8',
          seat: {
            available: '#10B981', // Emerald green
            booked: '#EF4444',    // Bright red
            selected: '#F59E0B',  // Amber yellow
            locked: '#64748B',    // Slate grey
            vip: '#8B5CF6'
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(229, 9, 20, 0.4)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
      }
    },
  },
  plugins: [],
}
