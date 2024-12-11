export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface Chat {
  id: string
  patentId: string
  title: string
  messages: ChatMessage[]
  lastMessageAt: number
  createdAt: number
} 