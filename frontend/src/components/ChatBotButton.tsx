"use client"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, MessageSquare, SendHorizonal, X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  processedContent?: string
}

const ChatbotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      content: "Hello! I'm your student assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { currentUser } = useAppStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Scroll to bottom when messages change or chatbot opens
  useEffect(() => {
    if (isOpen) {
      // Use a small timeout to allow rendering before scrolling
      const timer = setTimeout(() => {
        scrollToBottom()
      }, 50) // Reduced timeout slightly
      return () => clearTimeout(timer)
    }
  }, [messages, isOpen])

  const toggleChatbot = () => setIsOpen((prev) => !prev)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInput(e.target.value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!currentUser?._id) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content:
            "Authentication error: User information missing. Please log in again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
      setInput("")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/chat/${currentUser._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage.content }),
        }
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(
          `API failed with status ${res.status}: ${
            errorData.message || res.statusText
          }`
        )
      }

      const data = await res.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      console.error("Chatbot error:", err)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: "Sorry, something went wrong. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <motion.div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={toggleChatbot}
          size="icon"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary shadow-lg hover:shadow-xl transition-all"
          aria-label="Toggle chatbot"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MessageSquare className="h-6 w-6" />
              )}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 left-4 right-4 sm:bottom-24 sm:right-6 sm:left-auto z-50 sm:w-full sm:max-w-md"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className="border shadow-xl max-h-[80vh] sm:max-h-[600px] flex flex-col rounded-lg overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Avatar className="h-8 w-8 bg-primary-foreground flex items-center justify-center">
                    <div className="text-primary font-bold text-sm">AI</div>
                  </Avatar>
                  Student Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-grow overflow-hidden">
                {/* Temporarily using a fixed height for testing welcome message visibility */}
                <ScrollArea className="h-[400px]">
                  <div className="flex flex-col gap-4 pb-2">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "max-w-[90%] p-3 rounded-lg text-sm leading-relaxed",
                          msg.sender === "user"
                            ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-tl-none border border-border"
                        )}
                      >
                        <p>{msg.content}</p>
                        <div className="text-xs opacity-70 mt-1 text-right">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="max-w-[90%] p-3 bg-muted rounded-lg rounded-tl-none border border-border flex items-center gap-2 text-sm">
                        <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Thinking...
                        </span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4 border-t bg-background">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-3 w-full"
                >
                  <Input
                    placeholder={
                      currentUser?._id
                        ? "Ask me anything..."
                        : "Please log in to chat..."
                    }
                    value={input}
                    onChange={handleInputChange}
                    className="flex-1 text-sm h-10"
                    disabled={!currentUser?._id || isLoading}
                    autoFocus={isOpen}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || !currentUser?._id || isLoading}
                    className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <SendHorizonal className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatbotButton
