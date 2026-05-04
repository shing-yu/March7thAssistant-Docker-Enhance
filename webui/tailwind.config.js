export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,html}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace'
        ]
      },
      colors: {
        primary: '#8b5cf6',
        'primary-hover': '#7c3aed',
        'bg-deep': '#020617',
        'bg-glass': 'rgba(15, 23, 42, 0.65)',
        'glass-border': 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
};
