"use client";

import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export default function KvkkPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans py-20 px-6">
            <div className="max-w-3xl mx-auto bg-white p-10 md:p-14 rounded-3xl shadow-sm border border-gray-100">
                <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm mb-8 hover:text-indigo-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <Scale className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">KVKK Aydınlatma Metni</h1>
                </div>

                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed">
                    <p><strong>Veri Sorumlusu: Cosmic Comet Bilişim A.Ş.</strong></p>
                    <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, Cosmic Comet platformu olarak, kişisel verileriniz aşağıda açıklanan amaçlar kapsamında; hukuka ve dürüstlük kurallarına uygun bir şekilde işlenebilecek, kaydedilebilecek, saklanabilecek, sınıflandırılabilecek, güncellenebilecek ve mevzuatın izin verdiği hallerde üçüncü kişilere aktarılabilecektir.</p>

                    <h3>1. Kişisel Verilerinizin İşlenme Amaçları</h3>
                    <p>Kişisel verileriniz (Ad, Soyad, TC Kimlik No, Telefon, Adres, Araç Plakası);</p>
                    <ul>
                        <li>Platforma üyeliğinizin oluşturulması ve kimlik doğrulamanızın (SMS) gerçekleştirilmesi,</li>
                        <li>Site yönetiminin yürüttüğü tahsilat, gider ve aidat kalemlerinin hukuki düzlemde takip edilebilmesi,</li>
                        <li>Tesis ve güvenlik giriş/çıkış operasyonlarının (Misafir ve Kargo) yürütülmesi,</li>
                        <li>Geri bildirim sistemine (Helpdesk) düşen taleplerin yetkili kişilere iletilmesi amacıyla işlenmektedir.</li>
                    </ul>

                    <h3>2. Kişisel Verilerinizin Aktarılması</h3>
                    <p>Toplanan kişisel verileriniz; yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda, ödeme kuruluşlarına (örn. iyzico), bağımsız denetim şirketlerine, hizmet aldığımız sunucu/bulut bilişim (Google Cloud/Firebase) altyapı sağlayıcılarına ve yetkili kamu kurum ve kuruluşlarına yasal sınırlar dâhilinde aktarılabilmektedir.</p>

                    <h3>3. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h3>
                    <p>Kişisel verileriniz KVKK'nın 5. maddesinde yer alan "Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla" hukuki sebebine dayanarak, uygulama ve web arayüzleri, dijital formlar ve mobil cihazlar aracılığıyla otomatik veya kısmen otomatik yöntemlerle toplanmaktadır.</p>

                    <h3>4. KVKK 11. Madde Kapsamındaki Haklarınız</h3>
                    <p>Kanun kapsamında aşağıdaki detaylı haklara sahipsiniz:</p>
                    <ul>
                        <li>Kişisel verinizin işlenip işlenmediğini öğrenme,</li>
                        <li>Verileriniz işlenmişse bilgi talep etme,</li>
                        <li>Güncellenmesini veya düzeltilmesini talep etme (Ayarlar sayfasından),</li>
                        <li>Mevzuatta öngörülen şartlar çerçevesinde silinmesini talep etme.</li>
                    </ul>

                    <p>Haklarınıza ilişkin taleplerinizi info@cosmiccomet.com e-posta adresine güvenli elektronik imza veya kayıtlı e-posta adresinizden (KEP) iletebilirsiniz.</p>
                </div>
            </div>
        </div>
    );
}
