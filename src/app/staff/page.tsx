"use client";

import { useState, useEffect } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { Camera, MapPin, CheckCircle, Wrench, AlertTriangle, Loader2, Navigation, UploadCloud } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

type Ticket = {
    id: string;
    description: string;
    urgency: "low" | "medium" | "high" | "critical";
    status: "open" | "in_progress" | "resolved" | "closed";
    location?: string;
    createdAt: any;
};

export default function StaffPanel() {
    const { activeSite, currentUser } = useSite();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [gpsLocation, setGpsLocation] = useState<string | null>(null);
    const [photoUploaded, setPhotoUploaded] = useState(false);

    useEffect(() => {
        if (!activeSite?.id) return;

        const fetchTickets = async () => {
            setLoading(true);
            try {
                // Fetch open and in_progress tickets for this site
                const q = query(
                    collection(db, "helpdesk_tickets"),
                    where("siteId", "==", activeSite.id),
                    where("status", "in", ["open", "in_progress"]),
                    where("isDeleted", "==", false)
                );

                const snap = await getDocs(q);
                const fetched: Ticket[] = [];
                snap.forEach(d => {
                    const data = d.data();
                    fetched.push({
                        id: d.id,
                        description: data.description,
                        urgency: data.urgency,
                        status: data.status,
                        location: data.category || "Site İçi", // Mocking location with category
                        createdAt: data.createdAt,
                    });
                });

                // Sort client side by urgency (critical first)
                const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
                fetched.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);

                setTickets(fetched);
            } catch (error) {
                console.error("Error fetching staff tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [activeSite?.id]);

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-white';
            case 'low': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getUrgencyLabel = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'ACİL';
            case 'high': return 'Yüksek';
            case 'medium': return 'Orta';
            case 'low': return 'Düşük';
            default: return 'Bilinmiyor';
        }
    };

    const handleGetLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGpsLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
                },
                (error) => {
                    alert("Konum alınamadı. Lütfen cihaz ayarlarınızı kontrol edin.");
                }
            );
        } else {
            alert("Tarayıcınız konum servisini desteklemiyor.");
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // Mocking photo upload
            setTimeout(() => setPhotoUploaded(true), 800);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket || !gpsLocation || !photoUploaded) return;
        setIsClosing(true);

        try {
            await updateDoc(doc(db, "helpdesk_tickets", selectedTicket.id), {
                status: "resolved",
                resolvedAt: new Date().toISOString(),
                resolvedBy: currentUser?.uid,
                resolutionNote: "Saha personeli tarafından konum ve fotoğraf kanıtı ile kapatıldı.",
                resolutionLocation: gpsLocation,
                resolutionPhotoUrl: "mock_photo_url.jpg" // In real app, this is Firebase Storage URL
            });

            setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
            setSelectedTicket(null);
            setGpsLocation(null);
            setPhotoUploaded(false);

            alert("İş başarıyla tamamlandı ve kapatıldı.");
        } catch (error) {
            console.error("Error closing ticket:", error);
            alert("İş kapatılırken bir hata oluştu.");
        } finally {
            setIsClosing(false);
        }
    };

    return (
        <ProtectedRoute requireStaff={true}>
            <div className="bg-gray-100 min-h-[calc(100vh-4rem)] pb-20">
                {/* Header Profile */}
                <div className="bg-amber-500 text-white p-6 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 font-bold text-sm uppercase tracking-wide mb-1">Görevli Paneli</p>
                            <h1 className="text-2xl font-black">{currentUser?.name || "Personel"}</h1>
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                            <Wrench className="w-7 h-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="px-4 -mt-6 relative z-20">
                    <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center justify-between border border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-sm font-bold">Açık İşler</span>
                            <span className="text-3xl font-black text-gray-900">{loading ? '-' : tickets.length}</span>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Ticket List */}
                <div className="px-4 mt-8 space-y-4">
                    <h2 className="font-bold text-lg text-gray-800 px-1">Bekleyen İşler</h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
                            <p className="font-bold text-sm">İşler Yükleniyor...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Bekleyen İş Yok</h3>
                            <p className="text-gray-500 text-sm mt-2">Şu an için atanan tüm görevleri tamamladınız. Harika iş çıkardınız!</p>
                        </div>
                    ) : (
                        tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getUrgencyColor(ticket.urgency)}`}>
                                        {getUrgencyLabel(ticket.urgency)}
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">#{ticket.id.substring(0, 6)}</span>
                                </div>
                                <p className="font-bold text-gray-900 text-lg leading-tight mb-3 line-clamp-2">
                                    {ticket.description}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                    <MapPin className="w-4 h-4 text-rose-500" />
                                    {ticket.location}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Action Modal (Bottom Sheet Style) */}
                {selectedTicket && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isClosing && setSelectedTicket(null)} />

                        <div className="relative bg-white w-full sm:w-[28rem] rounded-t-[2rem] sm:rounded-[2rem] p-6 pb-12 sm:pb-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />

                            <h3 className="text-xl font-black text-gray-900 mb-2">İşi Tamamla</h3>
                            <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-100">Bu işi kapatmak için sistem prosedürü gereği konumunuzu doğrulamalı ve yapılan işin fotoğrafını çekmelisiniz.</p>

                            <div className="space-y-4">
                                {/* Location Requirement */}
                                <div className={`p-4 rounded-xl border-2 transition-colors flex items-center justify-between ${gpsLocation ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 border-dashed'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${gpsLocation ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                                            {gpsLocation ? <CheckCircle className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${gpsLocation ? 'text-green-800' : 'text-gray-700'}`}>Konum Doğrulaması</p>
                                            <p className="text-xs text-gray-500">{gpsLocation || 'Henüz alınmadı'}</p>
                                        </div>
                                    </div>
                                    {!gpsLocation && (
                                        <button onClick={handleGetLocation} className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-lg hover:bg-rose-100 flex items-center gap-1">
                                            <Navigation className="w-3 h-3" /> Konum Al
                                        </button>
                                    )}
                                </div>

                                {/* Photo Requirement */}
                                <label className={`block p-4 rounded-xl border-2 transition-colors flex items-center justify-between cursor-pointer ${photoUploaded ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 border-dashed hover:bg-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${photoUploaded ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {photoUploaded ? <CheckCircle className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${photoUploaded ? 'text-blue-800' : 'text-gray-700'}`}>Kanıt Fotoğrafı</p>
                                            <p className="text-xs text-gray-500">{photoUploaded ? 'Yüklendi (evidence.jpg)' : 'Kamerayı açmak için dokun'}</p>
                                        </div>
                                    </div>
                                    {!photoUploaded && (
                                        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg flex items-center gap-1">
                                            <UploadCloud className="w-3 h-3" /> Yükle
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                                </label>
                            </div>

                            <button
                                onClick={handleCloseTicket}
                                disabled={!gpsLocation || !photoUploaded || isClosing}
                                className={`w-full mt-8 font-black py-4 rounded-xl flex items-center justify-center gap-2 text-lg transition-all ${gpsLocation && photoUploaded ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                {isClosing ? (
                                    <><Loader2 className="w-6 h-6 animate-spin" /> Kapatılıyor...</>
                                ) : (
                                    "Görevi Tamamla"
                                )}
                            </button>

                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="w-full mt-3 font-bold py-3 text-gray-500 bg-transparent hover:bg-gray-100 rounded-xl"
                            >
                                Vazgeç
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
