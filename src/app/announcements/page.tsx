"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { Megaphone, Calendar, AlertTriangle, ShieldAlert, Pin, CheckCircle2, Plus, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AnnouncementsPage() {
    const { activeSite, currentUser } = useSite();

    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("info"); // info, warning, success
    const [isPinned, setIsPinned] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!activeSite?.id) return;

        const q = query(
            collection(db, "announcements"),
            where("siteId", "==", activeSite.id),
            where("isDeleted", "==", false),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            // Sort to ensure pinned are at top
            const sorted = data.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0; // The orderBy already handles the initial desc timestamp sort
            });
            setAnnouncements(sorted);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching announcements:", error);
            // Fallback if index fails
            if (error.message.includes("index")) {
                const simpleQ = query(collection(db, "announcements"), where("siteId", "==", activeSite.id), where("isDeleted", "==", false));
                onSnapshot(simpleQ, (snap) => {
                    const d: any[] = [];
                    snap.forEach(doc => d.push({ id: doc.id, ...doc.data() }));

                    const sorted = d.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))
                        .sort((a, b) => {
                            if (a.isPinned && !b.isPinned) return -1;
                            if (!a.isPinned && b.isPinned) return 1;
                            return 0;
                        });
                    setAnnouncements(sorted);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [activeSite?.id]);

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !activeSite?.id || currentUser?.role !== "admin") return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "announcements"), {
                siteId: activeSite.id,
                title,
                description,
                type,
                isPinned,
                author: currentUser.name || "Site Yönetimi",
                createdAt: serverTimestamp(),
                isDeleted: false
            });
            setIsModalOpen(false);
            setTitle("");
            setDescription("");
            setType("info");
            setIsPinned(false);
            alert("Duyuru başarıyla yayınlandı.");
        } catch (error) {
            console.error("Error adding announcement:", error);
            alert("Duyuru yayınlanırken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            default: return <Megaphone className="w-5 h-5 text-indigo-500" />;
        }
    };

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'warning': return "bg-amber-100 text-amber-800 border-amber-200";
            case 'success': return "bg-emerald-100 text-emerald-800 border-emerald-200";
            default: return "bg-indigo-100 text-indigo-800 border-indigo-200";
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-xs mb-4">
                            <Megaphone className="w-4 h-4" />
                            İlan Panosu
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Duyurular</h1>
                        <p className="text-gray-500 mt-2 font-medium max-w-xl leading-relaxed">
                            {activeSite?.name || 'Siteniz'} ile ilgili en güncel haberleri, duyuruları ve bakım bildirimlerini bu sayfadan takip edebilirsiniz.
                        </p>
                    </div>

                    {['admin', 'manager', 'super_admin'].includes(currentUser?.role) && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Yeni Yayınla
                        </button>
                    )}
                </div>
            </div>

            {/* Feed */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-20 flex justify-center text-indigo-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-500">
                        <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Duyuru Bulunmuyor</h3>
                        <p className="text-gray-500">Henüz yayınlanmış bir güncel duyuru yok.</p>
                    </div>
                ) : (
                    announcements.map(announcement => (
                        <div key={announcement.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">

                            {/* Type Decoration Line */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${announcement.type === 'warning' ? 'bg-amber-400' :
                                announcement.type === 'success' ? 'bg-emerald-400' :
                                    'bg-indigo-400'
                                }`} />

                            <div className="flex flex-col sm:flex-row gap-5">
                                <div className="shrink-0 pt-1 flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${announcement.type === 'warning' ? 'bg-amber-50' :
                                        announcement.type === 'success' ? 'bg-emerald-50' :
                                            'bg-indigo-50'
                                        }`}>
                                        {getIcon(announcement.type)}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        {announcement.isPinned && (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                                                <Pin className="w-3 h-3" /> Sabitlendi
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getBadgeStyle(announcement.type)}`}>
                                            {announcement.type === 'warning' ? 'Uyarı' : announcement.type === 'success' ? 'İyi Haber' : 'Bilgilendirme'}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1 ml-auto">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {announcement.createdAt ? new Date(announcement.createdAt.toMillis()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Yeni'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{announcement.title}</h3>
                                    <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{announcement.description}</p>

                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                            <ShieldAlert className="w-3.5 h-3.5 text-gray-500" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{announcement.author}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Admin Create Modal */}
            {isModalOpen && ['admin', 'manager', 'super_admin'].includes(currentUser?.role) && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
                            <h3 className="font-black text-indigo-900 flex items-center gap-2 text-lg">
                                <Megaphone className="w-5 h-5 text-indigo-500" /> Yeni Duyuru
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white p-2 rounded-full shadow-sm transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAnnouncement} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Duyuru Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Örn: Hafta Sonu Havuz Bakımı Hk."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold text-gray-900 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Duyuru Tipi</label>
                                    <select
                                        value={type}
                                        onChange={e => setType(e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold text-gray-900 outline-none"
                                    >
                                        <option value="info">Bilgilendirme (Mavi)</option>
                                        <option value="warning">Uyarı & Dikkat (Sarı)</option>
                                        <option value="success">İyi Haber (Yeşil)</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-8 justify-center">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={isPinned}
                                                onChange={e => setIsPinned(e.target.checked)}
                                                className="w-6 h-6 border-2 border-gray-300 rounded text-indigo-600 focus:ring-transparent transition-colors cursor-pointer"
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1">
                                            <Pin className="w-4 h-4" /> Sabitle
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Detaylı İçerik</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={5}
                                    placeholder="Sakinlere iletilecek mesajı girin..."
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-900 outline-none resize-none"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !title || !description}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sistemde Yayınla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
