"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"
import { BusinessDiagnosticModal } from "@/components/business-diagnostic-modal"
import { Button } from "@/components/ui/button"
import type { BusinessProfile } from "@/lib/business-diagnostic"
import { ragEngine } from "@/lib/rag-engine"

export default function HomePage() {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [messages, setMessages] = useState<
    Array<{
      id: string
      content: string
      role: "user" | "assistant"
      timestamp: Date
      citations?: Array<{ source: string; timestamp: string }>
      isStructured?: boolean
      isChart?: boolean
      chartData?: any
      isSimulation?: boolean
      characterName?: string
    }>
  >([
    {
      id: "1",
      content:
        "¡Hola! Soy Juan Pérez, tu consultor de escalamiento empresarial. Además de responder tus dudas sobre negocios, puedo ayudarte a practicar conversaciones difíciles mediante simulaciones interactivas.\n\n**¿Cómo usar esta plataforma?**\n• Haz preguntas específicas sobre tu negocio\n• Usa las consultas rápidas del menú lateral\n• Solicita un diagnóstico empresarial gratuito\n• Pide gráficos escribiendo 'genera un gráfico de...'\n• **NUEVO:** Practica conversaciones diciendo 'quiero practicar una conversación'\n\n¿Qué desafío específico estás enfrentando hoy?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])

  const [simulationState, setSimulationState] = useState({
    isActive: false,
    characterName: "",
    context: "",
  })

  const handleBusinessProfileUpdate = (profile: BusinessProfile) => {
    setBusinessProfile(profile)
    ragEngine.setBusinessProfile(profile)
  }

  const isDiagnosticAcceptance = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim()
    const acceptancePatterns = [
      "sí",
      "si",
      "yes",
      "claro",
      "por supuesto",
      "me gustaría",
      "me gustaria",
      "sí me gustaría",
      "si me gustaria",
      "acepto",
      "ok",
      "okay",
      "dale",
      "perfecto",
      "excelente",
      "hagámoslo",
      "hagamoslo",
    ]

    return acceptancePatterns.some((pattern) => lowerMessage.includes(pattern) && lowerMessage.length < 50)
  }

  const wasLastMessageDiagnosticOffer = (): boolean => {
    const lastAssistantMessage = messages.filter((m) => m.role === "assistant").slice(-1)[0]

    return lastAssistantMessage?.content.includes("diagnóstico rápido") || false
  }

  const handleSidebarMessage = (message: string) => {
    setIsSidebarOpen(false)

    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: "user" as const,
      timestamp: new Date(),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    if (isDiagnosticAcceptance(message) && wasLastMessageDiagnosticOffer()) {
      setShowDiagnostic(true)
      return
    }

    handleApiResponse(message, updatedMessages)
  }

  const handleDiagnosticComplete = (profile: BusinessProfile, insights: string) => {
    setBusinessProfile(profile)
    setShowDiagnostic(false)

    const diagnosticMessage = {
      id: Date.now().toString(),
      content: `¡Excelente! He completado tu diagnóstico empresarial. ${insights}`,
      role: "assistant" as const,
      timestamp: new Date(),
      isStructured: true,
    }

    setMessages((prev) => [...prev, diagnosticMessage])
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
          history: currentMessages,
          businessProfile: businessProfile,
          simulationState: simulationState, // Send simulation state to API
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      if (data.simulationState) {
        setSimulationState(data.simulationState)
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: "assistant" as const,
        timestamp: new Date(),
        citations: data.citations,
        isStructured: data.isStructured,
        isChart: data.isChart,
        chartData: data.chartData,
        isSimulation: data.isSimulation, // Handle simulation messages
        characterName: data.characterName, // Handle character names
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
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}
      >
        <Sidebar onSendMessage={handleSidebarMessage} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-amber-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
            className="text-amber-600 flex items-center gap-2 px-2"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">Consultas Rápidas</span>
          </Button>
          <h1 className="font-bold text-lg text-amber-600">Juan Pérez</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        <Header />
        <ChatInterface
          messages={messages}
          setMessages={setMessages}
          businessProfile={businessProfile}
          onBusinessProfileUpdate={handleBusinessProfileUpdate}
        />
      </div>

      <BusinessDiagnosticModal
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
        onComplete={handleDiagnosticComplete}
      />
    </div>
  )
}
