import { type NextRequest, NextResponse } from "next/server"
import { ragEngine } from "@/lib/rag-engine"

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

    const isChartRequest = /gráfic[ao]|visualiz|chart|diagrama|esquema|hazlo en gráfica/i.test(message)

    if (isChartRequest) {
      // Generate chart data based on the request
      const chartResponse = await generateChartResponse(message, businessProfile)
      return NextResponse.json(chartResponse)
    }

    // Process the query through RAG engine
    const response = await ragEngine.processQuery(message)

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

async function generateChartResponse(message: string, businessProfile: any) {
  // Determine chart type based on message content
  let chartType = "bar"
  let chartData = []
  let title = "Análisis Empresarial"
  let description = ""

  if (/flujo.*efectivo|cash.*flow|dinero/i.test(message)) {
    chartType = "line"
    title = "Proyección de Flujo de Efectivo"
    description = "Basado en tu perfil empresarial, aquí tienes una proyección de flujo de efectivo:"
    chartData = [
      { name: "Ene", value: 15000, projected: 18000 },
      { name: "Feb", value: 18000, projected: 22000 },
      { name: "Mar", value: 22000, projected: 28000 },
      { name: "Abr", value: 25000, projected: 32000 },
      { name: "May", value: 28000, projected: 35000 },
      { name: "Jun", value: 32000, projected: 40000 },
    ]
  } else if (/equipo|empleados|people/i.test(message)) {
    chartType = "pie"
    title = "Distribución del Equipo por Área"
    description = "Estructura organizacional recomendada para tu fase de crecimiento:"
    chartData = [
      { name: "Ventas", value: 30, color: "#f59e0b" },
      { name: "Operaciones", value: 25, color: "#10b981" },
      { name: "Producto", value: 20, color: "#3b82f6" },
      { name: "Marketing", value: 15, color: "#8b5cf6" },
      { name: "Admin", value: 10, color: "#ef4444" },
    ]
  } else if (/kpi|métricas|indicadores/i.test(message)) {
    chartType = "progress"
    title = "KPIs Clave para tu Empresa"
    description = "Métricas esenciales que debes monitorear semanalmente:"
    chartData = [
      { name: "Satisfacción Cliente", current: 85, target: 90, color: "#10b981" },
      { name: "Retención Empleados", current: 78, target: 85, color: "#3b82f6" },
      { name: "Margen Bruto", current: 65, target: 75, color: "#f59e0b" },
      { name: "Tiempo de Cobranza", current: 45, target: 30, color: "#ef4444", inverse: true },
    ]
  } else {
    // Default business growth chart
    title = "Crecimiento Empresarial Proyectado"
    description = "Proyección de crecimiento aplicando los frameworks People, Strategy, Execution y Cash:"
    chartData = [
      { name: "Actual", people: 60, strategy: 45, execution: 55, cash: 40 },
      { name: "3 meses", people: 75, strategy: 70, execution: 80, cash: 65 },
      { name: "6 meses", people: 85, strategy: 85, execution: 90, cash: 80 },
      { name: "12 meses", people: 95, strategy: 95, execution: 95, cash: 90 },
    ]
  }

  return {
    content: description,
    chartData: {
      type: chartType,
      title,
      data: chartData,
    },
    isChart: true,
  }
}
