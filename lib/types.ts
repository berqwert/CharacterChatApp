export type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  error?: boolean
  retryable?: boolean
}

export type ChatRequest = {
  characterId: string
  systemPrompt: string
  history: Message[]
}

export type ChatResponse = {
  reply: string
}

export type ChatErrorResponse = {
  error: string
  reply?: string
}

