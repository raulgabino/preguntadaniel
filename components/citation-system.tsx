"use client"

import { useState } from "react"
import { ExternalLink, Info, Clock, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Citation {
  source: string
  timestamp: string
  relevance?: number
  framework?: string
  doc_title?: string
  context?: string
}

interface CitationSystemProps {
  citations: Citation[]
}

export function CitationSystem({ citations }: CitationSystemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)

  if (!citations || citations.length === 0) {
    return null
  }

  const visibleCitations = isExpanded ? citations : citations.slice(0, 3)
  const hasMoreCitations = citations.length > 3

  return (
    <Card className="p-4 bg-gray-50 border-gray-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-600" />
            <p className="text-sm font-medium text-gray-700">Fuentes consultadas ({citations.length})</p>
          </div>
          {hasMoreCitations && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Ver todas
                </>
              )}
            </Button>
          )}
        </div>

        {/* Citations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {visibleCitations.map((citation, index) => (
            <CitationBadge
              key={index}
              citation={citation}
              index={index + 1}
              onClick={() => setSelectedCitation(citation)}
            />
          ))}
        </div>

        {/* Citation Detail Modal */}
        {selectedCitation && (
          <CitationDetailModal
            citation={selectedCitation}
            isOpen={!!selectedCitation}
            onClose={() => setSelectedCitation(null)}
          />
        )}
      </div>
    </Card>
  )
}

interface CitationBadgeProps {
  citation: Citation
  index: number
  onClick: () => void
}

function CitationBadge({ citation, index, onClick }: CitationBadgeProps) {
  const getFrameworkColor = (framework?: string) => {
    switch (framework?.toLowerCase()) {
      case "people":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "strategy":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "execution":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cash":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Extract framework from source if not provided
  const framework = citation.framework || extractFrameworkFromSource(citation.source)
  const relevanceScore = citation.relevance ? Math.round(citation.relevance * 100) : null

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border transition-all hover:shadow-sm text-left w-full ${getFrameworkColor(framework)}`}
    >
      <div className="space-y-2">
        {/* Source and Index */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-white bg-opacity-50 rounded-full w-5 h-5 flex items-center justify-center">
              {index}
            </span>
            <span className="text-xs font-medium truncate">{getShortSource(citation.source)}</span>
          </div>
          <ExternalLink className="w-3 h-3 opacity-60 flex-shrink-0" />
        </div>

        {/* Timestamp and Relevance */}
        <div className="flex items-center justify-between text-xs opacity-75">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{citation.timestamp}</span>
          </div>
          {relevanceScore && (
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>{relevanceScore}%</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

interface CitationDetailModalProps {
  citation: Citation
  isOpen: boolean
  onClose: () => void
}

function CitationDetailModal({ citation, isOpen, onClose }: CitationDetailModalProps) {
  const framework = citation.framework || extractFrameworkFromSource(citation.source)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Detalle de la Fuente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Information */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Fuente</h4>
            <p className="text-sm text-gray-700">{citation.source}</p>
          </div>

          {/* Framework */}
          {framework && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Framework</h4>
              <Badge variant="secondary" className={getFrameworkBadgeColor(framework)}>
                {framework}
              </Badge>
            </div>
          )}

          {/* Timestamp */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Timestamp</h4>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4" />
              <span>{citation.timestamp}</span>
            </div>
          </div>

          {/* Relevance Score */}
          {citation.relevance && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Relevancia</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${citation.relevance * 100}%` }} />
                </div>
                <span className="text-sm text-gray-600">{Math.round(citation.relevance * 100)}%</span>
              </div>
            </div>
          )}

          {/* Context */}
          {citation.context && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Contexto</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{citation.context}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper functions
function extractFrameworkFromSource(source: string): string | undefined {
  const frameworks = ["People", "Strategy", "Execution", "Cash"]
  return frameworks.find((fw) => source.toLowerCase().includes(fw.toLowerCase()))
}

function getShortSource(source: string): string {
  // Extract meaningful part of source name
  const parts = source.split(" - ")
  if (parts.length > 1) {
    return parts[1].substring(0, 30) + (parts[1].length > 30 ? "..." : "")
  }
  return source.substring(0, 30) + (source.length > 30 ? "..." : "")
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
