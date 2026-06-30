import { ChatMessage } from '../../types/assistant'

interface AssistantMessageProps {
  message: ChatMessage
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-[#CC1F1F] text-white rounded-br-none'
            : 'bg-[#E8E0D0] text-[#2D2D2D] rounded-bl-none'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
