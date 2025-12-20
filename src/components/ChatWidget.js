import React, { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { MessageCircle, X, Send } from "lucide-react"
import StyledMarkdown from "./StyledMarkdown"
import { useAuth } from "../auth/AuthProvider"

const ChatWidget = () => {
    const { user } = useAuth()
    const location = useLocation()
    const isHomePage = location.pathname === "/"
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "Hello! I'm an AI assistant for Dr. Fatima Kasamnath. How can I help you today?",
        },
    ])
    const [inputText, setInputText] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!inputText.trim()) return

        const userMessage = { role: "user", text: inputText }
        setMessages((prev) => [...prev, userMessage])
        setInputText("")
        setIsLoading(true)

        try {
            // Filter out the initial model message for the API history
            const apiHistory = messages.slice(1).map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            }))

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.text,
                    history: apiHistory,
                    userEmail: user?.email,
                }),
            })

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error)
            }

            setMessages((prev) => [
                ...prev,
                { role: "model", text: data.response },
            ])
        } catch (error) {
            console.error("Chat error:", error)
            setMessages((prev) => [
                ...prev,
                {
                    role: "model",
                    text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={`fixed right-6 z-50 flex flex-col-reverse gap-4 items-end ${isHomePage ? "bottom-24" : "bottom-6"}`}>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? "hidden" : "flex"
                    } items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-110`}>
                <MessageCircle className="w-8 h-8" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
                    {/* Header */}
                    <div className="bg-primary-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <h3 className="font-semibold">Dr. Fatima's Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}>
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user"
                                        ? "bg-primary-600 text-white rounded-br-none"
                                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
                                        }`}>
                                    {msg.role === "model" ? (
                                        <StyledMarkdown content={msg.text} />
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSendMessage}
                        className="p-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type your question..."
                                className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 px-4 text-sm"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputText.trim()}
                                className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default ChatWidget
