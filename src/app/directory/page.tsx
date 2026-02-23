"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { Users, Search, Phone, Mail, Building, ShieldCheck, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DirectoryPage() {
    const { activeSite, currentUser } = useSite();
    const [search, setSearch] = useState("");
    const [residents, setResidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activeSite?.id) return;

        const q = query(collection(db, "memberships"), where("siteId", "==", activeSite.id));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            try {
                const mems = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

                // For a real app, you would join this with the 'users' collection 
                // to get their full names and phones if it's not denormalized in 'memberships'.
                // Since our current demo architecture stores minimal data in 'memberships',
                // we will display it with calculated fallbacks.

                const mappedMems = mems.map(m => ({
                    ...m,
                    // If name isn't stored in membership, try checking if it's the current user
                    name: m.userName || (m.userId === currentUser?.uid ? currentUser?.name : `Sakin (${m.flat || 'Bilinmiyor'})`),
                    phone: m.userPhone || (m.userId === currentUser?.uid ? currentUser?.phone : `0555 *** ** **`),
                    isManager: m.role === "admin" || m.role === "manager",
                    displayRole: m.role === "admin" || m.role === "manager" ? "Yönetim" : "Sakin"
                }));

                setResidents(mappedMems);
                setLoading(false);
            } catch (error) {
                console.error("Error processing directory:", error);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [activeSite?.id, currentUser]);

    const filteredResidents = residents.filter(r =>
        (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.block || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.flat || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs mb-4">
                            <Users className="w-4 h-4" />
                            Komşuluk Ağı
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Site Sakinleri</h1>
                        <p className="text-gray-500 mt-2 font-medium max-w-xl leading-relaxed">
                            {activeSite?.name || 'Siteniz'} içindeki komşularınıza ulaşın. Güvenlik gereği iletişim bilgileri maskelenmiştir, doğrudan uygulama içi mesaj gönderebilirsiniz.
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="İsim, Blok veya Daire Ara..."
                            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl transition-all font-medium text-gray-900 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Admin Alert */}
            {currentUser?.role === "admin" && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-orange-900">Yönetici Görünümü</h3>
                        <p className="text-sm text-orange-800/80 mt-1 font-medium">Site yöneticisi olduğunuz için tüm kayıtları görmektesiniz. Sakinler, profilini gizleyen komşularını bu listede göremez.</p>
                    </div>
                </div>
            )}

            {/* Roster Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center text-indigo-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : filteredResidents.map((resident, idx) => {
                    // Fallback initials if name is missing
                    const initials = (resident.name || "S").split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                    return (
                        <div key={resident.id || idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-indigo-700 font-black text-lg shadow-inner">
                                    {initials}
                                </div>
                                {resident.isManager && (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        Yönetim
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{resident.name}</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4 border-b border-gray-100 pb-4">{resident.displayRole}</p>

                            <div className="space-y-3 mt-auto">
                                <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                    <Building className="w-4 h-4 shrink-0 text-indigo-400" />
                                    <span className="font-medium">{resident.block || '-'} • {resident.flat || '-'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                    <Phone className="w-4 h-4 shrink-0 text-indigo-400" />
                                    <span className="font-mono font-medium">{resident.phone}</span>
                                </div>
                            </div>

                            <button className="mt-5 w-full py-3 bg-white border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" /> Mesaj Gönder
                            </button>
                        </div>
                    );
                })}
            </div>

            {!loading && filteredResidents.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Kayıt Bulunamadı</h3>
                    <p className="text-gray-500 font-medium">Bu sitede henüz kayıtlı bir üye bulunmuyor veya aramanızla eşleşmedi.</p>
                </div>
            )}
        </div>
    );
}
