// This module acts as the "Environmental Intelligence" hub for Lilium.
// In a production environment, this would connect to real government APIs 
// (e.g., ISKI, BEDAS), Google Maps Places API, or use a web scraper.
// 
// 
// For this Phase 14 architecture, we simulate the intelligent localized data
// collection based on the 'address' or 'siteId' of the active property, while
// wiring up the API configurations from process.env.

// Integrations (Ana Kaynak via .env.local)
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const BRAVE_API_KEY = process.env.NEXT_PUBLIC_BRAVE_API_KEY;

export interface EnvironmentalData {
    infrastructure: {
        electricity: { status: "normal" | "outage" | "planned", details?: string };
        water: { status: "normal" | "outage" | "planned", details?: string };
        internet: { status: "normal" | "outage" | "planned", details?: string };
        roads: { status: "clear" | "construction", details?: string };
    };
    localPulse: {
        pharmacies: Array<{ name: string; address: string; distance: string; isOpen: boolean }>;
        markets: Array<{ name: string; address: string; distance: string; isOpen: boolean }>;
        events: Array<{ title: string; date: string; location: string }>;
    };
    lastScanned: string;
}

export const fetchEnvironmentalIntelligence = async (siteAddress: string, siteId: string): Promise<EnvironmentalData> => {
    // Simulate API Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const isDemoSite = siteAddress.toLowerCase().includes("silikon vadisi") || siteId === "demo";

    // 1. Generate Infrastructure Watcher Data
    // We add a touch of randomness to make the AI responses dynamic, but keep it realistic.
    const hasPowerOutage = Math.random() > 0.85; // 15% chance of fake outage
    const hasWaterOutage = Math.random() > 0.90; // 10% chance

    // 2. Generate Local Pulse Data (ANTALYA FOCUSED)
    const dummyPharmacies = [
        { name: "Lara Şifa Eczanesi (Nöbetçi)", address: "Şirinyalı Mah. Tekelioğlu Cad.", distance: "450m", isOpen: true },
        { name: "Konyaaltı Merkez Eczanesi", address: "Gürsu Mah. Atatürk Blv.", distance: "1.2km", isOpen: false }
    ];

    const dummyEvents = [
        { title: "Antalya Altın Portakal Film Festivali Gösterimi", date: "Bugün", location: "Cam Piramit (800m)" },
        { title: "Konyaaltı Belediyesi Açık Hava Konseri", date: "Yarın Akşam 20:30", location: "Konyaaltı Kent Meydanı (1.5km)" }
    ];

    return {
        infrastructure: {
            electricity: {
                status: hasPowerOutage ? "outage" : "normal",
                details: hasPowerOutage ? "AEDAŞ kaynaklı bölgesel arıza (Kepez/Muratpaşa). Tahmini onarım: 14:30" : "Kesinti Yok"
            },
            water: {
                status: hasWaterOutage ? "outage" : "normal",
                details: hasWaterOutage ? "ASAT Ana hat basınç arızası. Tahmini onarım: 18:00" : "Kesinti Yok"
            },
            internet: { status: "normal", details: "Altyapı stabil (Antalya Merkez)." },
            roads: {
                status: isDemoSite ? "construction" : "clear",
                details: isDemoSite ? "Büyükşehir Belediyesi 100. Yıl Bulvarı asfalt yenileme çalışması." : "Trafik ve yollar açık."
            }
        },
        localPulse: {
            pharmacies: dummyPharmacies,
            markets: [
                { name: "Süpermarket Ekspres", address: "Site Girişi", distance: "100m", isOpen: true },
                { name: "Manav Amca", address: "Ara Sokak", distance: "300m", isOpen: true }
            ],
            events: dummyEvents
        },
        lastScanned: new Date().toISOString()
    };
};
