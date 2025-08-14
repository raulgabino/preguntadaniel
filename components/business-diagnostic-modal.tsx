"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Building2 } from "lucide-react"
import {
  diagnosticQuestions,
  type BusinessProfile,
  determineBusinessPhase,
  generatePersonalizedInsights,
} from "@/lib/business-diagnostic"

interface BusinessDiagnosticModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (profile: BusinessProfile, insights: string) => void
}

export function BusinessDiagnosticModal({ isOpen, onClose, onComplete }: BusinessDiagnosticModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  const currentQuestion = diagnosticQuestions[currentStep]
  const progress = ((currentStep + 1) / diagnosticQuestions.length) * 100

  const handleAnswer = (value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const handleNext = () => {
    if (currentStep < diagnosticQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      const phase = determineBusinessPhase(answers)
      const profile: BusinessProfile = {
        phase,
        industry: answers.industry || "Otro",
        size:
          answers.employees < 10
            ? "micro"
            : answers.employees < 50
              ? "small"
              : answers.employees < 200
                ? "medium"
                : "large",
        revenue: answers.revenue || "No especificado",
        employees: answers.employees || 0,
        mainChallenges: [answers.main_challenge || "No especificado"],
        currentFocus: answers.priority_area?.includes("People")
          ? "people"
          : answers.priority_area?.includes("Strategy")
            ? "strategy"
            : answers.priority_area?.includes("Execution")
              ? "execution"
              : "cash",
      }

      const insights = generatePersonalizedInsights(profile)
      onComplete(profile, insights)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const canProceed = answers[currentQuestion.id] !== undefined

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
            <Building2 className="w-5 h-5 text-amber-600" />
            Diagnóstico Empresarial - Juan Pérez
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Pregunta {currentStep + 1} de {diagnosticQuestions.length}
              </span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="p-6 dark:bg-gray-800">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50">{currentQuestion.question}</h3>

              {currentQuestion.type === "single" && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer text-gray-700 dark:text-gray-300">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "number" && (
                <div className="space-y-2">
                  <Label htmlFor="number-input" className="dark:text-gray-300">
                    Número de empleados
                  </Label>
                  <Input
                    id="number-input"
                    type="number"
                    placeholder="Ej: 25"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(Number.parseInt(e.target.value) || 0)}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {currentQuestion.type === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="text-input" className="dark:text-gray-300">
                    Tu respuesta
                  </Label>
                  <Input
                    id="text-input"
                    type="text"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              Anterior
            </Button>
            <Button onClick={handleNext} disabled={!canProceed} className="bg-amber-600 hover:bg-amber-700">
              {currentStep === diagnosticQuestions.length - 1 ? "Completar Diagnóstico" : "Siguiente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
