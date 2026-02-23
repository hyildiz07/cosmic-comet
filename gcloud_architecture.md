# Faz 6: Bulut Tabanlı (Cloud-Native) Tam Faal Mimari (GCP & Firebase)

Bu belge, "Cosmic Comet" (SaaS Site Yönetimi) projesini bir arayüz demosundan çıkarıp **Google Cloud Platform (GCP)** ve **Firebase** altyapısı kullanarak 7/24 çalışan, ölçeklenebilir ve tam faal bir uygulamaya dönüştürme adımlarını içermektedir.

Maliyet, hız ve "Gerçek Zamanlı" (Real-time) veri gereksinimleri (Chat, Konsey tartışmaları vb.) göz önüne alındığında, Google'ın sunduğu **Firebase** ekosistemi bu proje için en kusursuz çözümdür.

## 1. Mimari Bileşenler (Infrastructure Stack)

### A. Veritabanı: Firebase Firestore (NoSQL)
Projede çoklu-müşteri (Multi-Tenant) yapısı olduğu için ilişkisel veritabanları (PostgreSQL vb.) kurulum zorluğu ve maliyet yaratabilir. Firestore, esnek yapısıyla bu SaaS kurgusu için idealdir.
- **Koleksiyonlar (Collections):**
  - `sites`: (Adı, özellikleri, AI Bakiyesi vb.)
  - `users`: (Telefon, İsim, Profil Fotoğrafı vb.)
  - `memberships`: (Hangi kullanıcının hangi sitede oturduğu, rolü - `userId` + `siteId`)
  - `arbitration_topics`: (Uzlaşı Konseyi başlıkları, bağlı yorumlar alt koleksiyonu)
  - `chat_messages`: (Lilium AI ile olan geçmiş yönetici konuşmaları)

### B. Kimlik Doğrulama: Firebase Authentication
Kullanıcıların tek bir telefon numarasıyla tüm sitelerine erişebilmesi için en güvenli yol.
- **Yöntem:** Telefon Numarası ile Giriş (SMS OTP).
- *Alternatif:* Google hesabı ile giriş (Gmail login).

### C. Sunucu Tarafı Mantık (Backend): Firebase Cloud Functions (Node.js)
Yapay zeka (AI) anahtarları (API Keys) veya hassas bakiye düşme işlemleri asla ön tarafta (Frontend) çalışmamalıdır. Bunları Google sunucularında arka planda tetiklenen (Serverless) fonksiyonlarda yazacağız.
- **Fonksiyon 1 (`generateAiVerdict`):** Uzlaşı konseyinde "Hakem Kararı İste" dendiğinde tetiklenecek. Siteden AI kredisini düşecek ve Gemini API'ye bağlanıp karar metnini oluşturup veritabanına yazacak.
- **Fonksiyon 2 (`liliumAdminChat`):** Yöneticinin AI arayüzündeki komutlarını (örn: "Ahmet'i Daire 5'e ekle") alacak, NLP ile işleyip veritabanında direkt olarak O işlemi yapacak.

### D. Yapay Zeka (AI) Motoru: Google Gemini API (Vertex AI)
- Gemini Pro (veya Flash) modeli kullanılacak. `Function Calling` yeteneği ile sitenin aidat ekleme, duyuru yapma gibi eylemlerini otonom olarak (Bizim kodlayacağımız Cloud Functions üzerinden) yapması sağlanacak.

### E. Depolama (Storage): Firebase Cloud Storage
- Yüklenen fatura makbuzları, duyuru PDF'leri, profil fotoğrafları ve QR geçiş kodları gibi görsel dosyaların barındırılması için kullanılacak.

### F. Barındırma (Hosting)
- **Frontend (Web Uygulaması):** Next.js uygulamasını, Google Cloud projesine direk bağlı olması ve CI/CD (Sürekli Entegrasyon) kolaylığı sebebiyle **Vercel** üzerine veya Google Cloud Run üzerine koyacağız.

---

## 2. Uygulama Planı (Step-by-Step Execution)

Eğer onaylarsanız, kurulumu şu aşamalarla **bizzat yapacağım**:

### Aşama 1: GCP & Firebase Projesinin Kurulması (Temel Atma)
1. Yeni bir Firebase (Google Cloud destekli) projesinin oluşturulması.
2. Web Uygulamasının Firebase'e kaydedilmesi ve yapılandırma (`firebaseConfig`) ayarlarının `src/lib/firebase.ts` dosyasına eklenmesi.
3. Çevresel Değişkenlerin (`.env.local`) oluşturulması.

### Aşama 2: Veritabanı ve Auth Entegrasyonu (Kalıcılık)
1. `Firebase Authentication` (Telefon/Gmail) aktive edilecek. Mock veriler yerine sisteme gerçekten giriş yapılacak.
2. Sahte `mockDB.ts` dosyamız silinecek. Onun yerine verileri **Firestore**'dan canlı (real-time) çeken ve oraya yazan servisler (`siteService.ts`, `userService.ts` vb.) yazılacak.
3. Çoklu-Site mantığı gerçek veritabanı sorgularıyla çalışır hale getirilecek.

### Aşama 3: Yapay Zeka ve Sunucu Bağımsızlığı (Otonomluk)
1. Yapay Zeka anahtarımızı koda gizleyerek `Google Gemini SDK` entegre edilecek.
2. AI Uzlaşı Konseyi (Tekil/Üçlü Mod) sadece "setTimeout" gecikmeli bir animasyon olmaktan çıkıp, o anki yorumları okuyan *gerçek* bir yapay zekaya dönüştürülecek.
3. Lilium Admin Panelindeki chat arayüzü, gerçekten veritabanını güncelleyebilen akıllı bir `Function Caller` asistanına dönüştürülecek.

### Aşama 4: Yayına Alma (Canlı Test)
1. Proje **Vercel** hesabı üzerinden canlı domain adresine yönlendirilecek.
2. Telefonunuzdan girip gerçekten kendi SMS kodunuzla üye olup, yapay zekayı anlık olarak kullanabileceksiniz.

---

**Onaylarsanız, Aşama 1 (Google Cloud / Firebase Entegrasyon Kurulumu) ile derhal inşaat sürecine başlıyorum!**
