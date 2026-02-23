"use client";

import { useState, useEffect } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { CreditCard, Wallet, Receipt, ShieldCheck, CheckCircle2, ArrowRight, Loader2, Info } from "lucide-react";

export default function DuesPage() {
    const { activeSite } = useSite();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [paySuccess, setPaySuccess] = useState(false);

    // Form States
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    const CURRENT_USER_ID = "user_1"; // Simulated Logged In User

    useEffect(() => {
        if (!activeSite) return;

        const q = query(
            collection(db, "invoices"),
            where("siteId", "==", activeSite.id),
            where("userId", "==", CURRENT_USER_ID),
            where("isDeleted", "==", false)
        );

        const unsubscribe = onSnapshot(q, async (snap) => {
            if (snap.empty) {
                // Auto-seed some demo invoices if none exist
                console.log("Seeding demo invoices...");
                const list = [
                    { title: "Haziran 2026 Aidatı", amount: 1250, dueDate: "2026-06-01", status: "pending", type: "dues" },
                    { title: "Ortak Alan Elektrik Faturası Yansıması", amount: 340, dueDate: "2026-06-05", status: "pending", type: "utility" },
                    { title: "Mayıs 2026 Aidatı (Gecikmeli)", amount: 1250, dueDate: "2026-05-01", status: "overdue", type: "dues" },
                    { title: "Nisan 2026 Aidatı", amount: 1250, dueDate: "2026-04-01", status: "paid", type: "dues" },
                ];
                for (const inv of list) {
                    await addDoc(collection(db, "invoices"), {
                        siteId: activeSite.id,
                        userId: CURRENT_USER_ID,
                        ...inv,
                        createdAt: new Date().toISOString(),
                        isDeleted: false
                    });
                }
            } else {
                const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort to put pending first
                fetched.sort((a: any, b: any) => {
                    if (a.status === 'paid' && b.status !== 'paid') return 1;
                    if (a.status !== 'paid' && b.status === 'paid') return -1;
                    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
                    return 0;
                });
                setInvoices(fetched);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [activeSite]);

    const handleSelectInvoice = (id: string, isSelect: boolean) => {
        if (isSelect) {
            setSelectedInvoices(prev => [...prev, id]);
        } else {
            setSelectedInvoices(prev => prev.filter(i => i !== id));
        }
    };

    const isCardValid = cardName.trim().length > 3 && cardNumber.length >= 16 && expiry.length === 5 && cvv.length === 3;
    const totalAmount = invoices.filter(i => selectedInvoices.includes(i.id)).reduce((acc, curr) => acc + curr.amount, 0);

    const handlePayment = async () => {
        if (!isCardValid || selectedInvoices.length === 0) return;
        setIsPaying(true);

        try {
            // Simulate 3D Secure / Payment Gateway Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mark invoices as paid in Firebase
            for (const id of selectedInvoices) {
                await updateDoc(doc(db, "invoices", id), {
                    status: "paid",
                    paidAt: new Date().toISOString()
                });
            }

            // Create Transaction Record
            await addDoc(collection(db, "transactions"), {
                siteId: activeSite?.id,
                userId: CURRENT_USER_ID,
                amount: totalAmount,
                invoiceIds: selectedInvoices,
                date: new Date().toISOString(),
                method: "Credit Card (PayTR Virtual POS)"
            });

            setPaySuccess(true);
            setSelectedInvoices([]);

            // Reset after 3 seconds
            setTimeout(() => setPaySuccess(false), 3000);
        } catch (error) {
            console.error("Payment failed", error);
            alert("Ödeme işlemi başarısız oldu.");
        } finally {
            setIsPaying(false);
        }
    };

    const formatCardNumber = (val: string) => {
        return val.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
    };

    const formatExpiry = (val: string) => {
        return val.replace(
            /[^0-9]/g, '' // To allow only numbers
        ).replace(
            /^([2-9])$/g, '0$1' // To handle 3 > 03
        ).replace(
            /^(1{1})([3-9]{1})$/g, '0$1/$2' // 13 > 01/3
        ).replace(
            /^0{1,}/g, '0' // To handle 00 > 0
        ).replace(
            /^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g, '$1/$2' // To handle 113 > 11/3
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                        <Wallet className="w-6 h-6 text-indigo-600" />
                        Finansal Durum & Ödemeler
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Aidat ve borçlarınızı görüntüleyin, anında güvenli ödeme yapın.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Side: Invoice List */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Açık Borçlarınız</h2>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
                        {invoices.length === 0 && (
                            <div className="p-8 text-center text-gray-500">Kayıtlı hiçbir borcunuz bulunmuyor 😎</div>
                        )}
                        {invoices.map((inv) => (
                            <label key={inv.id} className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${inv.status === 'paid' ? 'opacity-60 bg-gray-50' : 'hover:bg-indigo-50/50'}`}>
                                <div className="shrink-0 flex items-center justify-center p-1">
                                    <input
                                        type="checkbox"
                                        disabled={inv.status === 'paid'}
                                        checked={selectedInvoices.includes(inv.id) || inv.status === 'paid'}
                                        onChange={(e) => handleSelectInvoice(inv.id, e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50 transition-colors"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold ${inv.status === 'paid' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                            {inv.title}
                                        </h3>
                                        {inv.status === 'overdue' && (
                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                Gecikmiş
                                            </span>
                                        )}
                                        {inv.status === 'paid' && (
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Ödendi
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                        <Receipt className="w-3.5 h-3.5" />
                                        Son Ödeme: {inv.dueDate}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-lg ${inv.status === 'paid' ? 'text-gray-400' : 'text-gray-900'}`}>
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(inv.amount)}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                        <Info className="w-5 h-5 shrink-0 text-blue-600" />
                        <p>Zamanında ödenmeyen aidatlara KMK uyarınca aylık %5 gecikme zammı uygulanmaktadır. Ödemelerinizi <strong>Iyzico / PayTR</strong> güvencesi ile taksitlendirerek yapabilirsiniz.</p>
                    </div>
                </div>

                {/* Right Side: Virtual POS Checkout */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                Hızlı Güvenli Ödeme
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Sanal POS üzerinden SSL ile şifrelenmiştir.</p>
                        </div>

                        {paySuccess ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center animate-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Ödeme Başarılı!</h3>
                                <p className="text-gray-500">Seçili borçlarınız sistemden düşülmüştür. Dekontunuza Finans sayfasından ulaşabilirsiniz.</p>
                            </div>
                        ) : (
                            <div className="p-5">
                                {/* Credit Card Preview Component */}
                                <div className="w-full h-48 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl p-6 text-white shadow-xl relative overflow-hidden mb-6 transition-transform hover:scale-[1.02]">
                                    {/* Chip & Logo */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-10 border border-yellow-400/30 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-600 flex items-center justify-center">
                                            <div className="w-8 h-6 border border-yellow-800/20 rounded-sm opacity-50"></div>
                                        </div>
                                        <ShieldCheck className="w-8 h-8 text-white/20" />
                                    </div>

                                    <div className="font-mono text-xl tracking-[0.2em] mb-4 text-white/90 truncate">
                                        {cardNumber || "•••• •••• •••• ••••"}
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Kart Sahibi</p>
                                            <p className="font-medium text-sm tracking-widest uppercase truncate max-w-[150px]">
                                                {cardName || "İSİM SOYİSİM"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 text-right">SKT</p>
                                            <p className="font-medium text-sm tracking-widest">
                                                {expiry || "AA/YY"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Glossy overlay */}
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kart Üzerindeki İsim</label>
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={e => setCardName(e.target.value)}
                                            placeholder="Ahmet Yılmaz"
                                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none uppercase"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kart Numarası</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CreditCard className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={cardNumber}
                                                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                                maxLength={19}
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full pl-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Son Kul. (AA/YY)</label>
                                            <input
                                                type="text"
                                                value={expiry}
                                                onChange={e => setExpiry(formatExpiry(e.target.value))}
                                                maxLength={5}
                                                placeholder="MM/YY"
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">CVV</label>
                                            <input
                                                type="text"
                                                value={cvv}
                                                onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                                                maxLength={3}
                                                placeholder="123"
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 outline-none text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-5 border-t border-gray-100">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-gray-500 font-medium">Toplam Tutar</span>
                                        <span className="text-3xl font-black text-gray-900">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(totalAmount)}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={!isCardValid || selectedInvoices.length === 0 || isPaying}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-md hover:shadow-lg focus:outline-none"
                                    >
                                        {isPaying ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Bankaya Bağlanılıyor...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-5 h-5" />
                                                Güvenli Ödeme Yap
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
