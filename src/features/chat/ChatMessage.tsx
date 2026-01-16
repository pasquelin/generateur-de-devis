import { type Message } from '../../types'
import { cn } from '../../utils/cn.util.ts'

interface ChatMessageProps {
  message: Message
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user'

  return (
    <div className={cn('chat', isUser ? 'chat-end' : 'chat-start')}>
      <div className="chat-header mb-1">
        <span className="text-xs opacity-50">{isUser ? 'Vous' : 'Assistant'}</span>
      </div>
      <div className={cn('chat-bubble', isUser ? 'chat-bubble-primary' : 'chat-bubble-secondary')}>
        {message.content}
      </div>
      <div className="chat-footer mt-1 text-xs opacity-50">
        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  )
}
