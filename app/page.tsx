"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"
import { BusinessDiagnosticModal } from "@/components/business-diagnostic-modal"
import { Button } from "@/components/ui/button"
import type { BusinessProfile } from "@/lib/business-diagnostic"
import { generatePersonalizedInsights } from "@/lib/business-diagnostic"
import { ragEngine } from "@/lib/rag-engine"

export default function HomePage() {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null)
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
  >([])

  const [simulationState, setSimulationState] = useState({
    isActive: false,
    characterName: "",
    context: "",
  })

  const handleDiagnosticComplete = (profile: BusinessProfile) => {
    setBusinessProfile(profile)
    ragEngine.setBusinessProfile(profile)
    const insights = generatePersonalizedInsights(profile)
    const initialMessage = {
      id: "1",
      content: `¡Excelente! He completado tu diagnóstico empresarial. ${insights}`,
      role: "assistant" as const,
      timestamp: new Date(),
      isStructured: true,
    }
    setMessages([initialMessage])
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
          history: currentMessages,
          businessProfile: businessProfile,
          simulationState: simulationState,
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
        isSimulation: data.isSimulation,
        characterName: data.characterName,
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

  if (!businessProfile) {
    return (
      <div className="flex h-screen bg-amber-50 items-center justify-center">
        <BusinessDiagnosticModal
          isOpen={true}
          onClose={() => {
            /* Non-closable until complete */
          }}
          onComplete={handleDiagnosticComplete}
        />
      </div>
    )
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
          onBusinessProfileUpdate={setBusinessProfile}
        />
      </div>
    </div>
  )
}
