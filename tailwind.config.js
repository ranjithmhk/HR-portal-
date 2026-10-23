/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          pressed: 'var(--primary-pressed)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          300: 'var(--primary-300)',
        },
        zoho: {
          red: '#EE0014',
          'red-hover': '#D60012',
          blue: '#056CB8',
          'blue-hover': '#045897',
          green: '#00A859',
          yellow: '#FED600',
          amber: '#FFB800',
          navy: '#0F2042',
          purple: '#582467',
          gray: '#F8F9FB',
        },
        magenta: {
          DEFAULT: 'var(--magenta)',
          50: 'var(--magenta-50)',
        },
        spark: {
          DEFAULT: 'var(--spark)',
          50: 'var(--spark-50)',
        },
        bg: {
          DEFAULT: 'var(--bg)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
        },
        text: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        status: {
          success: '#00A859',
          'success-bg': '#EDFBF4',
          warning: '#FF9500',
          'warning-bg': '#FFF8EE',
          danger: '#EE0014',
          'danger-bg': '#FDF1F2',
          info: 'var(--primary)',
          'info-bg': 'var(--primary-50)',
        }
      },
      fontFamily: {
        sans: ['"Zoho Puvi"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        heading: ['"Zoho Puvi"', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        puvi: ['"Zoho Puvi"', 'sans-serif'],
      },
      borderRadius: {
        btn: '6px',
        input: '8px',
        modal: '16px',
      },
      boxShadow: {
        popover: '0 12px 32px rgba(0, 0, 0, 0.08)',
        'popover-dark': '0 12px 32px rgba(0, 0, 0, 0.08)',
        zoho: '0 10px 30px rgba(0, 0, 0, 0.07)',
      },
    },
  },
  plugins: [],
};
