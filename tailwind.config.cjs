/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Hanken Grotesk", 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
        body: ["Inter", 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
      },
      colors: {
        primary: 'var(--color-primary)',
        'primary-content': 'var(--color-primary-content)',
        secondary: 'var(--color-secondary)',
        'secondary-content': 'var(--color-secondary-content)',
        accent: 'var(--color-accent)',
        'accent-content': 'var(--color-accent-content)',
        neutral: 'var(--color-neutral)',
        'neutral-content': 'var(--color-neutral-content)',
        info: 'var(--color-info)',
        'info-content': 'var(--color-info-content)',
        success: 'var(--color-success)',
        'success-content': 'var(--color-success-content)',
        error: 'var(--color-error)',
        'error-content': 'var(--color-error-content)',
        surface: 'var(--color-surface)',
        'surface-200': 'var(--color-surface-dim)',
        'surface-300': 'var(--color-surface-container)'
      },
      boxShadow: {
        card: 'var(--shadow-card)'
      },
      maxWidth: {
        'site': 'var(--site-max-width)'
      }
    }
  },
  plugins: []
}
