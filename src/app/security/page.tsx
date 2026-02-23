"use client";

import { useState } from "react";
import { QrCode, ScanLine, Package, Search, Camera, CheckCircle2, AlertCircle, Building, Users, BellRing, UserCheck } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";

type ScanResult = {
    valid: boolean;
    name?: string;
    type?: string;
    host?: string;
    message?: string;
};

export default function SecurityTabletPage() {
    const { activeSite } = useSite();
    const [activeTab, setActiveTab] = useState<"scan" | "deliver">("scan");

    // Scan State
    const [scanCode, setScanCode] = useState("");
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    // Delivery State
    const [flatNumber, setFlatNumber] = useState("");
    const [courierName, setCourierName] = useState("Trendyol Express");
    const [deliverySuccess, setDeliverySuccess] = useState(false);

    const handleSimulateScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanCode) return;

        setIsScanning(true);
        setScanResult(null);

        setTimeout(() => {
            setIsScanning(false);
            // Mock Validation Logic
            if (scanCode.length > 10 && scanCode.includes("date")) {
                setScanResult({
                    valid: true,
                    name: "Misafir veya Kurye",
                    type: "Doğrulanmış QR Code",
                    host: "A Blok - Daire 12",
                    message: "Geçiş İzni Onaylandı. Lütfen Yönlendiriniz."
                });
            } else {
                setScanResult({
                    valid: false,
                    message: "Böyle bir geçiş kimliği veritabanında bulunamadı veya süresi dolmuş."
                });
            }
        }, 1200);
    };

    const handleDelivery = () => {
        if (!flatNumber) return;

        setDeliverySuccess(true);
        setFlatNumber("");

        // Mock sending notification to resident (would tie to Firebase in real app)
        setTimeout(() => {
            setDeliverySuccess(false);
        }, 4000);
    };

    // Responsive warning if viewed on small screen
    return (
        <div className="flex flex-col gap-6 lg:h-[calc(100vh-8rem)]">
            {/* Tablet Header (High Contrast) */}
            <div className="bg-gray-900 rounded-2xl shadow-lg p-5 shrink-0 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center shadow-inner">
                        <ShieldCheckIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-wide uppercase">Güvenlik & Danışma Noktası</h1>
                        <p className="text-gray-400 mt-1 text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Nöbetçi Sistemi Aktif • {activeSite?.name || 'Siteniz'}
                        </p>
                    </div>
                </div>

                <div className="flex bg-gray-800 rounded-xl p-1 shadow-inner">
                    <button
                        onClick={() => setActiveTab("scan")}
                        className={`px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "scan" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"}`}
                    >
                        <ScanLine className="w-5 h-5" />
                        Aks Kodu Okut
                    </button>
                    <button
                        onClick={() => setActiveTab("deliver")}
                        className={`px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "deliver" ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white"}`}
                    >
                        <Package className="w-5 h-5" />
                        Kargo Teslim Al
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6">
                {/* Main Action Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    {activeTab === "scan" ? (
                        <div className="w-full max-w-lg flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">

                            <div className="text-center">
                                <h2 className="text-3xl font-black text-gray-900 mb-2">QR ve Şifre Kontrolü</h2>
                                <p className="text-gray-500 font-medium">Lütfen misafire ait kodu kameraya gösterin veya panele girin.</p>
                            </div>

                            {/* Simulated Camera Area */}
                            <div className="w-64 h-64 bg-slate-100 border-4 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-400 relative">
                                <Camera className="w-12 h-12 mb-3 opacity-50" />
                                <p className="text-sm font-bold">Kamera Bekleniyor...</p>

                                {/* Scanning Laser Animation */}
                                {isScanning && (
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-red-500/20 border-b-2 border-red-500 animate-[scan_1.5s_ease-in-out_infinite_alternate]" />
                                )}
                            </div>

                            <form onSubmit={handleSimulateScan} className="w-full relative">
                                <input
                                    type="text"
                                    value={scanCode}
                                    onChange={e => setScanCode(e.target.value)}
                                    placeholder="Manuel Kod Girişi (Örn: Paste QR Payload)"
                                    className="w-full bg-gray-50 border-2 border-gray-200 text-gray-900 text-lg py-4 px-6 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none text-center font-mono shadow-inner"
                                />
                                <button type="submit" disabled={!scanCode || isScanning} className="absolute right-3 top-3 bottom-3 bg-gray-900 hover:bg-gray-800 text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-50">
                                    Sorgula
                                </button>
                            </form>

                        </div>
                    ) : (
                        <div className="w-full max-w-lg flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-300">

                            <div className="text-center">
                                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Emanet Kabul Noktası</h2>
                                <p className="text-gray-500 font-medium">Site sakinlerine gelen kargo ve paketleri güvenlik noktasına bırakın.</p>
                            </div>

                            <div className="w-full space-y-5 bg-gray-50 border border-gray-100 p-6 rounded-3xl">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Daire Numarası</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Building className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={flatNumber}
                                            onChange={e => setFlatNumber(e.target.value)}
                                            placeholder="Örn: A Blok Daire 12"
                                            className="w-full pl-12 bg-white border-2 border-gray-200 text-gray-900 text-xl font-bold py-4 rounded-2xl focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Kargo Firması</label>
                                    <select
                                        value={courierName}
                                        onChange={e => setCourierName(e.target.value)}
                                        className="w-full bg-white border-2 border-gray-200 text-gray-900 text-lg font-medium py-4 px-4 rounded-2xl focus:border-indigo-500 outline-none cursor-pointer"
                                    >
                                        <option>Trendyol Express</option>
                                        <option>Aras Kargo</option>
                                        <option>Yurtiçi Kargo</option>
                                        <option>MNG Kargo</option>
                                        <option>HepsiJet</option>
                                        <option>PTT Kargo</option>
                                        <option>Yemek Sepeti / Getir</option>
                                        <option>Diğer Evrak / Zarf</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleDelivery}
                                    disabled={!flatNumber || deliverySuccess}
                                    className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${deliverySuccess ? 'bg-green-500 text-white shadow-xl shadow-green-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:shadow-none'}`}
                                >
                                    {deliverySuccess ? (
                                        <><CheckCircle2 className="w-6 h-6" /> Teslim Alındı ve Bildirim Gitti</>
                                    ) : (
                                        <><BellRing className="w-6 h-6" /> Teslim Al & Sakini Bilgilendir</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Result Sidebar */}
                {activeTab === "scan" && scanResult && (
                    <div className="w-96 bg-white rounded-2xl shadow-lg border-2 flex flex-col animate-in slide-in-from-right-8 duration-300" style={{ borderColor: scanResult.valid ? '#22c55e' : '#ef4444' }}>
                        <div className={`p-6 text-white rounded-t-xl ${scanResult.valid ? 'bg-green-500' : 'bg-red-500'}`}>
                            {scanResult.valid ? (
                                <div className="flex flex-col items-center text-center">
                                    <UserCheck className="w-16 h-16 mb-4" />
                                    <h2 className="text-2xl font-black uppercase tracking-wider">GEÇİŞ ONAYLANDI</h2>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <AlertCircle className="w-16 h-16 mb-4" />
                                    <h2 className="text-2xl font-black uppercase tracking-wider">GEÇİŞ REDDEDİLDİ</h2>
                                </div>
                            )}
                        </div>

                        <div className="p-6 flex-1 bg-gray-50 flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Sistem Yanıtı</h3>
                            <p className="text-gray-700 font-medium text-lg leading-relaxed bg-white p-4 border rounded-xl shadow-sm">
                                {scanResult.message}
                            </p>

                            {scanResult.valid && (
                                <div className="mt-4 flex flex-col gap-3">
                                    <div className="bg-white p-4 border border-green-100 rounded-xl">
                                        <p className="text-xs text-green-600 uppercase font-black tracking-wider mb-1">Gideceği Yer</p>
                                        <p className="text-xl font-bold border-l-4 border-green-500 pl-3">{scanResult.host}</p>
                                    </div>
                                    <div className="bg-white p-4 border border-gray-200 rounded-xl">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Kişi / Tip</p>
                                        <p className="text-lg font-bold text-gray-900">{scanResult.name} <span className="font-normal text-gray-500">({scanResult.type})</span></p>
                                    </div>
                                </div>
                            )}

                            <button onClick={() => setScanResult(null)} className={`mt-auto w-full py-4 text-white font-bold rounded-xl transition-colors ${scanResult.valid ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                Yeni Tarama Yap
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(100%); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

function ShieldCheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
