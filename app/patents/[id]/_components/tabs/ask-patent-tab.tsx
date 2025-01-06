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
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { v4 as uuidv4 } from "uuid"
import { summarizeTextAction } from "@/actions/utils-actions"
import { getSuggestedQuestionsAction } from "@/actions/patents-actions"

interface AskPatentTabProps {
  patentId: string
}

export function AskPatentTab({ patentId }: AskPatentTabProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useLocalStorage<Chat[]>("patent-chats", [])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Add effect to fetch suggested questions
  useEffect(() => {
    async function fetchSuggestedQuestions() {
      const response = await getSuggestedQuestionsAction(patentId)
      if (response.isSuccess && response.data) {
        setSuggestedQuestions(response.data)
      }
    }
    fetchSuggestedQuestions()
  }, [patentId])

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
        {currentChat?.messages.length === 0 ? (
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
                      onClick={async () => {
                        // Create new chat if none exists
                        let chatToUse = currentChat
                        if (!chatToUse) {
                          chatToUse = {
                            id: uuidv4(),
                            patentId,
                            title: "New Chat",
                            messages: [],
                            lastMessageAt: Date.now(),
                            createdAt: Date.now()
                          }
                          setCurrentChat(chatToUse)
                          setChats([...chats, chatToUse])
                        }

                        setIsLoading(true)

                        try {
                          const userMessage: ChatMessage = {
                            id: uuidv4(),
                            role: "user",
                            content: question,
                            timestamp: Date.now()
                          }

                          const updatedChat = {
                            ...chatToUse,
                            messages: [...chatToUse.messages, userMessage],
                            lastMessageAt: Date.now()
                          }
                          setCurrentChat(updatedChat)
                          setChats(prev =>
                            prev.map(chat =>
                              chat.id === chatToUse.id ? updatedChat : chat
                            )
                          )

                          const response = await askPatentQuestionAction(
                            patentId,
                            question
                          )

                          if (response.isSuccess && response.data) {
                            const assistantMessage: ChatMessage = {
                              id: uuidv4(),
                              role: "assistant",
                              content: response.data.answer,
                              timestamp: Date.now()
                            }

                            const chatWithAnswer = {
                              ...updatedChat,
                              messages: [
                                ...updatedChat.messages,
                                assistantMessage
                              ],
                              lastMessageAt: Date.now()
                            }

                            setCurrentChat(chatWithAnswer)
                            setChats(prev =>
                              prev.map(chat =>
                                chat.id === chatToUse.id ? chatWithAnswer : chat
                              )
                            )

                            if (chatToUse.messages.length === 0) {
                              await generateTitle(
                                chatToUse.id,
                                question,
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
                      }}
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
