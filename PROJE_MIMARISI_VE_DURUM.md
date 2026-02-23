# Cosmic Comet - Yeni Nesil AI Destekli Site & Tesis Yönetimi

Bu doküman, projeye yeni dahil olacak geliştiriciler, yatırımcılar veya proje paydaşlarının sistemin mevcut durumunu, mimarisini ve kod yapısını hızlıca anlayabilmesi için hazırlanmıştır.

## 🚀 Proje Vizyonu ve Amacı
Cosmic Comet, geleneksel site ve tesis yönetim yazılımlarının (yönetim panelleri, aidat takibi, duyurular) ötesine geçerek; **Yapay Zeka (AI)** destekli otomasyonlar, modern bir sosyal ağ deneyimi (Facebook / Discord benzeri UI) ve şeffaf bir dijital komşuluk ağı sunmayı hedefleyen çok kiracılı (Multi-Tenant) bir SaaS platformudur.

Kullanıcılar (Sakinler) sistemi sıkıcı bir fatura ödeme portalı olarak değil, sitelerindeki etkinlikleri takip edebilecekleri, 2. el eşya alım-satım yapabilecekleri, anketlere katılabilecekleri aktif bir yaşam platformu olarak kullanırlar.

---

## 🛠 Kullanılan Teknolojiler (Tech Stack)
Proje, güncel ve yüksek performanslı modern web teknolojileri ile inşa edilmiştir:

*   **Frontend Framework:** Next.js 15 (App Router kullanılarak)
*   **UI/Kütüphane:** React 19
*   **Stil (Styling):** Tailwind CSS v4 & CSS Modules
*   **İkonlar:** Lucide React
*   **Veritabanı & Backend:** Firebase / Google Cloud
    *   **Firebase Authentication:** SMS Doğrulaması (Phone Auth)
    *   **Firestore Database:** Gerçek zamanlı (Real-time NoSQL) veri yönetimi
*   **Dil:** TypeScript (Sıkı tür güvenliği)
*   **Dil Desteği (i18n):** React Context API üzerinden yönetilen çok dilli yapı (TR, EN, DE, RU).

---

## 📂 Proje Klasör Yapısı (Architecture)
Projenin kök dizinindeki en önemli klasörler ve görevleri aşağıdadır:

```text
cosmic-comet/
├── src/
│   ├── app/                    # Next.js App Router (Tüm sayfalar ve API'ler)
│   │   ├── (public)/           # Gelecekte Landing Page için ayrılabilecek public sayfalar
│   │   ├── admin/              # Site yönetim paneli (/admin/login dahil)
│   │   ├── announcements/      # Duyurular modülü sayfası
│   │   ├── directory/          # Komşuluk rehberi modülü
│   │   ├── helpdesk/           # Arıza/Talep bildirim modülü
│   │   ├── login/              # Sakin (Resident) Login sayfası (SMS & Şifre)
│   │   ├── marketplace/        # 2. El / Dijital Pazar modülü
│   │   ├── select-site/        # Giriş sonrası kullanıcının sisteme kayıtlı sitelerini seçtiği ekran
│   │   ├── globals.css         # Temel Tailwind ve CSS değişkenleri
│   │   └── layout.tsx          # Ana HTML sarmalayıcısı ve global UI parçaları (Sidebar/Navbar)
│   ├── components/             # Tekrar kullanılabilen React Bileşenleri
│   │   ├── providers/          # Context API'leri (SiteProvider, LanguageProvider)
│   │   ├── Sidebar.tsx         # Sol navigasyon menüsü
│   │   ├── Navbar.tsx          # Üst navigasyon çubuğu
│   │   └── LiliumAIWidget.tsx  # Yapay Zeka botu (Hazırlık aşamasında)
│   ├── data/
│   │   └── mockDB.ts           # Geliştirme aşamasında kullanılan Sahte (Mock) veriler
│   └── lib/
│       └── firebase.ts         # Firebase başlatma (init) fonksiyonları
├── public/                     # Statik dosyalar (Resimler, favicon vb.)
├── .env.local                  # Firebase API gizli anahtarlarının eklendiği ayar dosyası
├── tailwind.config.ts          # Tema yapılandırması
├── KULLANIM_KILAVUZU.md        # Firebase hesap açma ve Bypass detaylı kurulum kılavuzu
└── package.json                # Proje bağımlılıkları ve scriptler
```

---

## 🔐 Kimlik Doğrulama (Authentication) Akışı
Sistemde iki farklı giriş senaryosu ve rol bulunmaktadır:

### 1. Sistem Yöneticisi / Site Yöneticileri (Admin)
*   **URL:** `/admin/login`
*   **Akış:** Yöneticiler için özel ve gizli tasarlanmış giriş kapısıdır. Bu aşamada statik şifreleme veya özel e-posta yetkilendirmesi mevcuttur.
*   **Yetkiler:** Duyuru oluşturma, Helpdesk biletlerini yanıtlama, aidat atama, site özelliklerini açıp kapatma.

### 2. Site Sakinleri (Resident)
*   **URL:** `/login`
*   **Akış:** 
    1. Kullanıcı telefon numarasını girer (`+90`, `+49` vb. ülke kodları desteklenir).
    2. Firebase SMS OTP (One-Time Password) ile kullanıcının telefonuna bir doğrulama kodu gönderilir.
    3. Kod doğrulandıktan sonra, kullanıcı ilk kez giriş yapıyorsa sistem bir "Kalıcı Şifre (Password)" belirlemesini ister. (Böylece sonraki girişlerini SMS beklemeden Şifre sekmesinden yapabilir).
    4. Kullanıcı `/select-site` sayfasına yönlendirilir ve kayıtlı olduğu sitesini (veya sitelerini) seçerek `Dashboard` paneline düşer.
*   **Bypass Sistemi (Geliştirici Kurtarıcısı):** Firebase kurulumu tamamlanana kadar geliştiricilerin SMS limitine takılmaması için kod içerisine ("5070835122" gibi) **Master Phone Bypass** dahil edilmiştir. Bu numaralar Firebase'e gitmeden direkt içeri alınır.

---

## 🗄️ Veritabanı (Firestore) Şeması
Geliştirme süreci boyunca "mock" veritabanından tamamen gerçek canlı Firestore entegrasyonuna geçiş yapılmıştır. Koleksiyon yapıları şu şekildedir:

*   `users`: Sistemdeki tüm "insanların" yer aldığı tablo (Admin, sakin vb.). Telefon no, Rol, İsim, Hashlenmiş şifre bu tabloda durur.
*   `sites`: Platformu kullanan sitelerin (Örn: Çamlıtepe Evleri, Kozmos Rezidans) verisi.
*   `memberships`: Hangi kullanıcının (`userId`), hangi sitede (`siteId`), hangi dairede oturduğu ve rolünün ne olduğuna dair çatı tablo. (Çoklu-kiracı mimarisinin bağlaç noktası).
*   `announcements`: (Duyurular) -> `siteId`'ye bağlı olarak filtrelenir. Pinned (Sabit) özelliği vardır.
*   `helpdesk_tickets`: (Talepler) -> Sakinlerin açtığı şikayetler. `status` (pending, completed) olarak güncellenebilir.
*   `marketplace_listings`: (İlanlar) -> Site içi 2. el pazarında gösterilen veri.

*Tüm ekranlardaki Modüller `onSnapshot` hook'u sayesinde veritabanındaki değişikliği real-time olarak anında ekrana (sayfa yenilemeden) yansıtır.*

---

## ✅ Tamamlanan Özellikler (Mevcut Durum)
Projenin **Faz 11'e kadar olan tüm adımları** eksiksiz tamamlanmıştır:
1.  **Frontend Mimari:** Modern, Facebook benzeri responsif tasarım oluşturuldu.
2.  **Veritabanı Entegrasyonu:** Tamamı Firestore'a bağlandı (Okuma/Yazma modülleri yapıldı).
3.  **Authentication:** Hem SMS hem Custom Password sistemi aktif edildi. Multilingual (Çoklu dil) Login tamamlandı.
4.  **Dinamik Modüller:**
    *   **Yardım Masası (Helpdesk):** Bilet oluşturma ve liste.
    *   **Pazar Yeri (Marketplace):** Komşu içi ilan oluşturma modalı ve listesi.
    *   **Duyurular:** Yöneticiye özel duyuru ekleme modalı ve rozetli liste ekranı.
    *   **Rehber (Directory):** Yönetim ve sakin kimliklerinin gerçek zamanlı sergilenmesi.

## 🔜 Sonraki Adımlar (Roadmap)
Projenin devralındıktan sonra geliştirilmesi planlanan bir sonraki önemli fazı şunlardır:

1.  **Aidat Sistemi (Finans Modülü):** Firestore üzerindeki `invoices` ve `transactions` koleksiyonlarının `/finances` ve `/dues` sayfalarıyla haberleşerek kredi kartı ödeme simülasyonlarının yapılması.
2.  **Yapay Zeka (Lilium AI) Hakem Heyeti Modülü:** Uyuşmazlıklarda Google Gemini (veya OpenAI) API'si kullanarak `Cloud Functions` üzerinde sanal hakem paneli tetiklemek. Kök kodları ve API Route'ları hazırdır.
3.  **Yetkilendirme Güvenliği (Security Rules):** Firestore Security Rules (`firestore.rules`) dosyasının üretime (production) tam hatasız hazır hale getirilmesi.

---

## 💻 Projeyi Bilgisayarınızda Çalıştırma
Projeyi sıfırdan ilk kez çalıştıracak geliştirici için adımlar:

1.  Terminali açıp proje kök dizinine gidin.
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Uygulamayı geliştirici (dev) modunda başlatın:
    ```bash
    npm run dev
    ```
4.  Tarayıcınızdan `http://localhost:3000` adresine gidin.
    *Not: Sistemin tam çalışması için kök dizinde `.env.local` adlı bir dosya içinde Firebase API anahtarlarının tanımlı olması gerekmektedir (Detaylar için `KULLANIM_KILAVUZU.md` dosyasına bakınız).*
