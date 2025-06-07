/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Primary Brand Colors
          brand: {
            blue: {
              500: '#3B82F6',
              600: '#2563EB', 
              700: '#1D4ED8'
            },
            purple: {
              500: '#8B5CF6',
              600: '#7C3AED',
              700: '#6D28D9'
            },
            indigo: {
              500: '#6366F1',
              600: '#4F46E5'
            }
          },
          // Extended color palette for better design consistency
          success: {
            50: '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            500: '#22C55E',
            600: '#16A34A',
            700: '#15803D',
            800: '#166534'
          },
          warning: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309'
          },
          error: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            500: '#EF4444',
            600: '#DC2626',
            700: '#B91C1C'
          },
          info: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE'
          }
        },
        backgroundImage: {
          'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          'gradient-success': 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
          'gradient-light': 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #E0E7FF 100%)',
          'gradient-dark': 'linear-gradient(135deg, #0F172A 0%, #1E40AF 50%, #4338CA 100%)'
        },
        boxShadow: {
          'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
          'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)',
          'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' }
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
          }
        }
      },
    },
    plugins: [],
  }
  