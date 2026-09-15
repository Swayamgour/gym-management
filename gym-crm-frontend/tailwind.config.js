/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#171B26',
          50: '#F4F5F7',
          100: '#E3E5EA',
          200: '#C3C7D1',
          300: '#9BA1B0',
          400: '#6E7488',
          500: '#4C5165',
          600: '#363B4C',
          700: '#262A38',
          800: '#1B1E29',
          900: '#12172A'
        },
        paper: '#F5F6F1',
        surface: '#FFFFFF',
        brand: {
          DEFAULT: '#E4572E',
          50: '#FDEEE8',
          100: '#FBDCCF',
          200: '#F6B69D',
          300: '#F2916C',
          400: '#ED6B3A',
          500: '#E4572E',
          600: '#C24521',
          700: '#98351A',
          800: '#6E2613',
          900: '#44170C'
        },
        mint: {
          DEFAULT: '#1FA97C',
          50: '#E8F9F2',
          100: '#C7F0E0',
          500: '#1FA97C',
          600: '#158863'
        },
        amber: {
          DEFAULT: '#E8A83C',
          50: '#FDF4E4',
          500: '#E8A83C',
          600: '#C68A28'
        },
        rose: {
          DEFAULT: '#E23E57',
          50: '#FCE9EC',
          500: '#E23E57',
          600: '#C42A42'
        }
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif']
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23,27,38,0.06), 0 8px 24px -12px rgba(23,27,38,0.12)'
      },
      borderRadius: {
        xl2: '1.1rem'
      }
    }
  },
  plugins: []
};
