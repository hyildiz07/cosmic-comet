"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Bot, User, Minimize2, Loader2 } from "lucide-react";

export default function LiliumAIWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
        { role: 'ai', text: 'Merhaba! Ben Lilium AI, site yönetimi asistanınızım. Size nasıl yardımcı olabilirim? (Örnek: "Aidat borcum ne kadar?")' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const toggleChat = () => {
        if (isOpen && isMinimized) {
            setIsMinimized(false);
        } else {
            setIsOpen(!isOpen);
            setIsMinimized(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Add user message
        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput("");
        setIsLoading(true);

        // Simulate AI Response (RAG Pipeline Simulation)
        setTimeout(() => {
            let aiResponse = "Anlıyorum. Size daha iyi yardımcı olabilmek için sistem yöneticilerimiz yapay zeka entegrasyonunu tamamlıyor.";

            const lowerQuery = userMessage.toLowerCase();
            if (lowerQuery.includes("borcum") || lowerQuery.includes("aidat") || lowerQuery.includes("ne kadar")) {
                aiResponse = "Apsiyon kayıtlarına göre şu anki vadesi geçmiş borcunuz 1.250 TL'dir. 'Aidat & Ödemeler' sekmesinden Iyzico ile komisyonsuz (39 gün) ödeme yapabilirsiniz.";
            } else if (lowerQuery.includes("havuz") || lowerQuery.includes("saat")) {
                aiResponse = "Yaz dönemi açık havuzumuz her gün sabah 08:00 ile akşam 22:00 saatleri arasında kullanıma açıktır.";
            } else if (lowerQuery.includes("asansör") || lowerQuery.includes("bozuk") || lowerQuery.includes("araba")) {
                aiResponse = "Arıza bildiriminiz için teşekkürler. İsterseniz bu durumu hızlıca Yönetim Helpdesk sistemine 'Talep Oluştur' diyerek aktarabilirim. Onaylıyor musunuz?";
            }

            setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
            setIsLoading(false);
        }, 1200);
    };

    if (!isOpen) {
        return (
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50 group"
            >
                <Bot className="w-7 h-7 text-white" />
                {/* Tooltip */}
                <div className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Lilium AI'a Sorun
                </div>
            </button>
        );
    }

    return (
        <div className={`fixed right-6 z-50 flex flex-col transition-all duration-300 shadow-2xl rounded-2xl border border-gray-200 overflow-hidden bg-white ${isMinimized ? 'bottom-6 h-14 w-72' : 'bottom-6 h-[500px] w-[350px] sm:w-[400px]'}`}>

            {/* Chat Header */}
            <div
                className="h-14 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 flex justify-between items-center cursor-pointer shrink-0"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2 text-white">
                    <Bot className="w-6 h-6" />
                    <span className="font-bold">Lilium AI</span>
                    <span className="w-2 h-2 rounded-full bg-green-400 ml-1"></span>
                </div>
                <div className="flex items-center gap-1 text-white/80">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-white/20 rounded-md transition-colors">
                        <Minimize2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-white/20 rounded-md transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Messages Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'self-end bg-indigo-600 text-white flex-row-reverse' : 'self-start bg-white border border-gray-200 text-gray-800'} p-3 rounded-2xl ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                <div className="shrink-0 mt-0.5">
                                    {msg.role === 'ai' ? <Bot className="w-4 h-4 text-indigo-500" /> : <User className="w-4 h-4 text-indigo-200" />}
                                </div>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="self-start bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                <Bot className="w-4 h-4 text-indigo-500" />
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                <span className="text-xs text-gray-500">Düşünüyor...</span>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Bir soru sorun..."
                            className="flex-1 bg-gray-100 border-none outline-none rounded-full px-4 text-sm focus:ring-2 focus:ring-indigo-300"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
