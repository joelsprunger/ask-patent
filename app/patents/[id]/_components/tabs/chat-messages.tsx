"use client"

import { ChatMessage } from "@/types"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import Markdown from "react-markdown"
import { CopyButton } from "@/components/ui/copy-button"
import { SearchButton } from "@/components/ui/search-button"
import { useEffect, useRef } from "react"

interface ChatMessagesProps {
  messages: ChatMessage[]
  isLoading: boolean
  streamingMessage?: string
}

export function ChatMessages({
  messages,
  isLoading,
  streamingMessage
}: ChatMessagesProps) {
  const processMessageContent = (content: string) => {
    return content.replace(
      /<base_url>/g,
      process.env.NEXT_PUBLIC_BACKEND_API_URL || ""
    )
  }

  // Create a ref for the streaming message element
  const streamingRef = useRef<HTMLDivElement>(null)

  // Scroll to the streaming message when it updates
  useEffect(() => {
    if (streamingMessage && streamingRef.current) {
      streamingRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [streamingMessage])

  return (
    <div className="space-y-4 py-4">
      {messages.map(message => (
        <div
          key={message.id}
          className={cn(
            "flex w-full",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "rounded-lg px-4 py-2 max-w-[80%] relative group",
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            {message.role === "assistant" && (
              <>
                <SearchButton
                  text={processMessageContent(message.content)}
                  className="absolute -top-2 -right-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  iconSize={4}
                />
                <CopyButton
                  text={processMessageContent(message.content)}
                  className="absolute -top-2 -right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  iconSize={4}
                />
              </>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown
                components={{
                  p: ({ children }) => <p className="m-0">{children}</p>,
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 my-2">{children}</ol>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 my-2">{children}</ul>
                  ),
                  li: ({ children }) => <li className="my-0">{children}</li>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-zinc-900 dark:text-zinc-100 hover:text-blue-500 dark:hover:text-blue-500 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {processMessageContent(message.content)}
              </Markdown>
            </div>
          </div>
        </div>
      ))}

      {/* Streaming message */}
      {streamingMessage && (
        <div className="flex justify-start" ref={streamingRef}>
          <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown
                components={{
                  p: ({ children }) => <p className="m-0">{children}</p>,
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 my-2">{children}</ol>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 my-2">{children}</ul>
                  ),
                  li: ({ children }) => <li className="my-0">{children}</li>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-zinc-900 dark:text-zinc-100 hover:text-blue-500 dark:hover:text-blue-500 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {processMessageContent(streamingMessage)}
              </Markdown>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator (only show if not streaming) */}
      {isLoading && !streamingMessage && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg px-4 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
      )}
    </div>
  )
}
