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
import { cn } from "@/lib/utils"
import {
  AnimatePresence,
  motion,
  type TargetAndTransition,
} from "framer-motion"
import { Loader2, MessageSquare, SendHorizonal, X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useAuth } from "@/lib/providers/auth-provider"

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
  const [isPulsing, setIsPulsing] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { user: currentUser } = useAuth()

  useEffect(() => {
    if (!isOpen) {
      const pulseInterval = setInterval(() => {
        setIsPulsing(true)
        setTimeout(() => setIsPulsing(false), 2000)
      }, 10000)
      return () => clearInterval(pulseInterval)
    }
    setIsPulsing(false)
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (
          messages.length > 1 ||
          (messages.length === 1 && messages[0].sender !== "bot")
        ) {
          scrollToBottom()
        } else {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = 0
          }
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [messages, isOpen])

  const toggleChatbot = () => {
    setIsOpen((prev) => !prev)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInput(e.target.value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) {
      inputRef.current?.focus()
      return
    }

    if (!currentUser?.id) {
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
      const res = await axios.post(
        `http://localhost:8000/api/chat/${currentUser.id}`,
        { message: userMessage.content },
        { headers: { "Content-Type": "application/json" } },
      )

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: res.data.response,
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
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }

  // ✅ Typed animations
  const floatingAnimation: TargetAndTransition = {
    y: [0, -6, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut" as const,
    },
  }

  const pulseAnimation: TargetAndTransition = {
    scale: [1, 1.15, 1],
    boxShadow: [
      "0 0 0 0 rgba(124, 58, 237, 0.7)",
      "0 0 0 10px rgba(124, 58, 237, 0)",
      "0 0 0 0 rgba(124, 58, 237, 0)",
    ],
    transition: {
      duration: 2,
      ease: "easeInOut" as const,
    },
  }

  const currentAnimation: TargetAndTransition | undefined = isOpen
    ? undefined
    : isPulsing
      ? pulseAnimation
      : floatingAnimation

  return (
    <>
      <motion.div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div animate={currentAnimation}>
          <Button
            onClick={toggleChatbot}
            size="icon"
            className={cn(
              "h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary shadow-lg",
              isPulsing && !isOpen && "ring-4 ring-primary/30",
            )}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageSquare className="h-6 w-6" />
            )}
          </Button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-4 z-50 w-[calc(100%-2rem)] max-w-md"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
          >
            <Card className="shadow-xl flex flex-col rounded-lg overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground py-3 px-4">
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-primary-foreground flex items-center justify-center">
                    <div className="text-primary font-bold text-sm">AI</div>
                  </Avatar>
                  Student Assistant
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0" ref={chatContainerRef}>
                <ScrollArea className="h-[400px] px-4 py-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[85%] p-3 rounded-lg text-sm mb-2",
                        msg.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted border",
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="animate-spin h-4 w-4" />
                      Thinking...
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>

              <CardFooter className="p-4 border-t">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-3 w-full"
                >
                  <Input
                    ref={inputRef}
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                  >
                    <SendHorizonal className="h-5 w-5" />
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
