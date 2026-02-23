"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { Store, Plus, Search, MapPin, Clock, Tag, ShoppingBag, MessageCircle, X, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadAndOptimizeImage } from "@/lib/storage";
import { Image as ImageIcon } from "lucide-react";

export default function MarketplacePage() {
    const { activeSite, currentUser } = useSite();
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // 'all', 'furniture', 'electronics', 'free'

    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("Mobilya & Eşya");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!activeSite?.id) return;

        const q = query(
            collection(db, "marketplace_listings"),
            where("siteId", "==", activeSite.id),
            where("isDeleted", "==", false),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setListings(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching listings:", error);
            // Firebase index might be required due to multiple clauses (where + orderBy)
            // If it fails, fallback to simple fetch without orderBy
            if (error.message.includes("index")) {
                const simpleQ = query(collection(db, "marketplace_listings"), where("siteId", "==", activeSite.id), where("isDeleted", "==", false));
                onSnapshot(simpleQ, (snap) => {
                    const d: any[] = [];
                    snap.forEach(doc => d.push({ id: doc.id, ...doc.data() }));
                    setListings(d.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [activeSite?.id]);

    const handleAddListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !price || !activeSite?.id || !currentUser) return;

        setIsSubmitting(true);
        try {
            let finalImageUrl = "";
            if (imageFile) {
                finalImageUrl = await uploadAndOptimizeImage(imageFile, activeSite.id, 'marketplace');
            }

            await addDoc(collection(db, "marketplace_listings"), {
                siteId: activeSite.id,
                title,
                price: isNaN(Number(price)) && price.toLowerCase() !== "ücretsiz" ? price : (price.toLowerCase() === "ücretsiz" ? "Ücretsiz" : price + " TL"),
                category,
                sellerName: currentUser.name || "İsimsiz Komşu",
                sellerId: currentUser.uid,
                location: "Site İçi",
                image: finalImageUrl || "https://images.unsplash.com/photo-1505691938895-1758d7bef511?auto=format&fit=crop&q=80&w=400", // Fallback Default Image
                createdAt: serverTimestamp(),
                isDeleted: false
            });
            setIsModalOpen(false);
            setTitle("");
            setPrice("");
            setImageFile(null);
            setImagePreview("");
        } catch (error) {
            console.error("Error adding listing:", error);
            alert("İlan eklenirken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleDelete = async (listingId: string) => {
        if (!confirm("Bu ilanı yayından kaldırmak istediğinize emin misiniz?")) return;
        try {
            const listRef = doc(db, "marketplace_listings", listingId);
            await updateDoc(listRef, {
                isDeleted: true,
                deletedAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error deleting listing:", err);
            alert("İlan silinirken bir hata oluştu.");
        }
    };

    const filteredListings = listings.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
            item.category?.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === "all" ||
            (activeTab === "furniture" && item.category === "Mobilya & Eşya") ||
            (activeTab === "electronics" && item.category === "Elektronik") ||
            (activeTab === "free" && (item.price === "Ücretsiz" || item.price === "0" || item.price === "0 TL" || item.category === "Ücretsiz / Hediye"));

        return matchesSearch && matchesTab;
    });

    const categories = ["Mobilya & Eşya", "Elektronik", "Bebek & Çocuk", "Oto Yedek Parça", "Evcil & Bitki", "Diğer"];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-bold text-xs mb-4">
                            <Store className="w-4 h-4" />
                            İkinci El Pasajı
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Komşuluk Ağı</h1>
                        <p className="text-gray-500 mt-2 font-medium max-w-xl leading-relaxed">
                            {activeSite?.name || 'Siteniz'} sakinleri arasında güvenli alışveriş. İhtiyacınız olmayanı değerlendirin, komşunuza destek olun.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Eşya veya Kategori Ara..."
                                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-pink-500 rounded-xl transition-all font-medium text-gray-900 outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md shrink-0 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> İlan Ver
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setActiveTab("all")} className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors border-2 ${activeTab === 'all' ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}>Tüm İlanlar</button>
                <button onClick={() => setActiveTab("furniture")} className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors border-2 ${activeTab === 'furniture' ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}>Mobilya & Eşya</button>
                <button onClick={() => setActiveTab("electronics")} className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors border-2 ${activeTab === 'electronics' ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}>Elektronik</button>
                <button onClick={() => setActiveTab("free")} className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors border-2 ${activeTab === 'free' ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}>Ücretsiz / Hediye</button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center text-pink-500">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Hiç İlan Bulunamadı</h3>
                        <p className="text-gray-500 max-w-sm mb-6">Bu kategoriye henüz kimse ilan eklememiş. İlk ilanı sen vermek ister misin?</p>
                        <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-pink-50 text-pink-700 font-bold rounded-xl hover:bg-pink-100 transition-colors">Yepyeni Bir İlan Ekle</button>
                    </div>
                ) : (
                    filteredListings.map(product => (
                        <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                            {/* Image Placeholder */}
                            <div className="aspect-[4/3] w-full bg-gray-100 relative overflow-hidden">
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                {product.price === "Ücretsiz" && (
                                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                                        Hediye
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider bg-pink-50 px-2 py-0.5 rounded-md">
                                        {product.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {product.createdAt ? new Date(product.createdAt.toMillis()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 'Yeni'}
                                    </span>
                                </div>

                                <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{product.title}</h3>

                                <div className="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
                                    <div>
                                        <p className="text-[11px] text-gray-500 font-medium mb-1">{product.sellerName}</p>
                                        <p className="text-xs text-gray-700 font-bold flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {product.location}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col justify-end items-end gap-2">
                                        <p className={`text-lg font-black ${product.price === 'Ücretsiz' ? 'text-emerald-600' : 'text-gray-900'}`}>{product.price}</p>

                                        {(currentUser?.uid === product.sellerId || ['admin', 'manager', 'super_admin'].includes(currentUser?.role)) && (
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                title="İlanı Kaldır"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Hover Action */}
                                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="w-full py-2.5 bg-gray-50 hover:bg-pink-50 hover:text-pink-700 text-gray-700 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                        <MessageCircle className="w-4 h-4" /> Satıcıyla Görüş
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* New Listing Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-black text-gray-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-pink-500" /> Yeni İlan Ver
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddListing} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">İlan Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Örn: 3 Kapılı Gardırop"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium text-gray-900 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Fiyat</label>
                                    <input
                                        type="text"
                                        required
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        placeholder="1500 veya Ücretsiz"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium text-gray-900 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Kategori</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-medium text-gray-900 outline-none"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Fotoğraf Ekle (Opsiyonel)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-pink-500 transition-colors bg-gray-50 relative overflow-hidden group">
                                    {imagePreview ? (
                                        <div className="absolute inset-0 w-full h-full">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <p className="text-white font-bold text-sm">Fotoğrafı Değiştir</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-center">
                                            <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <span className="relative cursor-pointer bg-transparent rounded-md font-bold text-pink-600 hover:text-pink-500 focus-within:outline-none">
                                                    <span>Dosya Seç</span>
                                                </span>
                                                <p className="pl-1 text-gray-500">veya sürükle bırak</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, WEBP (Max 5MB)</p>
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

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !title || !price}
                                    className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'İlanı Yayınla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
