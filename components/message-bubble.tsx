import { User, Bot } from "lucide-react"
import { Card } from "@/components/ui/card"
import { FormattedResponse } from "./formatted-response"
import { CitationSystem } from "./citation-system"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  citations?: Array<{ source: string; timestamp: string }>
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  // Check if this is a structured Daniel Marcos response
  const isStructuredResponse =
    !isUser &&
    (message.content.includes("Diagnóstico:") ||
      message.content.includes("Marco aplicado:") ||
      message.content.includes("Checklist:"))

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? "bg-emerald-600" : "bg-amber-600"
        }`}
      >
        {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-4xl ${isUser ? "text-right" : "text-left"}`}>
        {isUser ? (
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <p className="text-gray-800 leading-relaxed">{message.content}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {isStructuredResponse ? (
              <FormattedResponse content={message.content} />
            ) : (
              <Card className="p-4 bg-white border-amber-200">
                <p className="text-gray-800 leading-relaxed">{message.content}</p>
              </Card>
            )}

            {/* Enhanced Citations */}
            {message.citations && message.citations.length > 0 && <CitationSystem citations={message.citations} />}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-2">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
