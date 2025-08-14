import { type NextRequest, NextResponse } from "next/server"
import { ragEngine } from "@/lib/rag-engine"
import { openai } from "@/lib/openai-client"

export async function POST(request: NextRequest) {
  try {
    const { message, businessProfile } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (message.trim().length < 3) {
      return NextResponse.json({ error: "La consulta debe tener al menos 3 caracteres" }, { status: 400 })
    }

    if (businessProfile) {
      ragEngine.setBusinessProfile(businessProfile)
    }

    // Process the query through RAG engine first
    const response = await ragEngine.processQuery(message)

    const chartAnalysis = await analyzeForChartRecommendation(message, response.content)

    if (chartAnalysis.shouldShowChart) {
      const chartData = await generateIntelligentChart(message, response.content, businessProfile, chartAnalysis)

      return NextResponse.json({
        content: response.content,
        citations: response.citations,
        isStructured: response.isStructured,
        chartData,
        isChart: true,
      })
    }

    return NextResponse.json({
      content: response.content,
      citations: response.citations,
      isStructured: response.isStructured,
    })
  } catch (error) {
    console.error("Chat API error:", error)

    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        return NextResponse.json(
          {
            error:
              "Configuración de OpenAI requerida. Por favor, configura la variable de entorno OPENAI_API_KEY en Project Settings.",
          },
          { status: 500 },
        )
      }

      if (error.message.includes("OpenAI API")) {
        return NextResponse.json(
          {
            error: "Error temporal con el servicio de IA. Por favor, intenta nuevamente en unos momentos.",
          },
          { status: 503 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Error interno del servidor. Por favor, intenta reformular tu consulta.",
      },
      { status: 500 },
    )
  }
}

async function analyzeForChartRecommendation(userMessage: string, aiResponse: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un experto en visualización de datos empresariales. Analiza si la respuesta se beneficiaría de un gráfico para mejorar la comprensión del usuario.

Responde SOLO con un JSON válido con esta estructura:
{
  "shouldShowChart": boolean,
  "chartType": "bar" | "line" | "pie" | "progress" | null,
  "reason": "breve explicación",
  "dataPoints": ["punto1", "punto2"] // elementos clave que se visualizarían
}

Recomienda gráficos cuando:
- Se mencionan métricas, KPIs, porcentajes, números
- Se comparan múltiples elementos
- Se habla de progreso, crecimiento, tendencias
- Se explican procesos con etapas
- Se analizan distribuciones o proporciones

NO recomiendes gráficos para:
- Respuestas puramente conceptuales o teóricas
- Preguntas sobre definiciones
- Consejos generales sin datos específicos`,
        },
        {
          role: "user",
          content: `Pregunta del usuario: "${userMessage}"

Respuesta de la IA: "${aiResponse.substring(0, 1000)}..."`,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) return { shouldShowChart: false }

    return JSON.parse(result)
  } catch (error) {
    console.error("Error analyzing chart recommendation:", error)
    return { shouldShowChart: false }
  }
}

async function generateIntelligentChart(userMessage: string, aiResponse: string, businessProfile: any, analysis: any) {
  const chartType = analysis.chartType || "bar"
  let chartData = []
  let title = "Análisis Empresarial"
  const description = analysis.reason || "Visualización para mejorar la comprensión"

  // Generate contextual data based on the business profile and response content
  if (chartType === "line" && /flujo|efectivo|cash|dinero|ventas|ingresos/i.test(userMessage + aiResponse)) {
    title = "Proyección Financiera"
    chartData = generateFinancialProjection(businessProfile)
  } else if (chartType === "pie" && /equipo|empleados|distribución|áreas/i.test(userMessage + aiResponse)) {
    title = "Distribución Organizacional"
    chartData = generateTeamDistribution(businessProfile)
  } else if (chartType === "progress" && /kpi|métricas|indicadores|progreso/i.test(userMessage + aiResponse)) {
    title = "Indicadores Clave de Rendimiento"
    chartData = generateKPIProgress(businessProfile)
  } else {
    // Default multi-series chart for business frameworks
    title = "Análisis de Frameworks Empresariales"
    chartData = generateFrameworkAnalysis(businessProfile)
  }

  return {
    type: chartType,
    title,
    description,
    data: chartData,
  }
}

function generateFinancialProjection(profile: any) {
  const baseRevenue = profile?.currentRevenue || 50000
  return Array.from({ length: 6 }, (_, i) => ({
    name: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"][i],
    actual: Math.round(baseRevenue * (1 + i * 0.15)),
    projected: Math.round(baseRevenue * (1 + i * 0.25)),
  }))
}

function generateTeamDistribution(profile: any) {
  return [
    { name: "Ventas", value: 30, color: "#f59e0b" },
    { name: "Operaciones", value: 25, color: "#10b981" },
    { name: "Producto", value: 20, color: "#3b82f6" },
    { name: "Marketing", value: 15, color: "#8b5cf6" },
    { name: "Administración", value: 10, color: "#ef4444" },
  ]
}

function generateKPIProgress(profile: any) {
  return [
    { name: "Satisfacción Cliente", current: 85, target: 90, color: "#10b981" },
    { name: "Retención Empleados", current: 78, target: 85, color: "#3b82f6" },
    { name: "Margen Bruto", current: 65, target: 75, color: "#f59e0b" },
    { name: "Días de Cobranza", current: 45, target: 30, color: "#ef4444", inverse: true },
  ]
}

function generateFrameworkAnalysis(profile: any) {
  return [
    { name: "Situación Actual", people: 60, strategy: 45, execution: 55, cash: 40 },
    { name: "3 Meses", people: 75, strategy: 70, execution: 80, cash: 65 },
    { name: "6 Meses", people: 85, strategy: 85, execution: 90, cash: 80 },
    { name: "12 Meses", people: 95, strategy: 95, execution: 95, cash: 90 },
  ]
}
