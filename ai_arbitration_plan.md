# Faz 5: AI Uzlaşı Konseyi ve API Bakiye Yönetimi (Architecture)

Kullanıcının devrimsel talebi üzerine sisteme "Yapay Zeka Uzlaşı Konseyi" (AI Arbitration Council) ve "API Bakiye Yönetimi" modülleri eklenmektedir.

## 1. Yapay Zeka Uzlaşı Konseyi (AI Arbitration Council)
Sakinlerin tartışmalı konularda (örn: "Havuz gece 12'ye kadar açık kalsın mı?") uzlaşamadığı durumlarda başvuracakları bir nevi "Sanal Mahkeme" veya "Hakem Heyeti".

### Süreç Akışı:
1. **Konu Açma:** Yönetici veya bir site sakini tartışmalı bir "Uzlaşı Başlığı" açar.
2. **Sakinlerin Müzakeresi:** Tıpkı bir WhatsApp grubu veya forum gibi, site sakinleri konunun altına kendi fikirlerini, itirazlarını ve argümanlarını yazar.
3. **AI Yorumlama ve Karar (İki Mod Seçeneği):** Yeterli tartışma biriktiğinde Yönetici "AI Kararını İste" butonuna basar.
    - **Mod A (Tek Hakem):** Lilium AI, yazılan tüm yorumları analiz eder, sitenin kanunlarını (Yönetim Planı) baz alır ve tamamen tarafsız, özet niteliğinde mantıklı bir "Uzlaşı Önerisi" sunar.
    - **Mod B (Üçlü Konsey - AI vs AI vs AI):** Sistemde 3 farklı AI Persona'sı yaratılır:
        *   **Ekonomist AI:** Konuya sadece maliyet, aidat artışı ve tasarruf açısından bakar.
        *   **Empatik Komşu AI:** Konuya huzur, çocukların rahatı ve komşuluk ilişkileri açısından bakar.
        *   **Kuralcı Hukukçu AI:** Konuya sadece kanunlar, KMK (Kat Mülkiyeti Kanunu) ve riskler açısından bakar.
        *   Bu 3 yapay zeka sistem içinde *birbiriyle tartıştırılır*. Ekranda bu tartışma canlı olarak izlenir. En sonunda üçü ortak bir "Sentez (Uzlaşı) Kararı" yayınlar.

## 2. API Bakiye Yönetimi (Tenant Billing)
Yapay Zeka (Google Gemini/OpenAI vb.) işlemleri maliyetlidir ("Token" harcar). Bu SaaS platformu çoklu-müşteri (Multi-Tenant) olduğu için her sitenin maliyeti birbirinden ayrılmalıdır.

### Süreç Akışı:
1. **Site Kasası (AI Credits):** Her sitenin kendine ait bir "Yapay Zeka Bakiyesi" (Kredisi) vardır.
2. **Harcama:** Lilium Admin ile atılan her akıllı komutta veya "Üçlü Konsey" tartışmasında bu bakiyeden token düşer. Ekranda "Bu konsey tartışması 0.12 Kredi harcamıştır" gibi şeffaf ibareler yer alır.
3. **Bakiye Yükleme:** Bakiye azaldığında, site yöneticisi VEYA gönüllü site sakinleri "Site AI Kasasına Yükleme Yap" butonu ile sisteme kredi yükleyebilir (Top-up). Böylece uygulamanın sürdürülebilirliği sağlanır (SaaS Gelir Modeli).

## Teknik Kurulum (Next Steps)
1. `src/data/mockDB.ts` güncellenerek sitelere `aiBalance` (AI Bakiyesi) eklenecek.
2. Ayarlar veya yeni bir menü olarak "AI Kredi & Bakiye" ekranı eklenecek.
3. `/arbitration` rotası kurularak Uzlaşı Konseyi chat/tartışma arayüzü çizilecek.
4. Üçlü AI Konseyinin simülasyonunu yapacak sahte (mock) ama gerçekçi gecikmeli asenkron bir fonksiyon yazılacak.
