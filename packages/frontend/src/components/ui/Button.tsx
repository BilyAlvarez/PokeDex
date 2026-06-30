import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-pokedex-red text-white hover:bg-pokedex-dark active:scale-95',
  secondary: 'bg-pokedex-cyan text-white hover:bg-[#0090b0] active:scale-95',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
  ghost: 'bg-transparent text-charcoal hover:bg-cream active:scale-95',
}

const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`font-semibold rounded-lg transition-all duration-150 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
