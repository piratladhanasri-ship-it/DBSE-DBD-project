export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F3F5F9',
          100: '#E4E9F2',
          200: '#C6CFDE',
          300: '#9AAAC4',
          400: '#5E749B',
          500: '#39527D',
          600: '#223C63',
          700: '#152C4C',
          800: '#0E1F38',
          900: '#0A1628',
        },
        gold: {
          50: '#FBF7EA',
          100: '#F5ECCE',
          200: '#E8D69B',
          300: '#DCC169',
          400: '#CFAC3C',
          500: '#B08D25',
          600: '#8C6E1B',
        },
        ink: '#111827',
        mist: '#F7F8FA',
        line: '#E6E9EF',
        positive: '#2F7A5B',
        negative: '#B4453C',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10, 22, 40, 0.04), 0 1px 8px rgba(10, 22, 40, 0.04)',
        pop: '0 8px 28px rgba(10, 22, 40, 0.10)',
      },
      maxWidth: {
        shell: '1240px',
      },
    },
  },
  plugins: [],
};
