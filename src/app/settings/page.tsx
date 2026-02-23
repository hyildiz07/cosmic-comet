"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { Settings, User, Bell, Lock, Globe, ShieldCheck, LogOut } from "lucide-react";

export default function SettingsPage() {
    const { currentUser } = useSite();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                        {currentUser?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{currentUser?.name || 'Kullanıcı'}</h1>
                        <p className="text-gray-500 mt-1 font-medium">{currentUser?.phone || '+90 5XX XXX XX XX'} • {currentUser?.role === 'admin' ? 'Sistem Yöneticisi' : 'Sakin'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 border-r border-gray-100 pr-4 space-y-2">
                    <button className="w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl flex items-center gap-3">
                        <User className="w-5 h-5 shrink-0" /> Profil Bilgileri
                    </button>
                    <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-600 font-semibold rounded-xl flex items-center gap-3 transition-colors">
                        <Bell className="w-5 h-5 shrink-0" /> Bildirimler
                    </button>
                    <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-600 font-semibold rounded-xl flex items-center gap-3 transition-colors">
                        <Globe className="w-5 h-5 shrink-0" /> Dil / Language
                    </button>
                    <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-600 font-semibold rounded-xl flex items-center gap-3 transition-colors">
                        <Lock className="w-5 h-5 shrink-0" /> Güvenlik
                    </button>

                    <div className="pt-8 mt-8 border-t border-gray-100">
                        <button
                            onClick={() => {
                                localStorage.removeItem("currentUser");
                                window.location.href = "/login";
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-black rounded-xl flex items-center gap-3 transition-colors group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Güvenli Çıkış
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-400" /> Hesap Ayarları
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ad Soyad</label>
                                <input type="text" defaultValue={currentUser?.name} className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl px-4 py-3 outline-none" disabled />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Telefon (Giriş ID)</label>
                                <input type="text" defaultValue={currentUser?.phone} className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl px-4 py-3 outline-none" disabled />
                                <p className="text-[11px] text-gray-400 mt-1 font-medium">Telefon numaranızı değiştirmek için site yönetimi veya Cosmic Comet destek ekibi ile iletişime geçiniz.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-gray-400" /> Gizlilik Kum Havuzu (Sandbox)
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="pr-4">
                                    <h3 className="font-bold text-gray-900 text-sm">Numaramı Komşularımdan Gizle</h3>
                                    <p className="text-[11px] text-gray-500 font-medium mt-1">Komşuluk Ağı ve Site Sakinleri modülünde iletişim bilgileriniz gizlenir, sadece site yönetimi görebilir.</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center justify-end p-1 cursor-pointer shrink-0 shadow-inner">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="pr-4">
                                    <h3 className="font-bold text-gray-900 text-sm">Push Bildirimlerine İzin Ver</h3>
                                    <p className="text-[11px] text-gray-500 font-medium mt-1">Aidat hatırlatmaları, kargo teslimleri ve acil duyurular tarayıcınıza bildirim olarak düşer.</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center justify-end p-1 cursor-pointer shrink-0 shadow-inner">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                        </div>

                    </div>

                    <button className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-md active:translate-y-px">
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </div>

        </div>
    );
}
