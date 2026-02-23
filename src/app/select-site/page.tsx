"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSite } from "@/components/providers/SiteProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { Building2, Home, ArrowRight, ShieldCheck, MapPin, Loader2 } from "lucide-react";

export default function SelectSitePage() {
    const router = useRouter();
    const { setActiveSiteId, currentUser } = useSite();
    const [userSites, setUserSites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            router.push("/login");
            return;
        }

        const fetchSites = async () => {
            try {
                // Find all memberships for this user
                const memQ = query(collection(db, "memberships"), where("userId", "==", currentUser.uid));
                const memSnap = await getDocs(memQ);

                // Map to site data
                const sitePromises = memSnap.docs.map(async (memDoc) => {
                    const memData = memDoc.data();
                    const siteRef = doc(db, "sites", memData.siteId);
                    const siteSnap = await getDoc(siteRef);
                    if (siteSnap.exists()) {
                        return {
                            ...siteSnap.data(),
                            id: siteSnap.id,
                            role: memData.role,
                            block: memData.block,
                            flat: memData.flat
                        };
                    }
                    return null;
                });

                const resolvedSites = (await Promise.all(sitePromises)).filter(Boolean);
                setUserSites(resolvedSites);
            } catch (err) {
                console.error("Error fetching memberships:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSites();
    }, [currentUser, router]);

    const handleSelectSite = (siteId: string) => {
        setActiveSiteId(siteId);
        router.push("/dashboard"); // Redirect to main dashboard
    };

    const handleCreateDemoSite = async () => {
        if (!currentUser) return;
        setIsCreating(true);
        try {
            // 1. Create a Demo Site Document
            const newSiteRef = await addDoc(collection(db, "sites"), {
                name: "Örnek Yaşam Evleri (Demo)",
                address: "Silikon Vadisi Cd. No: 1, İnovasyon Mah. İstanbul",
                logo: "🏢",
                features: ["guestpass", "finances", "announcements", "helpdesk", "marketplace", "polls"]
            });

            // 2. Assign the current user to this site as Manager
            await addDoc(collection(db, "memberships"), {
                userId: currentUser.uid,
                siteId: newSiteRef.id,
                role: "manager",
                block: "A Blok",
                flat: "Daire 1",
                flatDetails: "A Blok - Daire 1"
            });

            // Refresh Page to see the new site
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Demo site oluşturulurken bir hata oluştu: " + (error as any).message);
            setIsCreating(false);
        }
    };

    if (!currentUser) return null; // Wait for redirect

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {/* User Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-white text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-indigo-100 shadow-xl shadow-indigo-500/10">
                        <span className="text-2xl font-black">{currentUser.name?.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hoş Geldiniz</h1>
                    <p className="text-indigo-600 font-bold text-lg mt-1">{currentUser.name}</p>
                    <p className="text-gray-500 mt-3 font-medium text-sm px-6">Lütfen işlem yapmak istediğiniz mülkünüzü seçin veya yeni bir yönetim paneli oluşturun.</p>
                </div>

                {/* Site List */}
                <div className="flex flex-col gap-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : userSites.length > 0 ? (
                        userSites.map((site, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectSite(site.id)}
                                className="bg-white p-5 rounded-3xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left flex items-center gap-5 group transform hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:bg-indigo-50 group-hover:scale-110 transition-all">
                                    {site.logo}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center flex-wrap gap-2 leading-tight">
                                        <span className="truncate">{site.name}</span>
                                        {site.role === "manager" && (
                                            <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0">
                                                Yönetici
                                            </span>
                                        )}
                                    </h2>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2 mb-2 font-medium truncate">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{site.address}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <Home className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs font-bold text-gray-700">
                                            {site.block} - {site.flat}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="bg-indigo-50 text-indigo-700 p-6 rounded-3xl border border-indigo-100/50 text-center flex flex-col items-center">
                            <Building2 className="w-12 h-12 mb-3 text-indigo-400" />
                            <h3 className="font-bold text-lg mb-1">Kayıtlı Mülk Yok</h3>
                            <p className="text-sm font-medium opacity-80">Şu anda kayıtlı olduğunuz bir site yönetim sistemi bulunmuyor. Test etmek için hemen alttaki butondan örnek bir site oluşturabilirsiniz.</p>
                        </div>
                    )}

                    {/* Add New Property Button */}
                    <button
                        onClick={handleCreateDemoSite}
                        disabled={isCreating || loading}
                        className="mt-6 w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg disabled:opacity-50"
                    >
                        {isCreating ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Kuruluyor...</>
                        ) : (
                            <><Building2 className="w-5 h-5 text-indigo-400" /> Yeni 'Demo' Site Yarat</>
                        )}
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem("currentUser");
                            window.location.href = "/login";
                        }}
                        className="text-xs font-bold tracking-wider text-gray-400 hover:text-red-500 mt-2 p-2 block text-center uppercase transition-colors"
                    >
                        Çıkış Yap
                    </button>
                </div>

                <div className="mt-12 text-center flex items-center justify-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    Lilium Multi-Tenant SaaS Engine
                </div>
            </div>
        </div>
    );
}
