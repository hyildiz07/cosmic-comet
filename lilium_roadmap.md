# LİLİUM AI & APSİYON ENTEGRASYON YOL HARİTASI (PHASE 2)

Bu doküman, mevcut "Cosmic Comet" uygulamamızı, Apsiyon verilerinizi okuyabilen, **SMS doğrulamasıyla** çalışan ve güvenli bir **Yapay Zeka (Lilium AI)** asistanı barındıran tam teşekküllü bir yönetim merkezine dönüştürmenin yol haritasıdır.

## 1. Mimari İhtiyaçlar ve Eksikliklerin Giderilmesi

Apsiyon'un detaylı SOP dokümanınızdan anlaşıldığı üzere, finansal disiplin, kişi hiyerarşisi ve veri güvenliği ön planda. Bu yapıyı uygulamamıza şu şekilde entegre etmeliyiz:

### A. Giriş Sistemi (Authentication) Değişimi 📲
- **Mevcut Durum**: Google/Gmail ile giriş.
- **Yeni Sistem**: **Telefon Numarası + SMS Doğrulama (OTP)**
- **Neden?**: Kişisel veri güvenliği. Lilium AI'ın *sadece* mesaj atan kişinin telefon numarasını veri tabanında (veya Google Sheets'te) arayıp **"Sadece bu numaraya ait dairenin borcunu söyle"** kuralını işletebilmesi için SMS doğrulaması şarttır. (Bunun için Firebase SMS Auth veya Twilio kullanılabilir).

### B. Kişisel Gizlilik Panosu (Privacy Sandbox) 🕵️
- **Öneri**: Ayarlar sekmesine "Sosyal Özellikler" şalteri eklenmeli.
- **Kurgu**: İsteyen sakin "Adımı ve dairemi Rehberde, Komşuluk Ağında ve Akışta gizle" diyebilmeli. Bu sayede sadece Lilium AI ve Yönetim ile muhatap olurlar, sosyal taraftan izole olurlar.

---

## 2. Apsiyon Veri Senkronizasyonu (Veri Çekimi) 🔄

Apsiyon'un resmi bir API'si olmadığı için verileri manuel indirdiğinizi belirttiniz. Bunu otomatikleştirmek ve hızlandırmak için 3 seçeneğimiz var:

1. **Google Sheets Mimarisi (En Pratik)**: 
   - Apsiyon'dan indirdiğiniz Excel dosyalarındaki (Kişiler, Bakiyeler, Makbuzlar) verileri tek bir Google Sheets dosyasına kopyalarsınız (veya doğrudan Google Drive'a Google Sheets olarak atarsınız).
   - Bizim uygulamamız (Next.js) **Google Sheets API** kullanarak her 5 dakikada bir bu tabloyu okur ve kendi veritabanını (veya doğrudan Lilium AI hafızasını) günceller.
2. **Uygulama İçi Excel Yükleme (Admin Paneli)**:
   - Sizin için bir "Yönetici Paneli" yaparız. Apsiyon'dan Excel'i indirir, bizim panele sürükleyip bırakırsınız. Sistem saniyeler içinde tüm borçları günceller.
3. **RPA (Robotik Süreç Otomasyonu) - İleri Seviye Otomasyon**:
   - Arka planda çalışan bir bot (Puppeteer/Playwright) sizin yerinize gece saat 03:00'te Apsiyon'a giriş yapar, Excel raporlarını indirir ve sistemimize yükler. (Bu biraz maliyetli ve Apsiyon arayüzü değiştiğinde güncellenmesi gereken bir yöntemdir, ancak **%100 otomasyon** sağlar).

**Tavsiye Edilen Yol**: Başlangıç için **Seçenek 2 (Admin Panelinden Excel Yükleme)** veya **Seçenek 1 (Google Sheets)** ile ilerlemektir.

---

## 3. Lilium AI Zekası ve Kurgusu 🧠

Lilium AI, WhatsApp'taki bir sanal asistan gibi veya uygulama içindeki bir sohbet balonu (Chatbot) olarak kurgulanacaktır.

### Yönetici (Admin) Paneli Prompt Ayarları
- Size özel bir Admin ekranı yapacağız. Burada AI'ın kişiliğini (Prompt) istediğiniz an değiştirebileceksiniz.
- *Örnek Admin Girdisi*: "Sen Lilium Sitesi'nin asistanısın. Kibar ve resmî konuş. Kullanıcının sistemdeki borcu sıfırsa teşekkür et. Borcu varsa sadece tutarı söyle, detay verme."

### Lilium AI Çalışma Akışı ve Güvenlik
1. Kullanıcı SMS ile sisteme girdi. Sistem bu kişinin telefonunu biliyor: `+90555...`
2. Kullanıcı sorar: *"Gecikmiş aidat borcum ne kadar?"*
3. Uygulama, Google Sheets veya DB'deki Apsiyon verilerinde bu numarayı arar.
4. Numaraya ait daireyi (Örn: A Blok Daire 12) ve borç hanesini (Tahakkuk: 1000 TL, Kalan: 500 TL) bulur.
5. Yapay zeka'ya **Gizli Bağlam (Context)** olarak şu veri gider: *"Kullanıcı sorusu: Borcum ne? (Bu kullanıcının telefonu X, daire A-12, güncel borcu 500 TL)"*
6. Lilium AI kişisel ve güvenli cevabını üretir: *"Merhaba Ahmet Bey, A Blok 12 numaralı dairenizin güncel borç bakiyesi 500 TL'dir. Apsiyon üzerinden İyzico ile 39 gün %0 komisyonla ödeyebilirsiniz."*

### Yapay Zeka Başka Neler Yapabilir? (Sizin Düşünmediğiniz Artılar)
- **Kural Okuyucu**: Havuz saat kaça kadar açık? (Lilium AI SOP dokümanını okuyup cevaplar).
- **Asansör Arızası Analizi**: Biri "Asansör çalışmıyor" dediğinde, AI otomatik olarak Helpdesk (Arıza bildirim) formunu arka planda doldurup size iş kaydı açabilir.
- **Toplu Borçlu Hatırlatması**: Lilium AI, borcu 30 günü geçenlere sizin adınıza otomatik ve nazik SMS/E-mail metinleri hazırlayabilir.

---

## 4. Geliştirme Yol Haritası (Faz 2)

Eğer bu mimari kafanıza yattıysa, geliştirme akışımız şu şekilde olacak:

- [ ] **Adım 1**: Mevcut Google Login yapısını söküp, Firebase SMS OTP (Telefon numarası onaylı giriş) sistemini kurmak.
- [ ] **Adım 2**: Kullanıcıların profil ayarlarına "Beni Gizle/Görünmez Yap" özelliğini kodlamak.
- [ ] **Adım 3**: Apsiyon verilerinizi alabilmemiz için size özel bir "Yönetici Paneli" yaratmak. Buraya Google Sheets Linki veya Excel Yükleme alanı koymak.
- [ ] **Adım 4**: Admin paneline "Lilium AI Talimatları (Prompt)" ayar kutusunu eklemek.
- [ ] **Adım 5**: Uygulamanın sağ alt köşesine asistan bot (Lilium AI) arayüzünü entegre etmek ve OpenAI (veya benzeri bir LLM) entegrasyonu ile telefon-borç eşleştirmesini canlandırmak.

Bu plan doğrultusunda ilerlememize onay veriyor musunuz? Hangi veri eşleştirme yöntemini (Google Sheets mi yoksa Panelden Excel Yükleme mi) tercih edersiniz?
