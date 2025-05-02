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

import "dotenv/config"

import axios from "axios"

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

  const { currentUser } = useAppStore()

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
      if (isOpen && !isLoading) {
        inputRef.current?.focus()
      }
      return
    }

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
      const res = await axios.post(
        `http://localhost:8000/api/chat/${currentUser._id}`,
        { message: userMessage.content },
        { headers: { "Content-Type": "application/json" } }
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

  const floatingAnimation = {
    y: [0, -6, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "easeInOut",
    },
  }

  const pulseAnimation = {
    scale: [1, 1.15, 1],
    boxShadow: [
      "0 0 0 0 rgba(124, 58, 237, 0.7)",
      "0 0 0 10px rgba(124, 58, 237, 0)",
      "0 0 0 0 rgba(124, 58, 237, 0)",
    ],
    transition: {
      duration: 2,
      ease: "easeInOut",
    },
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
        <motion.div
          animate={isOpen ? {} : isPulsing ? pulseAnimation : floatingAnimation}
        >
          <Button
            onClick={toggleChatbot}
            size="icon"
            className={cn(
              "h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary shadow-lg hover:shadow-xl transition-all",
              isPulsing && !isOpen && "ring-4 ring-primary/30"
            )}
            aria-label="Toggle chatbot"
          >
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={{ opacity: 0, scale: 0.8, rotate: isOpen ? 0 : 45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: isOpen ? -45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MessageSquare className="h-6 w-6" />
              )}
            </motion.span>
          </Button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-50 w-[calc(100%-2rem)] max-w-[400px] md:max-w-md left-4 md:left-auto"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className="border shadow-xl max-h-[80vh] flex flex-col rounded-lg overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Avatar className="h-8 w-8 bg-primary-foreground flex items-center justify-center">
                    <motion.div
                      className="text-primary font-bold text-sm"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      AI
                    </motion.div>
                  </Avatar>
                  Student Assistant
                </CardTitle>
              </CardHeader>

              <CardContent
                className="p-0 flex-grow overflow-hidden"
                ref={chatContainerRef}
              >
                <ScrollArea className="h-[400px] px-4 py-4">
                  <div className="flex flex-col gap-4 pb-2">
                    {messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay:
                            index === 0 && messages.length === 1 && isOpen
                              ? 0.3
                              : 0,
                        }}
                        className={cn(
                          "max-w-[85%] p-3 rounded-lg text-sm leading-relaxed",
                          msg.sender === "user"
                            ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-tl-none border border-border"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <div className="text-xs opacity-70 mt-1 text-right">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-[85%] p-3 bg-muted rounded-lg rounded-tl-none border border-border flex items-center gap-2 text-sm"
                      >
                        <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
                        <motion.span
                          className="text-muted-foreground"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Thinking...
                        </motion.span>
                      </motion.div>
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
                    ref={inputRef}
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || !currentUser?._id || isLoading}
                      className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 transition-colors"
                    >
                      <SendHorizonal className="h-5 w-5" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </motion.div>
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
