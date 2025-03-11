"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage, Chat } from "@/types"
import { ChatHistory } from "./chat-history"
import { ChatMessages } from "./chat-messages"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { v4 as uuidv4 } from "uuid"
import { summarizeTextAction } from "@/actions/utils-actions"
import {
  getSuggestedQuestionsAction,
  deleteThreadAction
} from "@/actions/patents-actions"
import { useIncrementAIRequest } from "@/lib/providers/auth-provider"
import { streamFromApi } from "@/lib/utils/stream-helpers"

interface AskPatentTabProps {
  patentId: string
}

export function AskPatentTab({ patentId }: AskPatentTabProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useLocalStorage<Chat[]>("patent-chats", [])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const incrementAIRequest = useIncrementAIRequest()

  // Add effect to fetch suggested questions
  useEffect(() => {
    async function fetchSuggestedQuestions() {
      const response = await getSuggestedQuestionsAction(patentId)
      incrementAIRequest()
      if (response.isSuccess && response.data) {
        setSuggestedQuestions(response.data)
      }
    }
    fetchSuggestedQuestions()
  }, [patentId, incrementAIRequest])

  // Create or get existing chat
  useEffect(() => {
    if (!currentChat) {
      const existingChat = chats.find(
        chat => chat.patentId === patentId && chat.messages.length > 0
      )
      if (existingChat) {
        setCurrentChat(existingChat)
      } else {
        const newChat: Chat = {
          id: uuidv4(),
          patentId,
          title: "New Chat",
          messages: [],
          lastMessageAt: Date.now(),
          createdAt: Date.now()
        }
        setCurrentChat(newChat)
        setChats(prev => [...prev, newChat])
      }
    }
  }, [patentId, chats, currentChat, setChats])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const generateTitle = async (
    chatId: string,
    question: string,
    answer: string,
    chat: Chat
  ) => {
    try {
      const context = question
      const titleResponse = await summarizeTextAction(context)
      if (titleResponse.isSuccess && titleResponse.data) {
        const updatedChat = {
          ...chat,
          title: titleResponse.data
        }
        setCurrentChat(updatedChat)
        setChats(prev => prev.map(c => (c.id === chatId ? updatedChat : c)))
      }
    } catch (error) {
      console.error("Error generating title:", error)
    }
  }

  // Helper function to handle chat updates
  const updateChat = (chat: Chat) => {
    setCurrentChat(chat)
    setChats(prev => prev.map(c => (c.id === chat.id ? chat : c)))
  }

  // Function to stream chat response
  async function streamChatResponse(question: string, chat: Chat) {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: question,
      timestamp: Date.now()
    }

    // Update chat with user message
    const updatedChat = {
      ...chat,
      messages: [...chat.messages, userMessage],
      lastMessageAt: Date.now()
    }
    updateChat(updatedChat)

    // Reset streaming message
    setStreamingMessage("")

    // Get API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX
    if (!apiUrl || !apiPrefix) {
      console.error("API URL or prefix not configured")
      return
    }

    const url = new URL(`${apiPrefix}/patent-agent/chat`, apiUrl)

    try {
      let fullResponse = ""

      await streamFromApi({
        url: url.toString(),
        method: "POST",
        body: {
          patent_id: patentId,
          query: question,
          thread_id: chat.id
        },
        onChunk: chunk => {
          setStreamingMessage(prev => prev + chunk)
          fullResponse += chunk
        },
        onComplete: async completeResponse => {
          // Add the complete response as a message
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            role: "assistant",
            content: completeResponse,
            timestamp: Date.now()
          }

          const chatWithAnswer = {
            ...updatedChat,
            messages: [...updatedChat.messages, assistantMessage],
            lastMessageAt: Date.now()
          }

          // Clear streaming message
          setStreamingMessage("")

          // Update chat with complete response
          updateChat(chatWithAnswer)

          // Generate title for new chats
          if (chat.messages.length === 0) {
            await generateTitle(
              chat.id,
              question,
              completeResponse,
              chatWithAnswer
            )
          }

          // Increment AI request counter
          incrementAIRequest()
        },
        onError: error => {
          console.error("Error streaming chat:", error)
          setStreamingMessage("")
        }
      })
    } catch (error) {
      console.error("Error streaming chat:", error)
      setStreamingMessage("")
    }
  }

  // Handler for user submitted questions
  async function handleSubmit() {
    if (!input.trim() || !currentChat || isLoading) return

    setIsLoading(true)
    try {
      await streamChatResponse(input, currentChat)
      setInput("") // Clear input after successful submission
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for suggested questions
  async function handleSuggestedQuestion(question: string) {
    if (isLoading) return

    // Create new chat if none exists
    const newChat: Chat = {
      id: uuidv4(),
      patentId,
      title: "New Chat",
      messages: [],
      lastMessageAt: Date.now(),
      createdAt: Date.now()
    }

    // Use current chat if it exists, otherwise use new chat
    const chatToUse = currentChat || newChat

    // If we're using a new chat, add it to the list
    if (!currentChat) {
      setCurrentChat(chatToUse)
      setChats(prev => [...prev, chatToUse])
    }

    setIsLoading(true)
    try {
      await streamChatResponse(question, chatToUse)
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      patentId,
      title: "New Chat",
      messages: [],
      lastMessageAt: Date.now(),
      createdAt: Date.now()
    }
    setCurrentChat(newChat)
    setChats(prev => [...prev, newChat])
  }

  const handleDeleteChat = async (chatId: string) => {
    // First delete the thread from the backend
    const response = await deleteThreadAction(chatId)

    if (!response.isSuccess) {
      // You might want to show an error toast here
      console.error("Failed to delete thread:", response.message)
      return
    }

    // Then update local state
    setChats(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChat?.id === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId)
      const lastChat = remainingChats.find(chat => chat.patentId === patentId)
      if (lastChat) {
        setCurrentChat(lastChat)
      } else {
        startNewChat()
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] gap-4">
      <ChatHistory
        chats={chats.filter(chat => chat.patentId === patentId)}
        currentChatId={currentChat?.id}
        onSelectChat={chat => setCurrentChat(chat)}
        onNewChat={startNewChat}
        onDeleteChat={handleDeleteChat}
      />

      <div className="flex flex-1 flex-col">
        {currentChat?.messages.length === 0 && !streamingMessage ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            <div className="w-full max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask a question about this patent..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-center text-sm text-muted-foreground">
                  Or try one of these questions:
                </p>
                <div className="flex flex-col gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto min-h-[60px] whitespace-normal p-4 text-left text-sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              <ChatMessages
                messages={currentChat?.messages || []}
                isLoading={isLoading}
                streamingMessage={streamingMessage}
              />
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="mt-4 flex items-center gap-2">
              <Input
                placeholder="Ask a question about this patent..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                disabled={isLoading}
              />
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
