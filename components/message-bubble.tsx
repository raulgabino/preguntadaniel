import { User, Bot } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CitationSystem } from "./citation-system"
import { ChartGenerator } from "./chart-generator"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  citations?: Array<{ source: string; timestamp: string }>
  chartData?: {
    type: string
    title: string
    data: any[]
  }
  isChart?: boolean
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
          isUser ? "bg-emerald-600" : "bg-amber-600"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        ) : (
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        )}
      </div>

      <div className={`flex-1 max-w-full sm:max-w-4xl ${isUser ? "text-right" : "text-left"}`}>
        {isUser ? (
          <Card className="p-3 sm:p-4 bg-emerald-50 border-emerald-200">
            <p className="text-gray-800 leading-relaxed text-sm sm:text-base break-words">{message.content}</p>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {message.isChart && message.chartData ? (
              <div className="space-y-4">
                <Card className="p-4 sm:p-5 bg-white border-amber-200">
                  <p className="text-gray-800 leading-relaxed text-sm sm:text-base break-words mb-4">
                    {message.content}
                  </p>
                </Card>
                <ChartGenerator
                  type={message.chartData.type}
                  title={message.chartData.title}
                  data={message.chartData.data}
                />
              </div>
            ) : (
              <Card className="p-3 sm:p-4 bg-white border-amber-200">
                <p className="text-gray-800 leading-relaxed text-sm sm:text-base break-words">{message.content}</p>
              </Card>
            )}

            {message.citations && message.citations.length > 0 && <CitationSystem citations={message.citations} />}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-1 sm:mt-2">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
