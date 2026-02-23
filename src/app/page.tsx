"use client";

import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Zap, Users2, Smartphone, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* Navigation Bar */}
            <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
                            C
                        </div>
                        <span className="text-xl font-black tracking-tight text-gray-900">Cosmic<span className="text-indigo-600">Comet</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-500">
                        <a href="#features" className="hover:text-indigo-600 transition-colors">Özellikler</a>
                        <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">Nasıl Çalışır?</a>
                        <a href="#pricing" className="hover:text-indigo-600 transition-colors">Fiyatlandırma</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:flex text-gray-700 font-bold text-sm hover:text-indigo-600 transition-colors">
                            Sakin Girişi
                        </Link>
                        <Link href="/admin/login" className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-md">
                            Yönetici Girişi
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px] pointer-events-none -z-10" />

                <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/50 text-indigo-700 font-bold text-xs mb-8 border border-indigo-200/50 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        Yeni Nesil Site Yönetimi
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8">
                        Yaşam alanlarınızı <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">özgürce</span> yönetin.
                    </h1>

                    <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        Cosmic Comet ile aidat takibi, duyurular, arıza bildirimleri ve güvenlik kontrolü hiç olmadığı kadar kolay. Yöneticiler için güçlü, sakinler için basit.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#contact" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-transform active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2">
                            Hemen Demo İste <ArrowRight className="w-5 h-5" />
                        </a>
                        <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2">
                            Mevcut Sisteme Gir
                        </Link>
                    </div>
                </div>
            </section>

            {/* Platform Features Grid */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Her Şey Tek Bir Yerde</h2>
                        <p className="text-gray-500 font-medium max-w-xl mx-auto">Birden fazla uygulama kullanmaya son. İhtiyacınız olan tüm yönetim modülleri tek platformda birleşti.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-3xl bg-slate-50 border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Tek Tıkla Finans</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">Toplu aidat borçlandırması yapın, sakinleriniz kredi kartı ile Sanal POS üzerinden 3D Secure güvencesiyle ödesin.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="p-8 rounded-3xl bg-slate-50 border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Akıllı Güvenlik (Kiosk)</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">Güvenlik personeli tabletinden QR ile misafir onayı yapsın, gelen kargoları sisteme işleyip sakinlere anlık SMS/Push atsın.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="p-8 rounded-3xl bg-slate-50 border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                                <Users2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Katılımcı Yönetim</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">Talep/Arıza sistemi, online anketler ve duyuru panoları ile site yönetimini tamamen dijital ve şeffaf hale getirin.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact / Footer */}
            <footer className="bg-gray-900 text-white pt-20 pb-10" id="contact">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-black">C</div>
                            <span className="text-xl font-black tracking-tight">Cosmic<span className="text-indigo-400">Comet</span></span>
                        </div>
                        <p className="text-gray-400 font-medium max-w-sm mb-6">
                            Yeni nesil yapay zeka destekli, modern yüzlü ve yüksek güvenlikli site, rezidans ve iş merkezi yönetim sistemi.
                        </p>
                        <a href="mailto:hello@cosmiccomet.com" className="font-bold text-indigo-400 hover:text-indigo-300">hello@cosmiccomet.com</a>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-4">Kurumsal</h4>
                        <ul className="space-y-3 font-medium text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Referanslar</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Kariyer</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-4">Yasal</h4>
                        <ul className="space-y-3 font-medium text-gray-400 text-sm">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
                            <li><Link href="/kvkk" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Çerez Politikası</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-800 text-center text-sm font-medium text-gray-500">
                    &copy; 2026 Cosmic Comet Technologies Inc. Tüm hakları saklıdır. Lilium SaaS Engine Altyapısı kullanılmaktadır.
                </div>
            </footer>
        </div>
    );
}
