/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired color system
        primary: '#007AFF',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        
        // Neutral colors matching Apple specifications
        black: '#000000',
        gray: {
          900: '#1C1C1E',
          800: '#3A3A3C',
          600: '#8E8E93',
          400: '#C7C7CC',
          100: '#F2F2F7',
        },
        white: '#FFFFFF',
        background: '#FAFAFA',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.5' }],     // 14px
        'base': ['1rem', { lineHeight: '1.5' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.5' }],     // 18px
        'xl': ['1.5rem', { lineHeight: '1.2' }],       // 24px
        '2xl': ['2rem', { lineHeight: '1.2' }],        // 32px
        '3xl': ['3rem', { lineHeight: '1.2' }],        // 48px
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: {
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '4': '1rem',      // 16px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
      },
      borderRadius: {
        'sm': '0.75rem',   // 12px
        'md': '1rem',      // 16px
        'lg': '1.25rem',   // 20px
      },
      boxShadow: {
        // Apple elevation system
        'level-0': 'none',
        'level-1': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'level-2': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'level-3': '0 8px 24px rgba(0, 0, 0, 0.15)',
        // Glassmorphism shadows
        'glass': '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 0 rgba(255, 255, 255, 0.3) inset',
        'glass-strong': '0 8px 32px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
        'glass-dropdown': '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.4) inset',
        'glass-sidebar': '2px 0 16px rgba(0, 0, 0, 0.05), 1px 0 0 rgba(255, 255, 255, 0.3) inset',
        'glass-tooltip': '0 4px 16px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ease-in-out': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      },
    },
  },
  plugins: [],
}
