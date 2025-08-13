import { Brain, TrendingUp, Users, DollarSign, CheckCircle, Target, BarChart3, Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FormattedResponseProps {
  content: string
}

export function FormattedResponse({ content }: FormattedResponseProps) {
  // Parse the structured response
  const sections = parseStructuredResponse(content)

  const getFrameworkIcon = (framework: string) => {
    switch (framework.toLowerCase()) {
      case "people":
        return <Users className="w-5 h-5 text-emerald-600" />
      case "strategy":
        return <Brain className="w-5 h-5 text-amber-600" />
      case "execution":
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      case "cash":
        return <DollarSign className="w-5 h-5 text-green-600" />
      default:
        return <Target className="w-5 h-5 text-gray-600" />
    }
  }

  const getFrameworkColor = (framework: string) => {
    switch (framework.toLowerCase()) {
      case "people":
        return "border-emerald-200 bg-emerald-50"
      case "strategy":
        return "border-amber-200 bg-amber-50"
      case "execution":
        return "border-blue-200 bg-blue-50"
      case "cash":
        return "border-green-200 bg-green-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Diagnóstico */}
      {sections.diagnosis && (
        <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">Diagnóstico</h4>
              <p className="text-gray-700 leading-relaxed">{sections.diagnosis}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Marco aplicado */}
      {sections.framework && (
        <Card
          className={`p-4 border-l-4 ${getFrameworkBorderColor(sections.framework.name)} ${getFrameworkColor(sections.framework.name)}`}
        >
          <div className="flex items-start gap-3">
            {getFrameworkIcon(sections.framework.name)}
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Marco Aplicado</h4>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={getFrameworkBadgeColor(sections.framework.name)}>
                  {sections.framework.name}
                </Badge>
              </div>
              <p className="text-gray-700 leading-relaxed">{sections.framework.explanation}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Checklist */}
      {sections.checklist && sections.checklist.length > 0 && (
        <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 mb-3">Plan de Acción</h4>
              <div className="space-y-3">
                {sections.checklist.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Ejemplo */}
      {sections.example && (
        <Card className="p-4 border-l-4 border-l-purple-500 bg-purple-50">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Caso de Éxito</h4>
              <p className="text-gray-700 leading-relaxed italic">{sections.example}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Métrica/cadencia */}
      {sections.metrics && (
        <Card className="p-4 border-l-4 border-l-green-500 bg-green-50">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Métricas y Cadencia</h4>
              <p className="text-gray-700 leading-relaxed">{sections.metrics}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Nota adicional si existe */}
      {sections.note && (
        <Card className="p-4 border border-orange-200 bg-orange-50">
          <p className="text-orange-800 text-sm leading-relaxed">{sections.note}</p>
        </Card>
      )}
    </div>
  )
}

function getFrameworkBorderColor(framework: string) {
  switch (framework.toLowerCase()) {
    case "people":
      return "border-l-emerald-500"
    case "strategy":
      return "border-l-amber-500"
    case "execution":
      return "border-l-blue-500"
    case "cash":
      return "border-l-green-500"
    default:
      return "border-l-gray-500"
  }
}

function getFrameworkBadgeColor(framework: string) {
  switch (framework.toLowerCase()) {
    case "people":
      return "bg-emerald-100 text-emerald-800"
    case "strategy":
      return "bg-amber-100 text-amber-800"
    case "execution":
      return "bg-blue-100 text-blue-800"
    case "cash":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

interface ParsedResponse {
  diagnosis?: string
  framework?: {
    name: string
    explanation: string
  }
  checklist?: string[]
  example?: string
  metrics?: string
  note?: string
}

function parseStructuredResponse(content: string): ParsedResponse {
  const sections: ParsedResponse = {}

  // Split content by sections
  const lines = content.split("\n")
  let currentSection = ""
  let currentContent: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith("Diagnóstico:")) {
      if (currentSection) {
        processSection(sections, currentSection, currentContent)
      }
      currentSection = "diagnosis"
      currentContent = [trimmedLine.replace("Diagnóstico:", "").trim()]
    } else if (trimmedLine.startsWith("Marco aplicado:")) {
      if (currentSection) {
        processSection(sections, currentSection, currentContent)
      }
      currentSection = "framework"
      currentContent = [trimmedLine.replace("Marco aplicado:", "").trim()]
    } else if (trimmedLine.startsWith("Checklist:")) {
      if (currentSection) {
        processSection(sections, currentSection, currentContent)
      }
      currentSection = "checklist"
      currentContent = []
    } else if (trimmedLine.startsWith("Ejemplo:")) {
      if (currentSection) {
        processSection(sections, currentSection, currentContent)
      }
      currentSection = "example"
      currentContent = [trimmedLine.replace("Ejemplo:", "").trim()]
    } else if (trimmedLine.startsWith("Métrica/cadencia:")) {
      if (currentSection) {
        processSection(sections, currentSection, currentContent)
      }
      currentSection = "metrics"
      currentContent = [trimmedLine.replace("Métrica/cadencia:", "").trim()]
    } else if (trimmedLine.startsWith("*Nota:")) {
      if (currentSection) {
        processSection(sections, currentSection, currentContent)
      }
      currentSection = "note"
      currentContent = [trimmedLine.replace(/^\*|\*$/g, "").trim()]
    } else if (trimmedLine) {
      currentContent.push(trimmedLine)
    }
  }

  // Process the last section
  if (currentSection) {
    processSection(sections, currentSection, currentContent)
  }

  return sections
}

function processSection(sections: ParsedResponse, sectionType: string, content: string[]) {
  const text = content.join(" ").trim()

  switch (sectionType) {
    case "diagnosis":
      sections.diagnosis = text
      break
    case "framework":
      // Extract framework name and explanation
      const frameworkMatch = text.match(/\*\*(.*?)\*\*\s*-\s*(.*)/)
      if (frameworkMatch) {
        sections.framework = {
          name: frameworkMatch[1],
          explanation: frameworkMatch[2],
        }
      } else {
        sections.framework = {
          name: "Strategy",
          explanation: text,
        }
      }
      break
    case "checklist":
      // Parse numbered list items
      sections.checklist = content
        .filter((line) => line.match(/^\d+\)/))
        .map((line) => line.replace(/^\d+\)\s*/, "").trim())
      break
    case "example":
      sections.example = text
      break
    case "metrics":
      sections.metrics = text
      break
    case "note":
      sections.note = text
      break
  }
}
