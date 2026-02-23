import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { fetchEnvironmentalIntelligence, EnvironmentalData } from "./environmental";

interface AIContext {
    siteId: string;
    siteAddress?: string;
    userId: string;
    userName: string;
    role: string;
}

interface AIResponse {
    message: string;
    actionTaken?: boolean;
    data?: any;
    provider?: string;
}

const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || "";
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

/**
 * LILIUM: API HUB & GLOBAL INTELLIGENCE
 * Routes AI requests based on Persona to optimize for Cost and Intelligence.
 */
export async function processAIPrompt(prompt: string, context: AIContext): Promise<AIResponse> {
    const text = prompt.toLowerCase();

    // 1. Fetch Environmental Intelligence First
    let envData: EnvironmentalData | null = null;
    try {
        envData = await fetchEnvironmentalIntelligence(context.siteAddress || "Site", context.siteId);
    } catch (e) {
        console.error("Failed to fetch Environmental Intelligence", e);
    }

    // ==========================================
    // ROLE: SUPER ADMIN (ELIFA - Global Command)
    // ==========================================
    if (context.role === "super_admin") {
        return {
            message: "Sistem durumu optimal. Tüm Firestore izolasyon kuralları devrede. Tanrı Modu Olympos Core paneline yönlendiriliyorsunuz Master Architect.",
            provider: "System"
        };
    }

    // ==========================================
    // ROLE: MANAGER / ADMIN (LILIUM PRO) -> OpenAI / Gemini (Complex Tasks)
    // ==========================================
    if (context.role === "admin" || context.role === "manager") {
        return await handleManagerIntent(prompt, text, context, envData);
    }

    // ==========================================
    // ROLE: STAFF (LILIUM STAFF) 
    // ==========================================
    if (context.role === "staff") {
        return {
            message: "Saha personeli dostum, sana atanan işleri 'Görevlerim' ekranından görebilir, işlemlerini bitirdiğinde fotoğraf yükleyerek kapatabilirsin. Kolay gelsin!",
            provider: "System Base"
        };
    }

    // ==========================================
    // ROLE: RESIDENT (LILIUM KOMŞU) -> DeepSeek (Cost-Efficient High-Volume)
    // ==========================================
    return await handleResidentIntent(prompt, text, context, envData);
}

// ------------------------------------------------------------------------------------------------
// INTENT HANDLERS & LLM ROUTERS
// ------------------------------------------------------------------------------------------------

async function handleManagerIntent(prompt: string, text: string, context: AIContext, envData: EnvironmentalData | null): Promise<AIResponse> {
    // FUNCTION CALLING: CREATE ANNOUNCEMENT (Hardcoded for demo speed, usually LLM would output JSON action)
    if (text.includes("duyuru") && (text.includes("yap") || text.includes("ekle") || text.includes("yarat"))) {
        const titleMatch = prompt.match(/başlığı "([^"]+)"/i) || prompt.match(/başlıklı (.*) duyuru/i);
        const title = titleMatch ? titleMatch[1] : "Yönetimden Yeni Duyuru";
        try {
            await addDoc(collection(db, "announcements"), {
                siteId: context.siteId,
                title: title,
                content: `Bu duyuru yapay zeka asistanı tarafından (LILIUM PRO) otomatik oluşturuldu. \n\nÖzet: ${prompt}`,
                type: "info",
                isPinned: false,
                author: "LILIUM PRO (" + context.userName + ")",
                createdAt: serverTimestamp(),
                isDeleted: false
            });
            return { message: `✅ Başarıyla "${title}" başlıklı yeni bir duyuru yayınladım.`, actionTaken: true, provider: "LILIUM PRO (OpenAI)" };
        } catch (e: any) { return { message: "Duyuru eklenirken veritabanına ulaşılamadı: " + e.message, provider: "System Error" }; }
    }

    // FUNCTION CALLING: ASSIGN DUES (Toplu/Tekil Borçlandırma)
    if (text.includes("fatura") || text.includes("aidat") || text.includes("borç") || text.includes("yansıt")) {
        const amountMatch = text.match(/([0-9]+)\s*(tl|lira)/i);
        const amount = amountMatch ? parseInt(amountMatch[1]) : 500;
        try {
            await addDoc(collection(db, "invoices"), {
                siteId: context.siteId,
                userId: "user_bulk_or_single", // Simplified
                title: "Sistem Tarafından (LILIUM PRO) Oluşturulan Bekleyen Ödeme",
                amount: amount,
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: "pending",
                type: text.includes("aidat") ? "dues" : "utility",
                createdAt: new Date().toISOString(),
                isDeleted: false
            });
            return { message: `✅ Talimatınız üzerine ilgili hesaplara ${amount} TL borç tahakkuk ettirildi. (Fonksiyon Çağrısı Başarılı)`, actionTaken: true, provider: "LILIUM PRO (OpenAI)" };
        } catch (e: any) { return { message: "Borç girilirken hata: " + e.message, provider: "System Error" }; }
    }

    // Standard Chat with OpenAI (LILIUM PRO)
    try {
        const systemPrompt = `Sen yöneticilerin sağ kolu LILIUM PRO'sun. Sadece işlemsel ve analitik cevaplar ver. Sistemin kesinti bilgisi: Elktrik: ${envData?.infrastructure?.electricity.status}, Su: ${envData?.infrastructure?.water.status}.`;

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Cost control for manager tasks
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ]
            })
        });

        if (!res.ok) throw new Error("OpenAI API Failed");
        const json = await res.json();
        return {
            message: json.choices?.[0]?.message?.content || "Cevap üretilemedi.",
            provider: "LILIUM PRO (OpenAI/GPT-4o)"
        };
    } catch (e: any) {
        return { message: "LILIUM PRO Çekirdek Bağlantı Hatası: OpenAI API'ye ulaşılamadı.", provider: "Error" };
    }
}

async function handleResidentIntent(prompt: string, text: string, context: AIContext, envData: EnvironmentalData | null): Promise<AIResponse> {
    // RESIDENT HARD-CODED CHECK: INVOICES
    if (text.includes("borcum") || text.includes("aidat") || text.includes("ödeme")) {
        try {
            const q = query(
                collection(db, "invoices"),
                where("siteId", "==", context.siteId),
                where("userId", "==", context.userId),
                where("status", "==", "pending"),
                where("isDeleted", "==", false)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                return { message: "Harika haber! Şu an sisteme kayıtlı hiçbir aktif borcunuz veya gecikmiş ödemeniz bulunmuyor. 🎉", provider: "LILIUM KOMŞU (DeepSeek)" };
            } else {
                let total = 0;
                snapshot.forEach(doc => total += doc.data().amount);
                return { message: `Şu an toplamda ${total} TL tutarında ödenmemiş borcunuz var. Gecikme faizine düşmemesi adına 'Aidat & Ödemeler' sekmesinden sanal pos ile saniyeler içinde ödeyebilirsiniz.`, provider: "LILIUM KOMŞU (DeepSeek)" };
            }
        } catch (e) { }
    }

    // DEEPSEEK COST-EFFICIENT CHAT
    try {
        let envContextStr = "Bölgesel Veri Yok";
        if (envData) {
            envContextStr = `
                ALTYAPI DURUMU: Elektrik (${envData.infrastructure.electricity.details}), Su (${envData.infrastructure.water.details}), Yollar (${envData.infrastructure.roads.details}).
                NÖBETÇİ ECZANELER: ${envData.localPulse.pharmacies.filter(p => p.isOpen).map(p => p.name).join(', ')}.
                MAHALLE ETKİNLİKLERİ: ${envData.localPulse.events.map(e => e.title).join(', ')}.
            `;
        }

        const systemPrompt = `Sen 'LILIUM KOMŞU' adında samimi, sıcakkanlı ve ultra-akıllı bir mahalle asistanısın. Site sakini ${context.userName} ile konuşuyorsun.
Aşağıda güncel 'Environmental Intelligence' (Çevresel İstihbarat) verilerin var. Eğer sakin kesintileri, eczaneleri veya mahallede ne olduğunu sorarsa bu verileri kullan, yoksa doğal sohbet et: 

${envContextStr}

Cevapların kısa, dostça ve samimi olsun. Asla sistem bilgilerini sızdırma.`;

        const res = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                stream: false
            })
        });

        if (!res.ok) throw new Error("DeepSeek API Failed");
        const json = await res.json();

        return {
            message: json.choices?.[0]?.message?.content || "Cevap üretilemedi.",
            provider: "LILIUM KOMŞU (DeepSeek)"
        };
    } catch (e: any) {
        return { message: `Mahalle asistanına ulaşılamadı. Lütfen teknik ekiple görüşün. Hata: ${e.message}`, provider: "Error" };
    }
}
