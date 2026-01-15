import { type ReactNode } from 'react'

import { cn } from '../utils/cn'

interface PanelProps {
  children: ReactNode
  title?: string
  className?: string
}

export const Panel = ({ children, title, className }: PanelProps) => {
  return (
    <div className={cn('bg-base-100 flex h-full flex-col rounded-lg p-6 shadow-lg', className)}>
      {title && <h2 className="mb-4 text-xl font-bold">{title}</h2>}
      {children}
    </div>
  )
}
