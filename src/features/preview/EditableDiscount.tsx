import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import { X, Check, Trash2 } from 'lucide-react'

import type { Discount } from '../../types'

interface EditableDiscountProps {
  value?: Discount
  onChange: (discount: Discount | undefined) => void
  style?: CSSProperties
  className?: string
}

export const EditableDiscount = ({ value, onChange, style, className }: EditableDiscountProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [type, setType] = useState<'percentage' | 'fixed'>(value?.type || 'percentage')
  const [discountValue, setDiscountValue] = useState(value?.value?.toString() || '')
  const [label, setLabel] = useState(value?.label || '')
  const formRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    // Initialiser l'état local ICI, au moment de l'édition
    setType(value?.type || 'percentage')
    setDiscountValue(value?.value?.toString() || '')
    setLabel(value?.label || '')
    setIsEditing(true)
  }

  const handleSave = () => {
    const numValue = Number.parseFloat(discountValue)
    if (!Number.isNaN(numValue) && numValue > 0) {
      onChange({
        type,
        value: numValue,
        label: label.trim() || undefined,
      })
    }
    setIsEditing(false)
  }

  const handleRemove = () => {
    onChange(undefined)
    setDiscountValue('')
    setLabel('')
    setIsEditing(false)
  }

  const handleCancel = useCallback(() => {
    if (value) {
      setType(value.type)
      setDiscountValue(value.value.toString())
      setLabel(value.label || '')
    } else {
      setType('percentage')
      setDiscountValue('')
      setLabel('')
    }
    setIsEditing(false)
  }, [value])

  const formatDisplay = () => {
    if (!value) return '—'
    const symbol = value.type === 'percentage' ? '%' : '€'
    return `-${value.value}${symbol}`
  }

  useEffect(() => {
    if (isEditing) {
      const handleClickOutside = (event: Event) => {
        if (formRef.current && !formRef.current.contains(event.target as Node)) {
          handleCancel()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [handleCancel, isEditing])

  if (isEditing) {
    return (
      <div
        ref={formRef}
        style={{
          ...style,
          position: 'relative',
          zIndex: 10,
        }}
        className={className}
      >
        <div className="border-base-300 bg-base-100 absolute top-0 left-0 w-64 rounded-lg border p-3 shadow-xl">
          <div className="mb-2 text-xs font-semibold">Type de remise</div>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setType('percentage')}
              className={`btn btn-sm flex-1 ${type === 'percentage' ? 'btn-primary' : 'btn-outline'}`}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => setType('fixed')}
              className={`btn btn-sm flex-1 ${type === 'fixed' ? 'btn-primary' : 'btn-outline'}`}
            >
              €
            </button>
          </div>

          <div className="mb-2 text-xs font-semibold">Valeur</div>
          <input
            type="number"
            value={discountValue}
            onChange={e => setDiscountValue(e.target.value)}
            placeholder={type === 'percentage' ? 'Ex: 10' : 'Ex: 50'}
            className="input input-bordered input-sm mb-3 w-full"
            autoFocus
            min="0"
            step={type === 'percentage' ? '1' : '0.01'}
          />

          <div className="mb-2 text-xs font-semibold">Label (optionnel)</div>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Ex: Remise fidélité"
            className="input input-bordered input-sm mb-3 w-full"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary btn-sm flex-1"
              disabled={!discountValue || Number.parseFloat(discountValue) <= 0}
            >
              <Check size={14} />
              OK
            </button>
            <button type="button" onClick={handleCancel} className="btn btn-ghost btn-sm">
              <X size={14} />
            </button>
            {value && (
              <button type="button" onClick={handleRemove} className="btn btn-error btn-sm">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      style={{
        ...style,
        cursor: 'pointer',
        display: 'inline-block',
        padding: '2px 6px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        fontWeight: value ? 600 : 400,
        color: value ? '#dc2626' : 'inherit',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#f3f4f6'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
      title={value?.label || 'Cliquer pour ajouter une remise'}
      className={className}
    >
      {formatDisplay()}
    </button>
  )
}
