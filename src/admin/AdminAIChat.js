import React, { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Trash2, Sparkles, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import StyledMarkdown from "../components/StyledMarkdown"

const AdminAIChat = () => {
    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "Hello Admin! I'm your data-aware assistant. I can help you analyze appointments, check schedules, or provide insights about your practice. How can I help you today?",
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
    }, [messages])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!inputText.trim() || isLoading) return

        const userMessage = { role: "user", text: inputText }
        setMessages((prev) => [...prev, userMessage])
        setInputText("")
        setIsLoading(true)

        try {
            const apiHistory = messages.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            }))

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.text,
                    history: apiHistory,
                    isAdmin: true,
                }),
            })

            if (!response.ok) throw new Error("API request failed")

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            setMessages((prev) => [
                ...prev,
                { role: "model", text: data.response },
            ])
        } catch (error) {
            console.error("Admin Chat error:", error)
            setMessages((prev) => [
                ...prev,
                {
                    role: "model",
                    text: "I'm sorry, I'm having trouble connecting to the data server right now. Please try again later.",
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const clearChat = () => {
        if (window.confirm("Are you sure you want to clear the conversation?")) {
            setMessages([
                {
                    role: "model",
                    text: "Chat cleared. How can I assist you now?",
                },
            ])
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">AI Assistant</h2>
                        <div className="flex items-center gap-1.5 text-xs text-blue-100 mt-0.5">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span>Online & Data-Aware</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-blue-100 hover:text-white"
                    title="Clear Chat">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${msg.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-indigo-600 border border-indigo-100"
                                    }`}>
                                    {msg.role === "user" ? <User className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                                </div>
                                <div className={`p-5 rounded-3xl shadow-sm ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none"
                                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                    }`}>
                                    {msg.role === "model" ? (
                                        <div className="prose prose-sm max-w-none prose-blue">
                                            <StyledMarkdown content={msg.text} />
                                        </div>
                                    ) : (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                            </div>
                            <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-2">
                                <span className="text-sm text-gray-500 font-medium italic">Analyzing data...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask about appointments, patients, or clinic stats..."
                            className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            disabled={isLoading}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                            <Bot className="w-5 h-5" />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !inputText.trim()}
                        className="bg-blue-600 text-white px-6 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-semibold">
                    Data secure & Private
                </p>
            </div>
        </div>
    )
}

export default AdminAIChat
