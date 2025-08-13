import { Loader2 } from "lucide-react"

interface TypingIndicatorProps {
  message?: string
}

export function TypingIndicator({ message = "Daniel está investigando del tema..." }: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-semibold">D</span>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 text-amber-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
