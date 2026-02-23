"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { Wrench, Plus, Clock, CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadAndOptimizeImage } from "@/lib/storage";
import { Image as ImageIcon } from "lucide-react";

export default function HelpdeskPage() {
    const { activeSite, currentUser } = useSite();

    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Genel Tesisat (Su, Doğalgaz)");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!activeSite?.id || !currentUser?.uid) return;

        // Optionally, if admin, they might see ALL tickets. For now, just resident's own tickets.
        const q = ['admin', 'manager', 'super_admin'].includes(currentUser.role)
            ? query(collection(db, "helpdesk_tickets"), where("siteId", "==", activeSite.id), where("isDeleted", "==", false), orderBy("createdAt", "desc"))
            : query(collection(db, "helpdesk_tickets"), where("siteId", "==", activeSite.id), where("residentId", "==", currentUser.uid), where("isDeleted", "==", false), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setTickets(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching tickets:", error);
            // Fallback if index fails
            if (error.message.includes("index")) {
                const simpleQ = query(collection(db, "helpdesk_tickets"), where("siteId", "==", activeSite.id), where("isDeleted", "==", false));
                onSnapshot(simpleQ, (snap) => {
                    let d: any[] = [];
                    snap.forEach(doc => d.push({ id: doc.id, ...doc.data() }));
                    if (!['admin', 'manager', 'super_admin'].includes(currentUser.role)) {
                        d = d.filter(t => t.residentId === currentUser.uid);
                    }
                    setTickets(d.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [activeSite?.id, currentUser?.uid, currentUser?.role]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !activeSite?.id || !currentUser) return;

        setIsSubmitting(true);
        try {
            let finalImageUrl = "";
            if (imageFile) {
                finalImageUrl = await uploadAndOptimizeImage(imageFile, activeSite.id, 'helpdesk');
            }

            await addDoc(collection(db, "helpdesk_tickets"), {
                siteId: activeSite.id,
                residentId: currentUser.uid,
                residentName: currentUser.name || "Sakin",
                title,
                category,
                description,
                imageUrl: finalImageUrl,
                status: "pending",   // pending, in_progress, completed
                urgency: "medium",   // could be selectable, default to medium
                createdAt: serverTimestamp(),
                isDeleted: false,
                ticketNumber: `#T-${Math.floor(1000 + Math.random() * 9000)}`
            });
            setTitle("");
            setDescription("");
            setCategory("Genel Tesisat (Su, Doğalgaz)");
            setImageFile(null);
            setImagePreview("");
            alert("Talebiniz başarıyla oluşturuldu.");
        } catch (error) {
            console.error("Error creating ticket:", error);
            alert("Talep oluşturulurken bir hata meydana geldi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'in_progress':
                return { icon: <Clock className="w-4 h-4" />, text: "İşlemde", class: "bg-blue-100 text-blue-700" };
            case 'completed':
                return { icon: <CheckCircle2 className="w-4 h-4" />, text: "Çözüldü", class: "bg-emerald-100 text-emerald-700" };
            case 'pending':
            default:
                return { icon: <AlertCircle className="w-4 h-4" />, text: "Bekliyor", class: "bg-amber-100 text-amber-700" };
        }
    };

    const getUrgencyUI = (urgency: string) => {
        switch (urgency) {
            case 'high': return "bg-red-50 text-red-600 border border-red-200";
            case 'medium': return "bg-amber-50 text-amber-600 border border-amber-200";
            default: return "bg-gray-50 text-gray-600 border border-gray-200";
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 font-bold text-xs mb-4">
                            <Wrench className="w-4 h-4" />
                            Geri Bildirim Sistemi
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Talep & Arıza</h1>
                        <p className="text-gray-500 mt-2 font-medium max-w-xl leading-relaxed">
                            {activeSite?.name || 'Site'} içerisindeki arıza, şikayet veya taleplerinizi doğrudan yönetime ve teknik servise iletin.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit New Ticket Form */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Yeni Talep Oluştur</h2>
                    <form onSubmit={handleCreateTicket} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
                        <div>
                            <label className="block text-[11px] font-black uppercase text-gray-500 mb-2">Talep Kategorisi</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-gray-50 font-bold text-gray-700 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option>Genel Tesisat (Su, Doğalgaz)</option>
                                <option>Elektrik Arızası</option>
                                <option>Ortak Alan & Asansör</option>
                                <option>Güvenlik İhlali</option>
                                <option>Temizlik Şikayeti</option>
                                <option>Aidat & Muhasebe Sorusu</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase text-gray-500 mb-2">Kısa Başlık</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Örn: Koridor ampulü patlamış"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase text-gray-500 mb-2">Detaylı Açıklama</label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Lütfen sorunu detaylıca anlatın..."
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase text-gray-500 mb-2">Görsel Ekle (Opsiyonel)</label>
                            <div className="mt-1 flex justify-center px-6 pt-4 pb-5 border-2 border-gray-200 border-dashed rounded-xl hover:border-cyan-500 transition-colors bg-gray-50 relative overflow-hidden group">
                                {imagePreview ? (
                                    <div className="absolute inset-0 w-full h-full">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <p className="text-white font-bold text-sm">Değiştir</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1 text-center">
                                        <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center mt-2">
                                            <span className="relative cursor-pointer bg-transparent rounded-md font-bold text-cyan-600 hover:text-cyan-500 focus-within:outline-none">
                                                <span>Dosya Seç</span>
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500">Max 5MB (PNG/JPG)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !title || !description}
                            className="w-full mt-2 bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform transform hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Talebi Gönder</>}
                        </button>
                    </form>
                </div>

                {/* My Tickets List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Geçmiş Taleplerim</h2>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-10 flex justify-center text-cyan-600">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-500">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">Daha önce açılmış bir talebiniz bulunmuyor.</p>
                                <p className="text-xs mt-1">Her şey yolunda görünüyor!</p>
                            </div>
                        ) : (
                            tickets.map(ticket => {
                                const status = getStatusUI(ticket.status);

                                return (
                                    <div key={ticket.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-5 items-start md:items-center hover:shadow-md transition-shadow group">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 text-gray-500 group-hover:bg-cyan-50 group-hover:text-cyan-600 group-hover:border-cyan-100 transition-colors">
                                            <Wrench className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black tracking-wider text-gray-400">{ticket.ticketNumber || ticket.id.substring(0, 6)}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${getUrgencyUI(ticket.urgency)}`}>
                                                    {ticket.urgency === 'high' ? 'Acil' : ticket.urgency === 'medium' ? 'Orta' : 'Düşük'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{ticket.title}</h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                                                <span className="bg-gray-100 py-1 px-2 rounded-md">{ticket.category}</span>
                                                <span>• {ticket.createdAt ? new Date(ticket.createdAt.toMillis()).toLocaleString('tr-TR') : 'Yeni'}</span>
                                            </div>
                                            {ticket.imageUrl && (
                                                <div className="mt-3 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
                                                    <img src={ticket.imageUrl} alt="Ekli Görsel" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${status.class}`}>
                                            {status.icon} {status.text}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
