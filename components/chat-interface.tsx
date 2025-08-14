"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageBubble } from "@/components/message-bubble"
import { BusinessDiagnosticModal } from "@/components/business-diagnostic-modal"
import { TypingIndicator } from "@/components/typing-indicator"
import type { BusinessProfile } from "@/lib/business-diagnostic"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  citations?: Array<{ source: string; timestamp: string }>
  isStructured?: boolean
}

interface ChatInterfaceProps {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  businessProfile: BusinessProfile | null
  onBusinessProfileUpdate: (profile: BusinessProfile) => void
}

export function ChatInterface({ messages, setMessages, businessProfile, onBusinessProfileUpdate }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleDiagnosticComplete = (profile: BusinessProfile, insights: string) => {
    onBusinessProfileUpdate(profile)
    setShowDiagnostic(false)

    // Add insights message to chat
    const insightsMessage: Message = {
      id: Date.now().toString(),
      content: insights,
      role: "assistant",
      timestamp: new Date(),
    }

    setMessages([...messages, insightsMessage])
  }

  const checkForDiagnosticRequest = (userInput: string): boolean => {
    const diagnosticPatterns = [
      /diagnóstico/i,
      /evaluar.*empresa/i,
      /qué.*fase/i,
      /nivel.*empresa/i,
      /evalúa.*negocio/i,
      /análisis.*empresa/i,
    ]

    return diagnosticPatterns.some((pattern) => pattern.test(userInput))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (checkForDiagnosticRequest(input.trim())) {
      setShowDiagnostic(true)
      setInput("")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          businessProfile: businessProfile,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
        citations: data.citations,
        isStructured: data.isStructured,
      }

      setMessages([...updatedMessages, assistantMessage])
    } catch (error) {
      console.error("Error getting response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Disculpa, hubo un error procesando tu consulta. Por favor, intenta de nuevo.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <>
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-amber-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Comparte tus objetivos y trabajemos juntos para el éxito..."
                className="min-h-[60px] resize-none border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 h-auto"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {!businessProfile && (
            <div className="mt-3 text-center">
              <Button
                variant="outline"
                onClick={() => setShowDiagnostic(true)}
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
              >
                🎯 Hacer diagnóstico empresarial (2 min)
              </Button>
            </div>
          )}
        </div>
      </div>

      <BusinessDiagnosticModal
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
        onComplete={handleDiagnosticComplete}
      />
    </>
  )
}
