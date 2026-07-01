import { ChatMessage } from '../../types/assistant'

interface AssistantMessageProps {
  message: ChatMessage
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-pokedex-red text-white rounded-br-sm'
            : 'bg-white text-charcoal border border-cream rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
