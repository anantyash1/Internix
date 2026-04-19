/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        navy: {
          800: '#122040',
          900: '#0B1628',
          950: '#040D1A',
        },
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 8px 25px -4px rgb(0 0 0 / 0.12)',
        'blue':       '0 4px 14px 0 rgb(37 99 235 / 0.25)',
      },
      animation: {
        'fade-up':    'fadeUp 0.35s ease both',
        'fade-in':    'fadeIn 0.22s ease both',
        'scale-in':   'scaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-left': 'slideInLeft 0.22s ease both',
      },
    },
  },
  plugins: [],
};
