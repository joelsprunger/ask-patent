"use client"

import { ChatMessage } from "@/types"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import Markdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import "katex/dist/katex.min.css"
import { CopyButton } from "@/components/ui/copy-button"
import { SearchButton } from "@/components/ui/search-button"

interface ChatMessagesProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
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
                  text={message.content}
                  className="absolute -top-2 -right-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  iconSize={4}
                />
                <CopyButton
                  text={message.content}
                  className="absolute -top-2 -right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  iconSize={4}
                />
              </>
            )}
            <div className="prose prose-sm dark:prose-invert">
              <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => <p className="m-0">{children}</p>
                }}
              >
                {message.content}
              </Markdown>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg px-4 py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
      )}
    </div>
  )
}
