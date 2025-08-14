import { Card } from "@/components/ui/card"

interface SimulationBubbleProps {
  content: string
  characterName: string
}

export function SimulationBubble({ content, characterName }: SimulationBubbleProps) {
  return (
    <Card className="p-4 border-l-4 border-l-purple-500 bg-purple-50 max-w-full sm:max-w-4xl ml-11 sm:ml-12">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
          {characterName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-semibold text-purple-800 mb-2">Respuesta de {characterName} (Simulación)</h4>
          <p className="text-gray-700 leading-relaxed italic">"{content}"</p>
        </div>
      </div>
    </Card>
  )
}
