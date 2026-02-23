"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { QrCode, UserPlus, Package, Mail, Clock, ShieldCheck, Share2 } from "lucide-react";

type PassType = "Misafir" | "Kurye/Kargo" | "Teknik Servis";

export default function GuestPassPage() {
    const [activeTab, setActiveTab] = useState<"create" | "deliveries">("create");

    // States for creating a pass
    const [guestName, setGuestName] = useState("");
    const [visitDate, setVisitDate] = useState("");
    const [passType, setPassType] = useState<PassType>("Misafir");
    const [generatedQR, setGeneratedQR] = useState<string | null>(null);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName || !visitDate) return;

        // Simulate generating a unique, encrypted QR code payload
        const payload = JSON.stringify({
            id: Math.random().toString(36).substring(2, 9),
            name: guestName,
            type: passType,
            date: visitDate,
            host: "A Blok - Daire 12",
            expiresAt: new Date(new Date(visitDate).getTime() + 24 * 60 * 60 * 1000).toISOString()
        });

        setGeneratedQR(payload);
    };

    const pendingDeliveries = [
        { id: "PKG-789", sender: "Trendyol Hızlı Market", type: "Paket", arrTime: "14:30 - Bugün", status: "Güvenlikte Bekliyor" },
        { id: "PKG-790", sender: "PTT Kargo", type: "Zarf/Evrak", arrTime: "09:15 - Dün", status: "Güvenlikte Bekliyor" }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                    <QrCode className="w-6 h-6 text-indigo-600" />
                    Misafir Kimliği & Kargolar
                </h1>
                <p className="text-gray-500 text-sm mt-1">Ziyaretçileriniz için QR kod oluşturun veya gelen kargolarınızı takip edin.</p>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mt-6 -mx-5 px-5">
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === "create" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            QR Geçiş İzni Üret
                        </div>
                        {activeTab === "create" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab("deliveries")}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "deliveries" ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <Package className="w-4 h-4" />
                        Kargolarım
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">2</span>
                        {activeTab === "deliveries" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
                    </button>
                </div>
            </div>

            {activeTab === "create" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Form Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Yeni Geçiş Kodu Tanımla</h2>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ziyaretçi veya Firma Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="Örn: Ahmet Yılmaz veya Aras Kargo"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ziyaret Tipi</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Misafir", "Kurye/Kargo", "Teknik Servis"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setPassType(type as PassType)}
                                            className={`py-2 text-xs font-medium rounded-lg border transition-colors ${passType === type ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beklenen Tarih</label>
                                <input
                                    type="date"
                                    required
                                    value={visitDate}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <QrCode className="w-5 h-5" />
                                Kod Oluştur
                            </button>
                        </form>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center min-h-[300px]">
                        {generatedQR ? (
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center w-full max-w-sm text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{guestName}</h3>
                                <p className="text-sm text-gray-500 mb-6">{passType} • {new Date(visitDate).toLocaleDateString('tr-TR')}</p>

                                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-6">
                                    <QRCode value={generatedQR} size={160} />
                                </div>

                                <p className="text-xs text-gray-500 mb-4 px-4">
                                    Bu QR kodu misafirinizle paylaşın. Güvenlikte okutarak hızlıca geçiş yapabilir.
                                </p>

                                <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                                    <Share2 className="w-4 h-4" />
                                    Kodu Paylaş (WhatsApp)
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 flex flex-col items-center">
                                <QrCode className="w-16 h-16 text-gray-300 mb-4" />
                                <p>Geçiş kodu oluşturduğunuzda burada belirecektir.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {pendingDeliveries.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {pendingDeliveries.map((pkg) => (
                                <div key={pkg.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                                            {pkg.type === "Paket" ? <Package className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{pkg.sender}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{pkg.type} • {pkg.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                                            <Clock className="w-4 h-4" />
                                            {pkg.arrTime}
                                        </div>
                                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 self-start sm:self-auto">
                                            {pkg.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center flex flex-col items-center">
                            <Package className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">Şu anda güvenlikte bekleyen kargonuz bulunmuyor.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
