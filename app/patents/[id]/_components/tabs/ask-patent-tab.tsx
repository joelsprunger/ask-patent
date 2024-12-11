"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { askPatentQuestionAction } from "@/actions/patents-actions"
import { Loader2, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage, Chat } from "@/types"
import { ChatHistory } from "./chat-history"
import { ChatMessages } from "./chat-messages"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { v4 as uuidv4 } from "uuid"
import { summarizeTextAction } from "@/actions/utils-actions"

interface AskPatentTabProps {
  patentId: string
}

export function AskPatentTab({ patentId }: AskPatentTabProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useLocalStorage<Chat[]>("patent-chats", [])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
  }, [patentId, chats, currentChat])

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
      const context = `Q: ${question}\nA: ${answer}`
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

  async function handleSubmit() {
    if (!input.trim() || !currentChat) return

    const isNewChat = currentChat.messages.length === 0
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input,
      timestamp: Date.now()
    }

    setIsLoading(true)

    try {
      // Update with user message first
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        lastMessageAt: Date.now()
      }
      setCurrentChat(updatedChat)
      setChats(prev =>
        prev.map(chat => (chat.id === currentChat.id ? updatedChat : chat))
      )

      setInput("")

      // Get the answer
      const response = await askPatentQuestionAction(patentId, input)

      if (response.isSuccess && response.data) {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: response.data.answer,
          timestamp: Date.now()
        }

        const chatWithAnswer = {
          ...updatedChat,
          messages: [...updatedChat.messages, assistantMessage],
          lastMessageAt: Date.now()
        }

        setCurrentChat(chatWithAnswer)
        setChats(prev =>
          prev.map(chat => (chat.id === currentChat.id ? chatWithAnswer : chat))
        )

        // Generate title after getting the answer for new chats
        if (isNewChat) {
          await generateTitle(
            currentChat.id,
            input,
            response.data.answer,
            chatWithAnswer
          )
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error)
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

  const handleDeleteChat = (chatId: string) => {
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
        <ScrollArea className="flex-1 pr-4">
          <ChatMessages
            messages={currentChat?.messages || []}
            isLoading={isLoading}
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
            onClick={() => {
              console.log("Button clicked!")
              handleSubmit()
            }}
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
      </div>
    </div>
  )
}
