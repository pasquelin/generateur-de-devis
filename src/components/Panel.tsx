import { type ReactNode } from 'react'

import { cn } from '../utils/cn'

interface PanelProps {
  children: ReactNode
  title?: string
  className?: string
}

export const Panel = ({ children, title, className }: PanelProps) => {
  return (
    <div className={cn('bg-base-100 rounded-lg shadow-lg p-6 h-full flex flex-col', className)}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      {children}
    </div>
  )
}
