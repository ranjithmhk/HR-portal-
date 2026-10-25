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
        apple: {
          blue: '#0071E3',
          'blue-hover': '#0077ED',
          darkBlue: '#2997FF',
          gray: '#F5F5F7',
          charcoal: '#1D1D1F',
          secondary: '#6E6E73',
          border: '#D2D2D7',
        },
        zoho: {
          red: '#EE0014',
          'red-hover': '#D60012',
          blue: '#0071E3',
          'blue-hover': '#0077ED',
          green: '#34C759',
          yellow: '#FF9500',
          amber: '#FF9500',
          navy: '#1D1D1F',
          purple: '#AF52DE',
          gray: '#F5F5F7',
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
          success: '#34C759',
          'success-bg': '#EBF9EE',
          warning: '#FF9500',
          'warning-bg': '#FFF8EE',
          danger: '#FF3B30',
          'danger-bg': '#FFF2F2',
          info: 'var(--primary)',
          'info-bg': 'var(--primary-50)',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'sans-serif'],
        apple: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'sans-serif'],
      },
      borderRadius: {
        btn: '9999px',
        input: '10px',
        modal: '20px',
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
