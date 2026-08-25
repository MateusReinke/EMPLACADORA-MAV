
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				// Famílias exclusivas do site público. `sans` continua intocado para
				// não alterar a tipografia do painel interno.
				display: ['Archivo', 'Archivo Fallback', 'Helvetica Neue', 'Arial', 'sans-serif'],
				body: ['Inter', 'Inter Fallback', 'Helvetica Neue', 'Arial', 'sans-serif'],
			},
			colors: {
				/*
				 * Superfícies do site público. Apontam para as variáveis de
				 * src/index.css, que trocam no tema escuro — por isso os
				 * componentes do site usam `site-*` em vez de `bg-white`.
				 */
				site: {
					bg: 'rgb(var(--site-bg) / <alpha-value>)',
					alt: 'rgb(var(--site-alt) / <alpha-value>)',
					card: 'rgb(var(--site-card) / <alpha-value>)',
					ink: 'rgb(var(--site-ink) / <alpha-value>)',
					line: 'rgb(var(--site-line) / <alpha-value>)',
					accent: 'rgb(var(--site-accent) / <alpha-value>)',
					'accent-soft': 'rgb(var(--site-accent-soft) / <alpha-value>)',
					contrast: 'rgb(var(--site-contrast) / <alpha-value>)',
					'contrast-deep': 'rgb(var(--site-contrast-deep) / <alpha-value>)',
					badge: 'rgb(var(--site-badge) / <alpha-value>)',
					promo: 'rgb(var(--site-promo) / <alpha-value>)',
					'promo-deep': 'rgb(var(--site-promo-deep) / <alpha-value>)',
				},
				// Paleta oficial da marca MAV (material impresso/redes).
				mav: {
					blue: '#0B57E0',
					'blue-dark': '#0847B8',
					'blue-soft': '#E8F0FE',
					navy: '#0A1F44',
					'navy-deep': '#061431',
					'navy-soft': '#12305F',
					surface: '#F5F7FA',
					line: '#DDE4EE',
				},
				whats: {
					DEFAULT: '#25D366',
					dark: '#1DAF54',
				},
				gold: '#FDB813',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				'answer-in': {
					from: { opacity: '0', transform: 'translateY(-4px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'answer-in': 'answer-in 0.24s ease-out',
			},
			boxShadow: {
				'mav-card': '0 1px 2px rgba(10, 31, 68, 0.05), 0 12px 28px -18px rgba(10, 31, 68, 0.35)',
				'mav-card-hover': '0 2px 4px rgba(10, 31, 68, 0.06), 0 26px 46px -22px rgba(11, 87, 224, 0.45)',
				'mav-plate': '0 30px 60px -28px rgba(10, 31, 68, 0.55)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
