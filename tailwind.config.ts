import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      inter: ["Inter", "sans-serif"],
      jakarta: ["Plus Jakarta Sans", "sans-serif"],
    },
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        'neon-blue': '#00D4FF',
        'neon-purple': '#8B5CF6',
        'neon-pink': '#F472B6',
        'deep-blue': '#0F172A',
        'glass': 'rgba(255, 255, 255, 0.1)',
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        wrapper: "rgba(0,0,0,0.85)",
        "primary-overlay": "rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 50%, #F472B6 100%)',
        dialog: "url('./images/modalBG.png')",
        "text-primary": "linear-gradient(91deg, #F083C8 -21.8%, #FFF 86.73%)",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        "spin-slow": "spin 3s linear infinite",
        'fade-in': 'fade-in 0.2s ease-in-out'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      backdropBlur: {
        'xs': '2px',
        sm: "10px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2.5xl": "1.5rem",
        "3xl": "3.125rem",
      },
      boxShadow: {
        "wrapper-shadow":
          "0px 4px 40px 0px rgba(34, 255, 255, 0.50) inset, 0px 4px 60px 0px rgba(255, 255, 255, 0.40), 0px 4px 80px 0px rgba(34, 255, 255, 0.50), 0px 60px 100px 0px rgba(12, 14, 18, 0.80)",
        "button-shadow": "0px 12px 18px -3px rgba(34, 255, 255, 0.89)",
        "footer-btn": "0px 4px 30px 0px rgba(34, 255, 255, 0.67)",
      },
      fontSize: {
        xxs: ["0.625rem", "0.625rem"],
        "2xxs": ["0.5rem", "0.5rem"],
        "4.5xl": ["2.5rem", "2.5rem"],
        "6.5xl": ["4rem", "4rem"],
      },
      spacing: {
        17: "4.375rem",
        18: "4.5rem",
        30: "7.5rem",
        52: "13rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;