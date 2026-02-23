"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans py-20 px-6">
            <div className="max-w-3xl mx-auto bg-white p-10 md:p-14 rounded-3xl shadow-sm border border-gray-100">
                <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm mb-8 hover:text-indigo-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gizlilik Politikası</h1>
                </div>

                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed">
                    <p><strong>Son Güncelleme: 22 Şubat 2026</strong></p>
                    <p>Cosmic Comet ("Şirket", "Biz", "Bizi" veya "Bizim"), gizliliğinize saygı duyar ve kişisel verilerinizin korunmasını ciddiye alır. Bu Gizlilik Politikası, Cosmic Comet web sitesini ve mobil uygulamasını ("Hizmet") kullandığınızda kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve paylaştığımızı açıklar.</p>

                    <h3>1. Toplanan Veriler</h3>
                    <p>Hizmetimizi kullandığınızda aşağıdaki veri türlerini toplayabiliriz:</p>
                    <ul>
                        <li><strong>Kişisel Tanımlayıcı Bilgiler:</strong> Ad, soyad, telefon numarası, e-posta adresi.</li>
                        <li><strong>Cihaz ve Kullanım Verileri:</strong> IP adresiniz, tarayıcı türünüz, işletim sisteminiz ve uygulamamız içerisindeki etkileşim verileriniz.</li>
                        <li><strong>Ödeme Bilgileri:</strong> Güvenli ödeme altyapımız (Sanal POS) aracılığıyla işlenen işlemlerde kredi kartı bilgileriniz doğrudan lisanslı ödeme kuruluşuna (BDDK onaylı) aktarılır, sistemlerimizde <strong>kesinlikle saklanmaz.</strong></li>
                    </ul>

                    <h3>2. Verilerin Kullanımı</h3>
                    <p>Topladığımız verileri şu amaçlarla kullanırız:</p>
                    <ul>
                        <li>Hesabınızı oluşturmak ve yönetmek</li>
                        <li>Aidat, kira veya diğer yönetim tahsilatlarını gerçekleştirmek</li>
                        <li>Toplu SMS iletişimleri ve e-posta bildirimleri (Acil durumlar) göndermek</li>
                        <li>Güvenlik ihlallerini tespit etmek ve önlemek (örn. Misafir Karekod sistemi)</li>
                    </ul>

                    <h3>3. Üçüncü Taraflarla Paylaşım</h3>
                    <p>Kişisel verileriniz, yasal bir zorunluluk (Mahkeme Kararı vb.) olmadıkça <strong>hiçbir surette üçüncü partilerle ticari amaçlı paylaşılamaz veya satılamaz.</strong></p>

                    <h3>4. Veri Güvenliği</h3>
                    <p>Verilerinizi korumak için endüstri standardı güvenlik önlemleri (SSL şifreleme, güvenlik duvarları) kullanıyoruz. Altyapımız Google Cloud (Firebase) altyapısında yüksek güvenlikli sunucularda barındırılmaktadır.</p>
                </div>
            </div>
        </div>
    );
}
