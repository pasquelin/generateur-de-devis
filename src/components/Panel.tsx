import { type ReactNode } from 'react'

import { cn } from '../utils/cn.util.ts'

interface PanelProps {
  children: ReactNode
  title?: string
  className?: string
}

export const Panel = ({ children, title, className }: PanelProps) => {
  return (
    <div
      className={cn(
        'bg-base-100 rounded-box border-base-300 flex h-full flex-col border p-4 shadow-lg ',
        className,
      )}
    >
      {title && <h2 className="mb-4 text-xl font-bold">{title}</h2>}
      {children}
    </div>
  )
}
