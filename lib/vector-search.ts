import { type KnowledgeBase, type KnowledgeChunk, knowledgeBase } from "./knowledge-base"

export interface SearchParams {
  query: string
  k?: number
  framework?: string[]
  language?: string
  stage?: string
}

export interface SearchResult extends KnowledgeChunk {
  similarity_score: number
  relevance_reason: string
}

export class VectorSearchEngine {
  private knowledgeBase: KnowledgeBase

  constructor() {
    this.knowledgeBase = knowledgeBase
  }

  // Simulate text embedding generation
  private generateQueryEmbedding(query: string): number[] {
    const words = query.toLowerCase().split(/\s+/)
    const embedding = [0, 0, 0, 0, 0]

    // Simple keyword-based embedding simulation
    words.forEach((word) => {
      if (["liderazgo", "equipo", "cultura", "contratar", "delegar"].includes(word)) {
        embedding[0] += 0.2 // People dimension
      }
      if (["estrategia", "valor", "cliente", "nicho", "bhag"].includes(word)) {
        embedding[1] += 0.2 // Strategy dimension
      }
      if (["proceso", "kpi", "junta", "l10", "scorecard"].includes(word)) {
        embedding[2] += 0.2 // Execution dimension
      }
      if (["cash", "flujo", "dinero", "precio", "cobranza"].includes(word)) {
        embedding[3] += 0.2 // Cash dimension
      }
      embedding[4] += 0.1 // General business dimension
    })

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return magnitude > 0 ? embedding.map((val) => val / magnitude) : embedding
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0

    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0)
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0))
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0))

    if (magnitude1 === 0 || magnitude2 === 0) return 0
    return dotProduct / (magnitude1 * magnitude2)
  }

  // Calculate keyword overlap score
  private keywordOverlapScore(query: string, chunk: KnowledgeChunk): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const chunkWords = [...chunk.key_terms, ...chunk.topics, ...chunk.text_clean.toLowerCase().split(/\s+/)]

    const matches = queryWords.filter((word) =>
      chunkWords.some((chunkWord) => chunkWord.includes(word) || word.includes(chunkWord)),
    )

    return matches.length / queryWords.length
  }

  // Generate relevance explanation
  private generateRelevanceReason(query: string, chunk: KnowledgeChunk, similarity: number): string {
    const queryWords = query.toLowerCase().split(/\s+/)
    const matchingTopics = chunk.topics.filter((topic) => queryWords.some((word) => topic.toLowerCase().includes(word)))
    const matchingTerms = chunk.key_terms.filter((term) => queryWords.some((word) => term.toLowerCase().includes(word)))

    if (matchingTopics.length > 0) {
      return `Coincide en temas: ${matchingTopics.join(", ")}`
    } else if (matchingTerms.length > 0) {
      return `Términos relevantes: ${matchingTerms.join(", ")}`
    } else if (similarity > 0.7) {
      return `Alta similitud semántica (${Math.round(similarity * 100)}%)`
    } else {
      return `Relacionado con framework ${chunk.framework}`
    }
  }

  // Main search method
  async search(params: SearchParams): Promise<SearchResult[]> {
    const { query, k = 8, framework, language = "es" } = params

    // Get all chunks
    let candidates = this.knowledgeBase.getChunks()

    // Apply filters
    if (framework && framework.length > 0) {
      candidates = candidates.filter((chunk) => framework.includes(chunk.framework))
    }

    if (language) {
      candidates = candidates.filter((chunk) => chunk.language === language)
    }

    // Generate query embedding
    const queryEmbedding = this.generateQueryEmbedding(query)

    // Calculate scores for each candidate
    const scoredResults: SearchResult[] = candidates.map((chunk) => {
      // Ensure chunk has embedding
      if (!chunk.embedding) {
        chunk.embedding = [0.5, 0.5, 0.5, 0.5, 0.5] // Default embedding
      }

      // Calculate similarity scores
      const semanticSimilarity = this.cosineSimilarity(queryEmbedding, chunk.embedding)
      const keywordScore = this.keywordOverlapScore(query, chunk)

      // Framework boost - if query relates to chunk's framework
      const frameworkBoost = this.getFrameworkBoost(query, chunk.framework)

      // Combined score
      const combinedScore = semanticSimilarity * 0.4 + keywordScore * 0.4 + frameworkBoost * 0.2

      return {
        ...chunk,
        similarity_score: combinedScore,
        relevance_reason: this.generateRelevanceReason(query, chunk, combinedScore),
      }
    })

    // Sort by score and return top k
    return scoredResults.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, k)
  }

  private getFrameworkBoost(query: string, framework: string): number {
    const queryLower = query.toLowerCase()

    const frameworkKeywords = {
      People: ["equipo", "liderazgo", "cultura", "contratar", "delegar", "personas"],
      Strategy: ["estrategia", "valor", "cliente", "nicho", "bhag", "posicionamiento"],
      Execution: ["proceso", "kpi", "junta", "l10", "scorecard", "ejecución"],
      Cash: ["cash", "flujo", "dinero", "precio", "cobranza", "efectivo"],
    }

    const keywords = frameworkKeywords[framework as keyof typeof frameworkKeywords] || []
    const matches = keywords.filter((keyword) => queryLower.includes(keyword))

    return matches.length > 0 ? 0.3 : 0
  }

  // Get similar chunks to a given chunk (for related content)
  async getSimilarChunks(chunkId: string, k = 3): Promise<SearchResult[]> {
    const chunks = this.knowledgeBase.getChunks()
    const targetChunk = chunks.find((c) => c.chunk_id === chunkId)

    if (!targetChunk || !targetChunk.embedding) {
      return []
    }

    const otherChunks = chunks.filter((c) => c.chunk_id !== chunkId)

    const scoredResults: SearchResult[] = otherChunks.map((chunk) => {
      const similarity = this.cosineSimilarity(targetChunk.embedding!, chunk.embedding || [0, 0, 0, 0, 0])

      return {
        ...chunk,
        similarity_score: similarity,
        relevance_reason: `Contenido relacionado con ${targetChunk.title}`,
      }
    })

    return scoredResults.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, k)
  }
}

export const vectorSearchEngine = new VectorSearchEngine()
