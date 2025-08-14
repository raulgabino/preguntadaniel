import { Card } from "@/components/ui/card"
import { MessageSquare, ArrowRight } from "lucide-react"

interface UnstructuredResponseFormatterProps {
  content: string
}

export function UnstructuredResponseFormatter({ content }: UnstructuredResponseFormatterProps) {
  const sections = breakIntoReadableSections(content)

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={index} className="p-4 bg-white border-amber-200">
          <div className="flex items-start gap-3">
            {index === 0 ? (
              <MessageSquare className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            ) : (
              <ArrowRight className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              {section.content && (
                <p className="text-gray-800 leading-relaxed text-sm sm:text-base mb-3">{section.content.trim()}</p>
              )}
              {section.bullets.length > 0 && (
                <ul className="space-y-2">
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function breakIntoReadableSections(content: string) {
  const sentences = content.split(/(?<=[.!?])\s+/)
  const sections = []
  let currentSection = { content: "", bullets: [] as string[] }
  let sentenceCount = 0

  for (const sentence of sentences) {
    // Detect if sentence contains numbered points or bullet-like content
    if (sentence.match(/^\*\*?\d+\./) || sentence.match(/^-\s/) || sentence.match(/^\d+\.\s/)) {
      if (currentSection.content.trim()) {
        sections.push({ ...currentSection })
        currentSection = { content: "", bullets: [] }
        sentenceCount = 0
      }
      currentSection.bullets.push(sentence.replace(/^\*\*?\d+\.|\d+\.\s|^-\s/, "").trim())
    } else {
      currentSection.content += sentence + " "
      sentenceCount++

      // Break into new section every 3-4 sentences to avoid long blocks
      if (sentenceCount >= 3 && sentence.match(/[.!?]$/)) {
        sections.push({ ...currentSection })
        currentSection = { content: "", bullets: [] }
        sentenceCount = 0
      }
    }
  }

  // Add remaining content
  if (currentSection.content.trim() || currentSection.bullets.length > 0) {
    sections.push(currentSection)
  }

  return sections.filter((section) => section.content.trim() || section.bullets.length > 0)
}
