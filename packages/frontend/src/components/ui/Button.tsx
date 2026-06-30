import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-[#CC1F1F] text-white hover:bg-[#8E1212] active:scale-95',
  secondary: 'bg-[#00B4D8] text-white hover:bg-[#0090b0] active:scale-95',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
  ghost: 'bg-transparent text-[#2D2D2D] hover:bg-[#E8E0D0] active:scale-95',
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
