import { type ChangeEvent, type CSSProperties, useEffect, useRef, useState } from 'react'

interface EditableFieldProps {
  value: string | number
  onChange: (value: string | number) => void
  style?: CSSProperties
  type?: 'text' | 'number'
  className?: string
  placeholder?: string
  multiline?: boolean
}

export const EditableField = ({
  value,
  onChange,
  style,
  type = 'text',
  placeholder = '',
  multiline = false,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(String(value))
  }, [value])

  useEffect(() => {
    if (isEditing) {
      const element = multiline ? textareaRef.current : inputRef.current
      if (element) {
        element.focus()
        element.select()
      }
    }
  }, [isEditing, multiline])

  const handleBlur = () => {
    setIsEditing(false)

    // Convertir en nombre si nécessaire
    if (type === 'number') {
      const numValue = parseFloat(editValue)
      if (!isNaN(numValue)) {
        onChange(numValue)
      }
    } else {
      onChange(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      setEditValue(String(value))
      setIsEditing(false)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // Ne pas permettre l'édition si on clique pendant la génération PDF
    if (!isEditing) {
      e.stopPropagation()
      setIsEditing(true)
    }
  }

  if (isEditing) {
    const commonStyle = {
      ...style,
      border: '1px solid #2563eb',
      outline: 'none',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box' as const,
    }

    if (multiline) {
      return (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={commonStyle}
          rows={3}
          placeholder={placeholder}
        />
      )
    }

    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={commonStyle}
        type={type}
        placeholder={placeholder}
      />
    )
  }

  return (
    <button
      onClick={handleClick}
      style={{
        ...style,
        cursor: 'pointer',
        display: 'inline-block',
        minWidth: '20px',
        minHeight: '1em',
        borderRadius: '2px',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#f3f4f6'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
      title="Cliquer pour éditer"
    >
      {value || placeholder}
    </button>
  )
}
