export interface BusinessProfile {
  phase: "startup" | "scaleup" | "growth" | "mature"
  industry: string
  size: "micro" | "small" | "medium" | "large"
  revenue: string
  employees: number
  mainChallenges: string[]
  currentFocus: "people" | "strategy" | "execution" | "cash"
}

export interface DiagnosticQuestion {
  id: string
  question: string
  type: "single" | "multiple" | "text" | "number"
  options?: string[]
  category: "basic" | "phase" | "challenges" | "focus"
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  // Preguntas básicas
  {
    id: "industry",
    question: "¿En qué industria opera tu empresa?",
    type: "single",
    category: "basic",
    options: [
      "Tecnología/Software",
      "E-commerce/Retail",
      "Servicios profesionales",
      "Manufactura",
      "Salud/Bienestar",
      "Educación",
      "Fintech/Servicios financieros",
      "Alimentos y bebidas",
      "Construcción/Inmobiliaria",
      "Otro",
    ],
  },
  {
    id: "employees",
    question: "¿Cuántos empleados tiene tu empresa actualmente?",
    type: "number",
    category: "basic",
  },
  {
    id: "revenue",
    question: "¿Cuál es tu rango de ingresos anuales aproximado?",
    type: "single",
    category: "basic",
    options: [
      "Menos de $500K MXN",
      "$500K - $2M MXN",
      "$2M - $10M MXN",
      "$10M - $50M MXN",
      "$50M - $200M MXN",
      "Más de $200M MXN",
    ],
  },
  // Preguntas de fase
  {
    id: "growth_stage",
    question: "¿En qué etapa consideras que está tu empresa?",
    type: "single",
    category: "phase",
    options: [
      "Validando el producto/mercado",
      "Creciendo rápidamente",
      "Escalando operaciones",
      "Optimizando y madurando",
    ],
  },
  {
    id: "main_challenge",
    question: "¿Cuál es tu principal desafío actual?",
    type: "single",
    category: "challenges",
    options: [
      "Encontrar y retener talento clave",
      "Definir estrategia y diferenciación",
      "Mejorar procesos y sistemas",
      "Generar más flujo de efectivo",
      "Expandir a nuevos mercados",
      "Optimizar operaciones",
    ],
  },
  {
    id: "priority_area",
    question: "¿En qué área necesitas enfocar más atención?",
    type: "single",
    category: "focus",
    options: [
      "Equipo y liderazgo (People)",
      "Estrategia y posicionamiento (Strategy)",
      "Procesos y ejecución (Execution)",
      "Finanzas y flujo de efectivo (Cash)",
    ],
  },
]

export function determineBusinessPhase(profile: Partial<BusinessProfile>): BusinessProfile["phase"] {
  const { employees = 0, revenue, growth_stage } = profile as any

  // Lógica basada en empleados y ingresos
  if (employees < 10 && (revenue?.includes("Menos de $500K") || revenue?.includes("$500K - $2M"))) {
    return "startup"
  }

  if (employees >= 10 && employees < 50 && (revenue?.includes("$2M - $10M") || revenue?.includes("$10M - $50M"))) {
    return "scaleup"
  }

  if (
    employees >= 50 &&
    employees < 200 &&
    (revenue?.includes("$50M - $200M") || growth_stage?.includes("Escalando"))
  ) {
    return "growth"
  }

  if (employees >= 200 || revenue?.includes("Más de $200M") || growth_stage?.includes("Optimizando")) {
    return "mature"
  }

  // Fallback basado en growth_stage
  if (growth_stage?.includes("Validando")) return "startup"
  if (growth_stage?.includes("Creciendo")) return "scaleup"
  if (growth_stage?.includes("Escalando")) return "growth"
  if (growth_stage?.includes("Optimizando")) return "mature"

  return "startup" // Default
}

export function getPhaseCharacteristics(phase: BusinessProfile["phase"]) {
  const characteristics = {
    startup: {
      name: "Startup",
      description: "Validando producto-mercado, buscando tracción inicial",
      keyFocus: ["Validación de mercado", "Producto mínimo viable", "Primeros clientes"],
      commonChallenges: ["Encontrar product-market fit", "Generar ingresos consistentes", "Construir equipo inicial"],
      frameworks: ["Strategy", "Cash"],
      metrics: ["Customer acquisition", "Product-market fit", "Burn rate"],
    },
    scaleup: {
      name: "Scale-up",
      description: "Crecimiento acelerado, escalando operaciones",
      keyFocus: ["Escalamiento de ventas", "Construcción de equipo", "Sistemas y procesos"],
      commonChallenges: ["Escalar el equipo rápidamente", "Mantener la cultura", "Optimizar procesos"],
      frameworks: ["People", "Execution"],
      metrics: ["Revenue growth", "Team scaling", "Process efficiency"],
    },
    growth: {
      name: "Growth",
      description: "Expansión sostenida, optimización de operaciones",
      keyFocus: ["Expansión de mercado", "Optimización operacional", "Liderazgo distribuido"],
      commonChallenges: ["Mantener crecimiento", "Desarrollar líderes", "Eficiencia operacional"],
      frameworks: ["Strategy", "Execution", "People"],
      metrics: ["Market expansion", "Operational efficiency", "Leadership development"],
    },
    mature: {
      name: "Mature",
      description: "Empresa establecida, enfoque en innovación y optimización",
      keyFocus: ["Innovación continua", "Optimización de márgenes", "Desarrollo de talento"],
      commonChallenges: ["Mantener innovación", "Optimizar rentabilidad", "Sucesión de liderazgo"],
      frameworks: ["Strategy", "People", "Cash"],
      metrics: ["Innovation metrics", "Profitability", "Talent development"],
    },
  }

  return characteristics[phase]
}

export function generatePersonalizedInsights(profile: BusinessProfile): string {
  const phaseChar = getPhaseCharacteristics(profile.phase)

  return `
Basado en tu perfil empresarial, identifico que tu empresa está en la fase de **${phaseChar.name}**.

**Características de tu fase actual:**
${phaseChar.description}

**Áreas de enfoque prioritarias:**
${phaseChar.keyFocus.map((focus) => `• ${focus}`).join("\n")}

**Desafíos típicos en esta fase:**
${phaseChar.commonChallenges.map((challenge) => `• ${challenge}`).join("\n")}

**Frameworks más relevantes para ti:**
${phaseChar.frameworks.join(", ")}

Ahora que entiendo mejor tu contexto, puedo darte consejos más específicos y relevantes para tu situación actual.
  `.trim()
}
