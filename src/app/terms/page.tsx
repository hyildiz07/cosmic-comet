"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans py-20 px-6">
            <div className="max-w-3xl mx-auto bg-white p-10 md:p-14 rounded-3xl shadow-sm border border-gray-100">
                <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm mb-8 hover:text-indigo-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Kullanıcı Sözleşmesi</h1>
                </div>

                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed">
                    <p><strong>Yürürlük Tarihi: 22 Şubat 2026</strong></p>
                    <p>Lütfen Cosmic Comet (bundan böyle "Platform" olarak anılacaktır) web sitesini ve uygulamasını kullanmadan önce bu Kullanıcı Sözleşmesini ("Sözleşme") dikkatlice okuyunuz.</p>

                    <h3>1. Taraflar</h3>
                    <p>Bu Sözleşme, Platform'u kullanan kişi, kurum veya site yönetimi ("Kullanıcı") ile sistemi sağlayan Cosmic Comet Yazılım Teknolojileri A.Ş. ("Şirket") arasında düzenlenmiştir.</p>

                    <h3>2. Hizmetin Kapsamı</h3>
                    <p>Cosmic Comet, toplu konut, site, iş merkezi ve rezidansların dijital ortamda yönetilebilmesini sağlayan bulut tabanlı (SaaS) bir yazılım altyapısıdır. Tesis yönetimi, aidat takibi, duyurular ve ziyaretçi optimizasyonu dahil olmak üzere çeşitli modüller sunar.</p>

                    <h3>3. Kullanıcı Yükümlülükleri</h3>
                    <ul>
                        <li>Platform'a kayıt olurken ve profilinizde yer alan bilgilerin doğru ve güncel olduğunu taahhüt edersiniz.</li>
                        <li>Platform'a erişim için kullanılan şifre ve doğrulama kodlarının güvenliğinden kendiniz sorumlusunuz.</li>
                        <li>Sistemi yasadışı veya yetkisiz bir amaçla kullanamazsınız.</li>
                    </ul>

                    <h3>4. Ödeme ve Aidatlar</h3>
                    <p>Platform üzerinden gerçekleştirilecek aidat ve gider ödemelerinde, ödeme entegrasyonu sağlayan iyzico / PayTR firmalarının altyapısı kullanılır. Ödeme sırasında oluşabilecek teknik gecikmelerden Şirket sorumlu tutulamaz.</p>

                    <h3>5. Fesih</h3>
                    <p>Bu sözleşme şartlarına uyulmaması durumunda, Şirket dilediği zaman Kullanıcının hesabını askıya alma veya kalıcı olarak kapatma hakkını saklı tutar.</p>

                    <h3>6. İhtilafların Çözümü</h3>
                    <p>İşbu Sözleşme'den doğabilecek uyuşmazlıkların çözümünde İstanbul Merkez (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.</p>
                </div>
            </div>
        </div>
    );
}
