import OpenAI from "openai"

// Singleton OpenAI client with secure configuration
class OpenAIClient {
  private client: OpenAI | null = null

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY

      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is required")
      }

      this.client = new OpenAI({
        apiKey: apiKey,
        // Ensure API calls are made server-side only
      })
    }

    return this.client
  }

  async generateResponse(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const client = this.getClient()

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini", // Using GPT-4o-mini as requested
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      })

      return completion.choices[0]?.message?.content || "No se pudo generar una respuesta."
    } catch (error) {
      console.error("OpenAI API error:", error)
      throw new Error("Error al generar respuesta con OpenAI API")
    }
  }
}

export const openaiClient = new OpenAIClient()
