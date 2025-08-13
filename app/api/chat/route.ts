import { type NextRequest, NextResponse } from "next/server"
import { ragEngine } from "@/lib/rag-engine"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (message.trim().length < 3) {
      return NextResponse.json({ error: "La consulta debe tener al menos 3 caracteres" }, { status: 400 })
    }

    // Process the query through RAG engine
    const response = await ragEngine.processQuery(message)

    return NextResponse.json({
      content: response.content,
      citations: response.citations,
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
