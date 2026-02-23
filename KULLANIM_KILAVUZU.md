# Cosmic Comet Kullanım ve Kurulum Kılavuzu

Hoş Geldiniz! Sistemin **"Tam Faaliyet (Prodüksiyon)"** moduna geçmesi ve SMS gibi dış entegrasyonların hatasız çalışması için Google Cloud ve Firebase tarafında yapmanız gereken ufak ayarlar bulunmaktadır. Ayrıca bu doküman uygulamanın nasıl çalıştığını açıklar.

## 1. Firebase SMS Onayı (Phone Auth) Kurulumu

Sakinlerin cep telefonu numaraları ile SMS doğrulama kodu (OTP) alarak sisteme girmesini istiyorsanız, Google tarafında şu adımları tamamlamanız şarttır:

### Adım 1: Firebase Console'da Proje Oluşturun
1. [Firebase Console](https://console.firebase.google.com/)'a gidin ve yeni bir proje oluşturun.
2. Sol menüden **Build > Authentication** sekmesine tıklayın.
3. **Sign-in method** sekmesinden **Phone (Telefon)** seçeneğini bularak **Enable (Aktifleştir)** konumuna getirin.
4. Telefon girişlerini test edebilmek için alt kısımdaki **Test phone numbers (Test numaraları)** bölümüne kendi numaranızı (Örn: `+905070835122`) ve test kodu olarak `123456` ekleyin. Bu sayede test aşamasında SMS ücreti ödemezsiniz.

### Adım 2: Domain İzinleri (Authorized Domains)
Firebase'in güvenlik politikası gereği, SMS gönderecek uygulamanın çalıştığı alan adının (URL) beyaz listede (whitelist) olması gerekir.
1. Yine **Authentication > Settings > Authorized domains** kısmına gidin.
2. `localhost` zaten eklidir. Projeyi canlıya aldığınızda sitenizin alan adını (örneğin: `liliumsite.com`) mutlaka buraya "Add domain" diyerek ekleyin. Eklenmezse SMS gitmez.

### Adım 3: .env.local Cüzdanının Doldurulması
Projenizin ana dizininde bulunan `.env.local` dosyasına, Firebase Console -> Proje Ayarları (Project Settings) sayfasında yer alan Web API Key'lerinizi girmeniz gereklidir. Örnek:

```
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyA..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="projeniz.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="projeniz"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="projeniz.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcde123"
```
Projeyi bana (AI Asistan'a) yaptırmaya devam etmek için bu keyleri temin edip `.env.local` dosyasına kaydetmeniz yeterlidir. 

**ÖNEMLİ:** Google Cloud (Firebase) bedava katmanında günlük sadece belli bir miktarda SMS hakkınız vardır. Yoğun kullanım için projenizi kullandıkça öde (Blaze) planına geçirmeniz ve GCP'den Identity Toolkit API'yi tam yetkilendirmeniz gerekebilir.

---

## 2. Sisteme Giriş Kılavuzu (Kilitli Kalmamak İçin)

Ayarları yapana kadar projenin ön yüzünde (Login) kilitli kalmamanız için sisteme bir **"Master/Bypass"** girişi ekledik.

- SMS Kodu Gönderme ekranında Numaranızı: `5070835122` (Sizin belirttiğiniz numara) 
- Ya da alternatif olarak: `5555555555` olarak girerseniz, sistem Firebase API'ye gitmeden sizi direkt içeri alacaktır. Kod olarak ne yazarsanız kabul edecektir.
- **Yöneticiler İçin Pano Girişi**: Site yöneticileri `liliumsite.com/admin/login` adresinden yönetici şifreleriyle girecektir. Buradaki geçici parola `demo@lilium.com` / şifre: `demo123`'tür. 

---

## 3. Dinamik Veritabanı (Modüllerin Çalıştırılması)

Sistemdeki "Site Sakinleri (Directory)", "Duyurular (Announcements)", "Komşuluk Ağı (Marketplace)" ve "Talep Arıza (Helpdesk)" gibi alanlar artık sadece bir vitrin/tasarım (**Mock UI**) olmaktan çıkıp tamamen Firebase Veritabanına (Firestore) bağlanacaktır.

- **İlan Ver Tıklaması**: Komşuluk ağı (Marketplace) sayfasında İlan Ver'e tıkladığınızda modal açılacak, verileri girdiğinizde veritabanına kayıt atıp sayfada sizin ilanınızı dizecektir.
- **Talep Ekleme**: Helpdesk sayfasında form doldurulduğunda sistem talebi kaydedip durumunu 'Bekliyor' olarak sıraya alacaktır.

*Tüm bu entegrasyonlar "Phase 10" başlığı altında başlatılmıştır ve şu andan itibaren anlık olarak veritabanına işlenecektir.*
