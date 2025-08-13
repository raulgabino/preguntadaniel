"use client"

import { Brain, TrendingUp, Users, DollarSign } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SidebarProps {
  onSendMessage: (message: string) => void
}

export function Sidebar({ onSendMessage }: SidebarProps) {
  const frameworks = [
    {
      name: "People",
      icon: Users,
      color: "text-emerald-600",
      description: "Liderazgo, equipo, cultura",
      bgColor: "hover:bg-emerald-50",
      prompt:
        "Necesito ayuda con mi framework de People. ¿Cómo puedo mejorar el liderazgo, la gestión de mi equipo y la cultura organizacional?",
    },
    {
      name: "Strategy",
      icon: Brain,
      color: "text-amber-600",
      description: "Propuesta de valor, posicionamiento",
      bgColor: "hover:bg-amber-50",
      prompt:
        "Quiero trabajar en mi Strategy. ¿Cómo puedo definir mejor mi propuesta de valor y posicionamiento en el mercado?",
    },
    {
      name: "Execution",
      icon: TrendingUp,
      color: "text-blue-600",
      description: "Procesos, KPIs, ritmo de juntas",
      bgColor: "hover:bg-blue-50",
      prompt:
        "Necesito mejorar mi Execution. ¿Cómo implemento mejores procesos, KPIs efectivos y un ritmo de juntas productivo?",
    },
    {
      name: "Cash",
      icon: DollarSign,
      color: "text-green-600",
      description: "Flujo de efectivo, pricing",
      bgColor: "hover:bg-green-50",
      prompt: "Tengo desafíos con Cash. ¿Cómo optimizo mi flujo de efectivo y estrategia de pricing?",
    },
  ]

  const quickPrompts = [
    "¿Cómo escalo mi equipo efectivamente?",
    "¿Cuál es mi siguiente prioridad estratégica?",
    "¿Cómo mejoro mi flujo de efectivo?",
    "¿Qué KPIs debo medir semanalmente?",
    "¿Cómo implemento un ritmo de juntas L10?",
  ]

  return (
    <aside className="w-80 sm:w-80 bg-white border-r border-amber-200 p-4 sm:p-6 h-full overflow-y-auto">
      <div className="mb-6 sm:mb-8">
        <h2 className="font-bold text-base sm:text-lg text-gray-800 mb-2 font-sans">Frameworks de Negocio</h2>
        <p className="text-xs sm:text-sm text-gray-600">Áreas clave para escalar tu empresa</p>
      </div>

      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
        {frameworks.map((framework) => (
          <Card
            key={framework.name}
            className={`p-3 sm:p-4 ${framework.bgColor} transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-current active:scale-95 transition-transform`}
            onClick={() => onSendMessage(framework.prompt)}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <framework.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${framework.color} mt-0.5 flex-shrink-0`} />
              <div className="min-w-0">
                <span className="font-medium text-gray-800 block text-sm sm:text-base">{framework.name}</span>
                <span className="text-xs text-gray-600 break-words">{framework.description}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-semibold text-gray-800 font-sans text-sm sm:text-base">Consultas Rápidas</h3>
        <div className="space-y-2">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(prompt)}
              className="w-full text-left p-2 sm:p-3 text-xs sm:text-sm bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-transparent hover:border-amber-200 active:scale-95 transition-transform break-words"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
