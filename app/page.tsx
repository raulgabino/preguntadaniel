"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"
import type { BusinessProfile } from "@/lib/business-diagnostic"
import { ragEngine } from "@/lib/rag-engine"

export default function HomePage() {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)

  const [messages, setMessages] = useState<
    Array<{
      id: string
      content: string
      role: "user" | "assistant"
      timestamp: Date
      citations?: Array<{ source: string; timestamp: string }>
      isStructured?: boolean
    }>
  >([
    {
      id: "1",
      content:
        "¡Hola! Soy Daniel Marcos, tu consultor de escalamiento empresarial. Estoy aquí para ayudarte a desbloquear el potencial de tu negocio usando mis frameworks probados: People, Strategy, Execution y Cash. ¿Qué desafío específico estás enfrentando hoy? Puedes usar los frameworks de la izquierda o las consultas rápidas para empezar.",
      role: "assistant",
      timestamp: new Date(),
    },
  ])

  const handleBusinessProfileUpdate = (profile: BusinessProfile) => {
    setBusinessProfile(profile)
    // Update RAG engine with new profile
    ragEngine.setBusinessProfile(profile)
  }

  const handleSidebarMessage = (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: "user" as const,
      timestamp: new Date(),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    handleApiResponse(message, updatedMessages)
  }

  const handleApiResponse = async (message: string, currentMessages: typeof messages) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          businessProfile: businessProfile,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: "assistant" as const,
        timestamp: new Date(),
        citations: data.citations,
        isStructured: data.isStructured,
      }

      setMessages([...currentMessages, assistantMessage])
    } catch (error) {
      console.error("Error getting response:", error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Disculpa, hubo un error procesando tu consulta. Por favor, intenta de nuevo.",
        role: "assistant" as const,
        timestamp: new Date(),
      }
      setMessages([...currentMessages, errorMessage])
    }
  }

  return (
    <div className="flex h-screen bg-amber-50">
      <Sidebar onSendMessage={handleSidebarMessage} />
      <div className="flex-1 flex flex-col">
        <Header />
        <ChatInterface
          messages={messages}
          setMessages={setMessages}
          businessProfile={businessProfile}
          onBusinessProfileUpdate={handleBusinessProfileUpdate}
        />
      </div>
    </div>
  )
}
