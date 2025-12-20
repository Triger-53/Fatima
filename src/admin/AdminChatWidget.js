import React, { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { MessageSquare, X, Send, Bot, ShieldAlert } from "lucide-react"
import StyledMarkdown from "../components/StyledMarkdown"
import { supabase } from "../supabase"

const AdminChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: "model",
            text: "Welcome, Admin. I'm your AI assistant. I can help you query appointments, sessions, and manage clinic data. How can I assist you today?",
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
                    isAdmin: true,
                }),
            })

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
                    text: "Sorry, I encountered an error accessing the admin data. Please try again.",
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col-reverse gap-4 items-end">
            {/* Admin Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? "hidden" : "flex"
                    } items-center justify-center w-14 h-14 bg-indigo-700 text-white rounded-full shadow-2xl hover:bg-indigo-800 transition-all duration-300 transform hover:scale-110 border-2 border-indigo-400`}>
                <Bot className="w-8 h-8" />
            </button>

            {/* Admin Chat Window */}
            {isOpen && (
                <div className="bg-slate-900 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[550px] border border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-4 flex justify-between items-center text-white border-b border-slate-700">
                        <div className="flex items-center space-x-2">
                            <ShieldAlert className="w-5 h-5 text-amber-400" />
                            <h3 className="font-bold tracking-wide">Admin Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="bg-white/10 p-1 rounded-full hover:bg-white/20 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}>
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-none shadow-lg"
                                        : "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none shadow-md"
                                        }`}>
                                    {msg.role === "model" ? (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <StyledMarkdown content={msg.text} />
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700 shadow-md">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSendMessage}
                        className="p-4 bg-slate-900 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Query dashboard data..."
                                className="flex-1 p-2 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 text-sm transition-all"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputText.trim()}
                                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-lg">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default AdminChatWidget
