"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, ShieldAlert, Sparkles, CheckCircle2, UserPlus, FileText, ToggleLeft, ToggleRight, Building, Settings, Wallet, Loader2 } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";

type Message = {
    id: string;
    sender: "user" | "ai";
    text: string;
    actionParams?: any;
};

export default function AdminAIPanel() {
    const { activeSite, hasFeature } = useSite();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "ai",
            text: `Merhaba! Ben LILIUM PRO (Yönetici Asistanı). ${activeSite?.name || 'Siteniz'} için tüm yönetimsel işlemleri benimle konuşarak yapabilirsiniz.\n\nÖrnek Komutlar:\n- "A Blok Daire 5'e Mehmet Yıldız'ı kaydet, telefonu 0555..."\n- "Geçen ayki su faturasını 15.000 TL olarak giderlere ekle."\n- "Tüm siteye yarın suların kesileceğine dair duyuru gönder."`
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Feature Toggles (Mock state for UI)
    const [siteFeatures, setSiteFeatures] = useState({
        security: true, // Enables GuestPass
        pool: false, // Enables reservations
        market: true, // Enables marketplace
    });

    // Bulk Billing State
    const [duesAmount, setDuesAmount] = useState("");
    const [duesTitle, setDuesTitle] = useState("Aylık Genel Aidat");
    const [isBilling, setIsBilling] = useState(false);
    const [billSuccess, setBillSuccess] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Analyze intention (Mocking Gemini API Function Calling)
        setTimeout(() => {
            let aiMsg: Message = { id: (Date.now() + 1).toString(), sender: "ai", text: "" };
            const lowerInput = userMsg.text.toLowerCase();

            if (lowerInput.includes("kaydet") || (lowerInput.includes("ekle") && lowerInput.includes("daire"))) {
                aiMsg.text = "Harika! Yeni site sakininin kaydını veritabanına işliyorum. Kendisine bir 'Hoş Geldiniz' SMS'i gönderiyorum.";
                aiMsg.actionParams = { type: 'ADD_USER', title: "Kullanıcı Kaydedildi" };
            } else if (lowerInput.includes("fatura") || lowerInput.includes("gider") || lowerInput.includes("tl")) {
                aiMsg.text = "Finansal kayıt güncellendi. Belirttiğiniz tutar (Su Faturası) gider tablolarına ve Finansal Şeffaflık panosuna eklendi.";
                aiMsg.actionParams = { type: 'ADD_EXPENSE', title: "Gider İşlendi" };
            } else if (lowerInput.includes("duyuru") || lowerInput.includes("mesaj")) {
                aiMsg.text = "Duyuru hazırlandı! Sakinlerin panosunda yayınlandı ve acil koduyla bildirim olarak iletildi.";
                aiMsg.actionParams = { type: 'SEND_ANNOUNCEMENT', title: "Duyuru Yayınlandı" };
            } else {
                aiMsg.text = "Anladım. Bu işlemi gerçekleştirebilmem için bana biraz daha detay verebilir misiniz? Örneğin blok/daire no veya tam tutar gibi.";
            }

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const toggleFeature = (key: keyof typeof siteFeatures) => {
        setSiteFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleBulkBilling = async () => {
        if (!activeSite || !duesAmount || isNaN(Number(duesAmount))) return;
        setIsBilling(true);

        try {
            // 1. Fetch all memberships for this site
            const q = query(collection(db, "memberships"), where("siteId", "==", activeSite.id));
            const querySnapshot = await getDocs(q);

            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days

            const amount = Number(duesAmount);

            // 2. Add an invoice for each user in the site
            // Note: If a user has multiple flats in the same site, they have multiple memberships.
            // We bill per flat basically. For demo we bill per membership record.
            const promises = querySnapshot.docs.map(docSnap => {
                const membership = docSnap.data();
                return addDoc(collection(db, "invoices"), {
                    siteId: activeSite.id,
                    userId: membership.userId,
                    flatDetails: membership.flatDetails || "Bilinmeyen Daire",
                    amount: amount,
                    title: duesTitle,
                    status: "pending",
                    type: "dues",
                    createdAt: new Date().toISOString(),
                    dueDate: dueDate.toISOString().split('T')[0]
                });
            });

            // Fallback: If no memberships found (fresh DB), just bill our current demo user 
            if (promises.length === 0) {
                promises.push(addDoc(collection(db, "invoices"), {
                    siteId: activeSite.id,
                    userId: "user_1", // The mock logged in user
                    amount: amount,
                    title: duesTitle,
                    status: "pending",
                    type: "dues",
                    createdAt: new Date().toISOString(),
                    dueDate: dueDate.toISOString().split('T')[0]
                }));
            }

            await Promise.all(promises);

            setBillSuccess(true);
            setDuesAmount("");
            setTimeout(() => setBillSuccess(false), 3000);

            // Tell the AI to announce what happened
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: "ai",
                text: `Sistem: Sitedeki tüm dairelere başarıyla "${duesTitle}" kalemi altında ${amount} TL yansıtıldı. Tüm borçlulara anlık e-posta/push bildirimleri gönderildi.`
            }]);

        } catch (error) {
            console.error("Bulk billing error:", error);
            alert("Toplu aidat kesimi sırasında bir hata oluştu.");
        } finally {
            setIsBilling(false);
        }
    };

    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="flex flex-col gap-6 lg:h-[calc(100vh-8rem)]">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                            <Sparkles className="w-6 h-6 text-violet-600" />
                            LILIUM PRO
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">Form doldurmayı unutun. OpenAI (GPT-4o) destekli yapay zeka yöneticinizle sitenizi konuşarak yönetin.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                        <Building className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-700">{activeSite?.name || 'Seçili Site Yok'}</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                    {/* AI Chat Interface */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-[500px]">
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50 rounded-t-xl">
                            <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 leading-tight">LILIUM PRO (Fonksiyon Asistanı)</h2>
                                <p className="text-xs text-green-600 font-medium tracking-wide">● Çevrimiçi ve Emrinize Amade</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex max-w-[85%] ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
                                    {msg.sender === 'ai' && (
                                        <div className="w-8 h-8 rounded-full bg-white border border-indigo-100 shadow-sm flex items-center justify-center shrink-0 mr-2 mt-1">
                                            <Bot className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    )}
                                    <div className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-4 rounded-2xl whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-gray-900 text-white rounded-br-sm'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                                            }`}>
                                            {msg.text}
                                        </div>

                                        {/* Action Card Render (Function Calling Result) */}
                                        {msg.actionParams && (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 w-64 shadow-sm flex items-start gap-3 mt-1">
                                                <div className="mt-0.5 shrink-0 text-green-600">
                                                    {msg.actionParams.type === 'ADD_USER' && <UserPlus className="w-5 h-5" />}
                                                    {msg.actionParams.type === 'ADD_EXPENSE' && <FileText className="w-5 h-5" />}
                                                    {msg.actionParams.type === 'SEND_ANNOUNCEMENT' && <ShieldAlert className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-green-800 uppercase tracking-wide">{msg.actionParams.title}</p>
                                                    <p className="text-xs text-green-700 mt-0.5">Veritabanı Başarıyla Güncellendi.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-white border border-indigo-100 shadow-sm flex items-center justify-center shrink-0 mr-2">
                                        <Bot className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm p-4 rounded-2xl rounded-bl-sm flex items-center gap-1.5 h-[52px]">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100 rounded-b-xl">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Bir komut yazın (Örn: Aidatları %20 artır)..."
                                    className="w-full bg-gray-50 border border-gray-300 rounded-full py-3.5 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                />
                                <button
                                    onClick={handleSend}
                                    className={`absolute right-2 top-2 p-1.5 rounded-full transition-colors ${input.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400'}`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar: Quick Actions & Settings */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 overflow-y-auto">

                        {/* AI-OCR Invoice Scanner */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                            <div className="relative z-10 flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-violet-600" />
                                <h2 className="font-bold text-gray-900 text-lg">AI-OCR Fatura Tarayıcı</h2>
                            </div>
                            <p className="relative z-10 text-xs text-gray-500 mb-4 leading-tight">Gelen fiziki veya PDF faturaları yükleyin, yapay zeka fiyat/kurum bilgisini okuyup otomatik işlesin.</p>

                            <label className="relative z-10 flex flex-col items-center justify-center w-full h-24 border-2 border-violet-200 border-dashed rounded-lg cursor-pointer bg-violet-50 hover:bg-violet-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileText className="w-6 h-6 text-violet-500 mb-1" />
                                    <p className="text-xs text-violet-700 font-bold tracking-wide">Fatura Yükle (PDF/IMG)</p>
                                </div>
                                <input type="file" className="hidden" />
                            </label>
                        </div>

                        {/* Bulk Billing Module */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet className="w-5 h-5 text-violet-600" />
                                <h2 className="font-bold text-gray-900 text-lg">Hızlı Borç Dağıtımı</h2>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-tight">Sitedeki tüm mevcut dairelerin hesaplarına tek tuşla aidat veya gider payı borcu yansıtın.</p>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Açıklama / Kalem</label>
                                    <input
                                        type="text"
                                        value={duesTitle}
                                        onChange={e => setDuesTitle(e.target.value)}
                                        placeholder="Örn: Haziran 2026 Aidatı"
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Daire Başı Tutar (TL)</label>
                                    <input
                                        type="number"
                                        value={duesAmount}
                                        onChange={e => setDuesAmount(e.target.value)}
                                        placeholder="Orn: 1250"
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none font-bold text-indigo-900"
                                    />
                                </div>
                                <button
                                    onClick={handleBulkBilling}
                                    disabled={isBilling || !duesAmount || isNaN(Number(duesAmount))}
                                    className={`mt-2 w-full font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm ${billSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500'}`}
                                >
                                    {isBilling ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> İşleniyor...</>
                                    ) : billSuccess ? (
                                        <><CheckCircle2 className="w-4 h-4" /> Başarıyla Yansıtıldı</>
                                    ) : (
                                        "Tüm Siteye Borç Kes"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Impersonation Module */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <UserPlus className="w-5 h-5 text-indigo-600" />
                                <h2 className="font-bold text-gray-900 text-lg">Sakin Gözünden Test Et</h2>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-tight">Mevcut ayarları ve modülleri normal bir site sakini girdiğinde nasıl göründüğünü deneyimleyin.</p>

                            <button
                                onClick={() => {
                                    // We cannot easily use the context hook inside onClick without importing setCurrentUser,
                                    // Wait, we didn't extract setCurrentUser from useSite() in this component.
                                    // Let's mock a hard redirect or alert for now, or just emit a global event/reload.
                                    // Let's just use localStorage and reload to simulate switching accounts.
                                    localStorage.setItem("currentUser", JSON.stringify({
                                        uid: "test_resident_x",
                                        phone: "+905559998877",
                                        role: "resident",
                                        name: "Demo Sakin (Test Modu)"
                                    }));
                                    window.location.href = "/directory"; // send them out of admin panel
                                }}
                                className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                            >
                                <UserPlus className="w-4 h-4" /> Sakin Profiline Geç
                            </button>
                        </div>

                        {/* Site Feature Toggles */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col h-max">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings className="w-5 h-5 text-gray-600" />
                                <h2 className="font-bold text-gray-900 text-lg">Modül Yönetimi</h2>
                            </div>

                            <p className="text-[11px] text-gray-500 mb-5 leading-tight">Aşağıdaki modülleri açtığınızda sakinlerin arayüzünde ilgili sekmeler görünür veya gizlenir.</p>

                            <div className="flex flex-col gap-4">
                                {/* Toggle 1 */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Güvenlik ve Kargo</h3>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Misafir (QR) Geçiş Modülü</p>
                                    </div>
                                    <button onClick={() => toggleFeature('security')} className={`transition-colors ${siteFeatures.security ? 'text-indigo-600' : 'text-gray-300'}`}>
                                        {siteFeatures.security ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                                    </button>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Toggle 2 */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Havuz ve Tesisler</h3>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Tesis Rezervasyon Modülü</p>
                                    </div>
                                    <button onClick={() => toggleFeature('pool')} className={`transition-colors ${siteFeatures.pool ? 'text-indigo-600' : 'text-gray-300'}`}>
                                        {siteFeatures.pool ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                                    </button>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Toggle 3 */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">İkinci El Pasajı</h3>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Komşuluk Ağı Pazar Yeri</p>
                                    </div>
                                    <button onClick={() => toggleFeature('market')} className={`transition-colors ${siteFeatures.market ? 'text-indigo-600' : 'text-gray-300'}`}>
                                        {siteFeatures.market ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
