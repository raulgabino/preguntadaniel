export interface KnowledgeChunk {
  doc_id: string
  chunk_id: string
  title: string
  text_clean: string
  t_start: number
  t_end: number
  topics: string[]
  framework: "People" | "Strategy" | "Execution" | "Cash"
  key_terms: string[]
  stage?: string
  language: string
  embedding?: number[] // Simulated embedding vector
}

export class KnowledgeBase {
  private chunks: KnowledgeChunk[] = [
    // People Framework
    {
      doc_id: "people_leadership_001",
      chunk_id: "chunk_001",
      title: "Liderazgo y A-Players",
      text_clean:
        "Los A-players son fundamentales para el crecimiento. Un A-player es alguien que está en el top 10% de su función y que además encaja culturalmente con la organización. La regla es simple: contrata lento, despide rápido. Cuando tienes dudas sobre alguien, ya tienes la respuesta. El costo de mantener a un B-player o C-player es exponencial porque afecta a todo el equipo.",
      t_start: 245,
      t_end: 312,
      topics: ["liderazgo", "contratación", "a-players", "cultura"],
      framework: "People",
      key_terms: ["a-players", "contratación", "cultura", "equipo"],
      language: "es",
      embedding: [0.8, 0.6, 0.9, 0.7, 0.5],
    },
    {
      doc_id: "people_delegation_002",
      chunk_id: "chunk_002",
      title: "Delegación vs Abdicación",
      text_clean:
        "Delegar no es abdicar. Cuando delegas, mantienes la responsabilidad final pero das autoridad para ejecutar. Debes establecer expectativas claras, dar contexto suficiente, y crear checkpoints regulares. La delegación efectiva requiere que entrenes a tu gente, no que simplemente les asignes tareas. El objetivo es que puedan tomar decisiones sin ti.",
      t_start: 567,
      t_end: 634,
      topics: ["delegación", "liderazgo", "responsabilidad", "autonomía"],
      framework: "People",
      key_terms: ["delegación", "responsabilidad", "autonomía", "entrenamiento"],
      language: "es",
      embedding: [0.7, 0.8, 0.6, 0.9, 0.4],
    },

    // Strategy Framework
    {
      doc_id: "strategy_value_prop_001",
      chunk_id: "chunk_003",
      title: "Propuesta de Valor Única",
      text_clean:
        "Tu propuesta de valor debe ser clara, diferenciada y relevante. No puedes ser todo para todos. Debes elegir un nicho específico y ser el mejor en eso. La pregunta clave es: ¿por qué un cliente te elegiría a ti sobre todas las alternativas, incluyendo no hacer nada? Tu propuesta de valor debe resolver un problema real y urgente para tu cliente ideal.",
      t_start: 123,
      t_end: 189,
      topics: ["propuesta de valor", "diferenciación", "nicho", "cliente ideal"],
      framework: "Strategy",
      key_terms: ["propuesta de valor", "diferenciación", "nicho", "cliente"],
      language: "es",
      embedding: [0.9, 0.7, 0.8, 0.6, 0.7],
    },
    {
      doc_id: "strategy_bhag_002",
      chunk_id: "chunk_004",
      title: "BHAG y Visión",
      text_clean:
        "Un BHAG (Big Hairy Audacious Goal) debe ser específico, medible y inspirador. Debe estar entre 10-30 años en el futuro y ser lo suficientemente grande como para requerir un cambio fundamental en tu organización. No es un objetivo financiero, es una declaración de impacto. Por ejemplo: 'Ser la plataforma #1 de educación online en Latinoamérica para 2035'.",
      t_start: 445,
      t_end: 512,
      topics: ["bhag", "visión", "objetivos", "impacto"],
      framework: "Strategy",
      key_terms: ["bhag", "visión", "objetivos", "impacto"],
      language: "es",
      embedding: [0.8, 0.9, 0.7, 0.8, 0.6],
    },

    // Execution Framework
    {
      doc_id: "execution_l10_001",
      chunk_id: "chunk_005",
      title: "Ritmo de Juntas L10",
      text_clean:
        "Las juntas L10 son reuniones semanales de 90 minutos con una agenda fija: Segue (5 min), Scorecard (5 min), Rock Review (5 min), Customer/Employee Headlines (5 min), To-Do List (5 min), IDS - Identify, Discuss, Solve (60 min), Conclude (5 min). La clave es la disciplina: misma hora, mismo día, misma agenda. Sin excepciones.",
      t_start: 678,
      t_end: 745,
      topics: ["l10", "juntas", "agenda", "disciplina"],
      framework: "Execution",
      key_terms: ["l10", "juntas", "scorecard", "disciplina"],
      language: "es",
      embedding: [0.6, 0.8, 0.9, 0.7, 0.8],
    },
    {
      doc_id: "execution_kpis_002",
      chunk_id: "chunk_006",
      title: "KPIs y Scorecard",
      text_clean:
        "Un buen scorecard tiene 5-15 métricas que se revisan semanalmente. Cada métrica debe tener un owner, un goal, y ser un leading indicator, no lagging. Por ejemplo: número de demos programadas (leading) vs revenue del mes (lagging). Los números deben ser simples: verde si está en goal, rojo si no. Sin amarillos, sin excusas.",
      t_start: 234,
      t_end: 301,
      topics: ["kpis", "scorecard", "métricas", "leading indicators"],
      framework: "Execution",
      key_terms: ["kpis", "scorecard", "métricas", "indicadores"],
      language: "es",
      embedding: [0.7, 0.6, 0.8, 0.9, 0.7],
    },

    // Cash Framework
    {
      doc_id: "cash_flow_001",
      chunk_id: "chunk_007",
      title: "Ciclo de Conversión de Efectivo",
      text_clean:
        "El ciclo de conversión de efectivo es el tiempo que tarda tu dinero en volver a ti. Se calcula como: Días de Inventario + Días de Cobranza - Días de Pago a Proveedores. Mientras más corto, mejor. Puedes mejorarlo cobrando más rápido, pagando más lento (sin dañar relaciones), o reduciendo inventario. Cada día que reduces el ciclo libera cash flow.",
      t_start: 456,
      t_end: 523,
      topics: ["cash flow", "ciclo conversión", "cobranza", "inventario"],
      framework: "Cash",
      key_terms: ["cash flow", "ciclo", "cobranza", "inventario"],
      language: "es",
      embedding: [0.8, 0.7, 0.6, 0.8, 0.9],
    },
    {
      doc_id: "cash_pricing_002",
      chunk_id: "chunk_008",
      title: "Estrategia de Pricing",
      text_clean:
        "El pricing no es solo costo + margen. Es una herramienta estratégica. Debes entender el valor que generas para el cliente y capturar una porción justa de ese valor. Si tu producto ahorra $100K al cliente, puedes cobrar $30K y todos ganan. El pricing basado en valor siempre supera al pricing basado en costo. Además, subir precios es más fácil que conseguir más clientes.",
      t_start: 789,
      t_end: 856,
      topics: ["pricing", "valor", "estrategia", "margen"],
      framework: "Cash",
      key_terms: ["pricing", "valor", "margen", "estrategia"],
      language: "es",
      embedding: [0.9, 0.8, 0.7, 0.6, 0.8],
    },
  ]

  getChunks(): KnowledgeChunk[] {
    return this.chunks
  }

  getChunksByFramework(framework: string): KnowledgeChunk[] {
    return this.chunks.filter((chunk) => chunk.framework === framework)
  }

  getChunksByTopics(topics: string[]): KnowledgeChunk[] {
    return this.chunks.filter((chunk) =>
      topics.some((topic) => chunk.topics.some((chunkTopic) => chunkTopic.toLowerCase().includes(topic.toLowerCase()))),
    )
  }
}

export const knowledgeBase = new KnowledgeBase()
