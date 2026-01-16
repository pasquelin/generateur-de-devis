import { type ButtonHTMLAttributes, type ReactNode } from 'react'

import { cn } from '../utils/cn.util.ts'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    error: 'btn-error',
  }

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }

  return (
    <button className={cn('btn', variantClasses[variant], sizeClasses[size], className)} {...props}>
      {children}
    </button>
  )
}
