"use client";

import { useState, useRef, useEffect } from "react";
import { useSite } from "./providers/SiteProvider";
import { processAIPrompt } from "@/lib/ai";
import { MessageSquareText, X, Send, Sparkles, Loader2, Bot } from "lucide-react";

export default function AssistantWidget() {
    const { currentUser, activeSite } = useSite();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ from: 'user' | 'ai', text: string }[]>([]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    // Only show if user is logged in. 
    // THIS MUST COME AFTER USE_EFFECT TO PREVENT REACT HOOK ORDER ERRORS
    if (!currentUser) return null;

    const personaName = currentUser.role === "admin" || currentUser.role === "manager"
        ? "Yönetici Asistanı"
        : currentUser.role === "super_admin" ? "Olympos Core AI" : "Site Asistanı";

    const aiColor = currentUser.role === "admin" || currentUser.role === "manager"
        ? "bg-violet-600"
        : currentUser.role === "super_admin" ? "bg-emerald-600" : "bg-blue-600";

    const gradientBorder = currentUser.role === "admin" || currentUser.role === "manager"
        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
        : currentUser.role === "super_admin" ? "bg-gradient-to-r from-emerald-400 to-cyan-500" : "bg-gradient-to-r from-blue-400 to-indigo-500";

    const openChat = () => {
        if (!isOpen && messages.length === 0) {
            setMessages([
                { from: 'ai', text: `Merhaba ${currentUser.name}! Ben ${activeSite?.name || 'Sitenizin'} özel yapay zeka asistanıyım. Size nasıl yardımcı olabilirim?` }
            ]);
        }
        setIsOpen(true);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userText = input.trim();
        setInput("");
        setMessages(prev => [...prev, { from: 'user', text: userText }]);
        setIsThinking(true);

        // Simulate network delay for effect
        setTimeout(async () => {
            const response = await processAIPrompt(userText, {
                siteId: activeSite?.id || "default",
                userId: currentUser.uid,
                userName: currentUser.name || "Kullanıcı",
                role: currentUser.role
            });

            setMessages(prev => [...prev, { from: 'ai', text: response.message }]);
            setIsThinking(false);
        }, 1200);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl mb-4 overflow-hidden border border-gray-100 flex flex-col h-[500px] max-h-[80vh] animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className={`${gradientBorder} p-[2px]`}>
                        <div className="bg-white h-full w-full rounded-t-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full ${aiColor} flex items-center justify-center text-white shadow-md`}>
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{personaName}</h3>
                                    <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Çevrimiçi
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.from === 'user'
                                        ? 'bg-gray-900 text-white rounded-tr-sm'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                                    }`}>
                                    {msg.from === 'ai' && <Bot className="w-3.5 h-3.5 inline-block mr-1.5 mb-0.5 text-gray-400" />}
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2 text-gray-400">
                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                    <span className="text-xs font-medium">Bağlantı kuruluyor...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Bir komut yazın..."
                                className="w-full bg-gray-100 text-gray-900 text-sm rounded-full pl-4 pr-12 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isThinking}
                                className="absolute right-1 text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 p-2 rounded-full transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating FAB */}
            {!isOpen && (
                <button
                    onClick={openChat}
                    className={`w-14 h-14 rounded-full ${gradientBorder} text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group overflow-hidden relative`}
                >
                    <MessageSquareText className="w-6 h-6 z-10 relative group-hover:scale-110 transition-transform duration-300" />
                    {/* Ripple/Glow effect */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <div className="absolute -inset-1 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </button>
            )}
        </div>
    );
}
