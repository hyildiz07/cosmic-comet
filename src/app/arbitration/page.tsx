"use client";

import { useState, useEffect, useRef } from "react";
import { Gavel, HeartHandshake, Scale, TrendingDown, Users, AlertTriangle, Send, BrainCircuit, Activity, ChevronRight, Zap, Sparkles } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";

type Comment = {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    isAi?: false;
};

type AiVerdict = {
    id: string;
    mode: "single" | "trio";
    content: string; // The final consensus
    cost: number;
    trioLogs?: { persona: string; quote: string; style: "economist" | "empath" | "lawyer" }[];
};

export default function ArbitrationPage() {
    const { activeSite } = useSite();
    const balance = activeSite?.aiBalance || 0;
    const [topic] = useState("Havuzun yaz aylarında gece 00:00'a kadar açık kalması talebi.");
    const [comments, setComments] = useState<Comment[]>([
        { id: "1", author: "Ahmet Y. (A Blok)", content: "Yazın hava çok sıcak oluyor, işten geç geliyoruz. 22:00 kapanış saati çok erken, en azından 12'ye kadar uzatılsın.", timestamp: "Dün 21:40" },
        { id: "2", author: "Ayşe K. (B Blok)", content: "Havuz bizim bloğun hemen altında. Gece 12'ye kadar su sesi ve bağırış çağırışla uyuyamayız. Hastamız var!", timestamp: "Bugün 09:15" },
        { id: "3", author: "Mehmet S. (C Blok)", content: "Havuz motorlarının gece çalışması fazladan elektrik demek. Aidatlara zam gelecekse ben karşıyım.", timestamp: "Bugün 11:20" },
    ]);
    const [newComment, setNewComment] = useState("");
    const [verdict, setVerdict] = useState<AiVerdict | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingPhase, setThinkingPhase] = useState("");

    const handleSendComment = () => {
        if (!newComment.trim()) return;
        setComments(prev => [...prev, {
            id: Date.now().toString(),
            author: "Siz",
            content: newComment,
            timestamp: "Az Önce"
        }]);
        setNewComment("");
    };

    const requestAiVerdict = async (mode: "single" | "trio") => {
        if (!activeSite) return alert("Lütfen bir site seçin.");

        const expectedCost = mode === "single" ? 5 : 15;
        if (balance < expectedCost) {
            alert("Yeterli AI Bakiyesi yok. Lütfen sistem bakiye yükleyin.");
            return;
        }

        setIsThinking(true);
        setVerdict(null);
        setThinkingPhase("GCP Cloud: Analiz Başlatılıyor...");

        try {
            const generateAiVerdict = httpsCallable(functions, "generateAiVerdict");
            const result = await generateAiVerdict({
                siteId: activeSite.id,
                topic,
                comments: comments.map(c => ({ author: c.author, text: c.content })),
                mode
            });

            const data = result.data as any;

            let parsedTrioLogs = undefined;
            let finalContent = data.verdict;

            // Simple parser to extract trio persona logs if they exist in the text response
            // For a production app, the Cloud Function should return structured JSON instead of raw text.
            if (mode === "trio") {
                const logs: any[] = [];
                const lines = data.verdict.split("\n");

                const getStyle = (persona: string) => {
                    if (persona.toLowerCase().includes("ekonomist")) return "economist";
                    if (persona.toLowerCase().includes("hukuk")) return "lawyer";
                    return "empath";
                };

                finalContent = lines.filter((line: string) => {
                    const match = line.match(/^\[(.*?)\]:\s*(.*)/);
                    if (match && !match[1].toLowerCase().includes("sentez")) {
                        logs.push({ persona: match[1], quote: match[2], style: getStyle(match[1]) });
                        return false;
                    }
                    if (match && match[1].toLowerCase().includes("sentez")) {
                        return true; // Keep the synthesis preamble
                    }
                    return true;
                }).join("\n").replace(/^\[(.*?)\]:\s*/, ""); // remove the [Sentez Karar]: prefix if it starts with it

                if (logs.length > 0) parsedTrioLogs = logs;
            }

            setVerdict({
                id: `v-${Date.now()}`,
                mode,
                cost: data.costDeduced || expectedCost,
                trioLogs: parsedTrioLogs,
                content: finalContent
            });

            // Note: The activeSite balance will automatically update in real-time 
            // since we have an active onSnapshot listener in SiteProvider!
        } catch (error: any) {
            console.error("Cloud Function failed:", error);
            alert(`AI Motoru Yanıt Vermedi: ${error.message}`);
        } finally {
            setIsThinking(false);
            setThinkingPhase("");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header & Balance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                        <Scale className="w-7 h-7 text-indigo-600" />
                        AI Uzlaşı Konseyi (Cloud Connected)
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Site içi anlaşmazlıklarda Google Gemini'ın adil hakemliğine başvurun.</p>
                </div>

                {/* AI Billing Display */}
                <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${balance > 50 ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Zap className={`w-4 h-4 ${balance > 50 ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Sitenin AI Bakiyesi</p>
                            <p className="text-sm font-bold text-gray-900">{balance} Kredi</p>
                        </div>
                    </div>
                    <button className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors">
                        Bakiye Yükle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Topic & Resident Chat */}
                <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[700px]">
                    <div className="p-4 border-b border-gray-100 bg-orange-50/50">
                        <h2 className="text-sm text-orange-600 font-bold mb-1 uppercase tracking-wide flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Açık Müzakere Başlığı
                        </h2>
                        <p className="font-medium text-gray-900 leading-snug">{topic}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                                    <Users className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="font-bold text-sm text-gray-900">{comment.author}</span>
                                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-tr-xl rounded-b-xl text-sm text-gray-800 border border-gray-100 inline-block">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                placeholder="Konsey için görüşünüzü belirtin..."
                                className="flex-1 bg-white border border-gray-300 rounded-lg py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                            <button
                                onClick={handleSendComment}
                                className="absolute right-2 top-2 p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: AI Board & Verdict */}
                <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[700px]">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                            <BrainCircuit className="w-5 h-5 text-indigo-600" />
                            GCP AI Karar Mekanizması
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Yeterli görüş beyan edildiyse konseyden karar talep edin.</p>
                    </div>

                    <div className="p-4 flex gap-2 border-b border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => requestAiVerdict("single")}
                            disabled={isThinking || !activeSite}
                            className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold shadow-sm hover:border-indigo-500 transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                        >
                            <Gavel className="w-4 h-4 text-indigo-600" />
                            Tekil Hakem Modu
                            <span className="text-[10px] text-gray-400 font-normal">Maliyet: 5 Kredi</span>
                        </button>

                        <button
                            onClick={() => requestAiVerdict("trio")}
                            disabled={isThinking || !activeSite}
                            className="flex-1 bg-indigo-600 border border-indigo-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-1 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 w-0 group-hover:w-full transition-all duration-300 ease-out skew-x-12 -ml-4" />
                            <Users className="w-4 h-4" />
                            Üçlü Konsey Modu
                            <span className="text-[10px] text-indigo-200 font-normal">Maliyet: 15 Kredi</span>
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50/30">
                        {isThinking ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <Activity className="w-8 h-8 text-indigo-600 animate-pulse" />
                                <div>
                                    <p className="font-bold text-gray-900">Google Gemini İstek İşleniyor...</p>
                                    <p className="text-sm text-gray-500 mt-1 animate-pulse">{thinkingPhase}</p>
                                </div>
                            </div>
                        ) : verdict ? (
                            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Trio Logs */}
                                {verdict.trioLogs && (
                                    <div className="flex flex-col gap-3 mb-2">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Konsey İçi Değerlendirme Çıktıları</h3>
                                        {verdict.trioLogs.map((log, idx) => (
                                            <div key={idx} className={`p-3 rounded-lg border text-sm ${log.style === 'economist' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                                                log.style === 'empath' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                                                    'bg-blue-50 border-blue-100 text-blue-900'
                                                }`}>
                                                <div className="flex items-center gap-1.5 mb-1.5 opacity-80 font-bold text-xs uppercase">
                                                    {log.style === 'economist' && <TrendingDown className="w-3.5 h-3.5" />}
                                                    {log.style === 'empath' && <HeartHandshake className="w-3.5 h-3.5" />}
                                                    {log.style === 'lawyer' && <Scale className="w-3.5 h-3.5" />}
                                                    {log.persona}
                                                </div>
                                                <p className="italic leading-snug">"{log.quote}"</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Final Verdict */}
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-200 to-purple-200 opacity-20 rounded-bl-full" />
                                    <h3 className="text-indigo-800 font-black mb-3 text-sm flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        NİHAİ UZLAŞI KARARI
                                    </h3>
                                    <div className="text-sm text-indigo-950 font-medium whitespace-pre-wrap leading-relaxed">
                                        {verdict.content}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-700/60">
                                        <span>Hesaptan Düşen: -{verdict.cost} Kredi</span>
                                        <span>Kaynak: Gemini 2.5 Pro</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                <Scale className="w-12 h-12 text-gray-300 mb-2" />
                                <p className="text-sm font-medium text-gray-500">Müzakere tamamlandığında<br />hüküm talep edebilirsiniz.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
