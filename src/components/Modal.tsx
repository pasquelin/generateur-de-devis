import { type ReactNode } from 'react'

import { cn } from '../utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className={cn('modal-box', className)}>
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        {children}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
