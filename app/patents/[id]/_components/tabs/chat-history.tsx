"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Chat } from "@/types"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"

interface ChatHistoryProps {
  chats: Chat[]
  currentChatId?: string
  onSelectChat: (chat: Chat) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
}

export function ChatHistory({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat
}: ChatHistoryProps) {
  return (
    <div className="flex w-64 flex-col gap-2">
      <Button onClick={onNewChat} className="w-full" variant="outline">
        <Plus className="mr-2 h-4 w-4" />
        New Chat
      </Button>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {chats
            .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
            .map(chat => (
              <div
                key={chat.id}
                className={cn(
                  "group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent",
                  currentChatId === chat.id && "bg-accent"
                )}
                onClick={() => onSelectChat(chat)}
              >
                <span className="line-clamp-1">{chat.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={e => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}
