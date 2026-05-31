/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        chronos: {
          bg: '#050810',
          surface: '#0a0f1e',
          border: '#1a2744',
          accent: '#00d4ff',
          green: '#00ff88',
          red: '#ff4466',
          purple: '#cc44ff',
          gold: '#ffaa00',
          muted: '#4a6080',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        'radial-glow': "radial-gradient(ellipse at center, rgba(0,212,255,0.07) 0%, transparent 70%)",
      },
      backgroundSize: {
        'grid-40': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0,212,255,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(0,212,255,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0,212,255,0.3)',
        'glow-md': '0 0 20px rgba(0,212,255,0.4)',
        'glow-lg': '0 0 40px rgba(0,212,255,0.5)',
        'glow-green': '0 0 20px rgba(0,255,136,0.4)',
        'glow-red': '0 0 20px rgba(255,68,102,0.4)',
        'glow-purple': '0 0 20px rgba(204,68,255,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
