# Site Yönetimi Uygulaması Özellik Listesi

## 🛠️ Şu Anki Çalışır Kabiliyetler (Mevcut Durum)

Uygulamanın şu anda sunduğu temel altyapı şunları içeriyor:

1. **Modern Kullanıcı Arayüzü (UI)**
   - Tamamen mobil ve masaüstü duyarlı (responsive) Facebook tarzı bir haber akışı.
   - Hızlı geçiş sağlayan sol gezinme menüsü (Sidebar) ve üst arama/bildirim çubuğu (Navbar).

2. **Google ile Oturum Açma Altyapısı (NextAuth)**
   - Kullanıcıların kendi Google/Gmail hesaplarıyla 1 tıkla sisteme kayıt olup giriş yapabilmesini sağlayan hazır kimlik doğrulama mimarisi.

3. **İletişim Panosu (Gönderi Akışı)**
   - Sakinlerin veya yönetimin gönderi paylaşabileceği metin kutusu arayüzü ve akış tasarımı.

4. **Site Sakinleri Rehberi (`/directory`)**
   - Hangi blok ve dairede kimlerin oturduğunu listeleyen, içinde isim veya blok araması yapılabilen bir rehber arayüzü.

5. **Duyurular Köşesi (`/announcements`)**
   - Sadece site yönetiminin sabitleyebileceği veya paylaşabileceği resmi duyurular, asansör bakımları, toplantı bildirimleri gibi bilgilerin listelendiği sayfa.

---

## 🚀 Geliştirme İçin Yenilikçi Öneriler

Site yönetimini modernleştirecek ve sakinlerin işini çok kolaylaştıracak şu modülleri eklemeyi düşünebiliriz:

### 1. Dijital Talep ve Arıza Bildirim Sistemi (Helpdesk)
- **Nasıl Çalışır?**: Sakinlerin "Asansör bozuk", "Koridor lambası yanmıyor" gibi taleplerini fotoğraf ekleyerek oluşturabildiği bir ekran.
- **Yenilik**: Yönetim bu talepleri "İşleme Alındı", "Çözüldü" gibi statülere çeker ve durum değiştiğinde sakine anında Push Bildirim veya SMS gider.

### 2. Ortak Alan Rezervasyon Sistemi
- **Nasıl Çalışır?**: Site içindeki tenis kortu, halı saha, barbekü alanı veya toplantı salonu gibi alanlar için takvim üzerinden saatlik rezervasyon yapılabilen bir arayüz.
- **Yenilik**: Çifte rezervasyonları engeller, adil kullanım kotası koyulabilir (örneğin ayda en fazla 4 kez).

### 3. Akıllı Aidat ve Finansal Şeffaflık Modülü
- **Nasıl Çalışır?**: Sakinlerin aidat borçlarını görüp kredi kartı ile (Sanal POS entegrasyonuyla) ödeyebileceği bir sayfa.
- **Yenilik**: "**Paramız Nereye Gidiyor?**" adında bir grafik sayfası ile, sitenin o ayki gelir-gider tablosunun pasta grafiklerle şeffafça paylaşılması (ör: Elektrik %30, Güvenlik %40, Peyzaj %10). Bu, yönetim ile sakinler arasındaki güveni inanılmaz artırır.

### 4. Havuz ve Otopark Doluluk Göstergeleri
- **Nasıl Çalışır?**: Eğer site kameralarıyla basit bir entegrasyon veya kapı giriş sayacı (IoT) kurulursa, uygulamada "Sıcak bir yaz günü: Havuz şu an %80 dolu" veya "Misafir otoparkında 3 boş yer var" gibi canlı widgetlar gösterilebilir.

### 5. Komşuluk Ağı / 2. El Pazar Yeri & Yardımlaşma
- **Nasıl Çalışır?**: Sadece site sakinlerinin girebildiği mini bir letgo/sahibinden bölümü. "Kullanmadığım bisikleti satıyorum" veya "Yarın akşam 2 saatliğine matkaba ihtiyacım var" gibi ilanların verilebileceği bir modül.

### 6. Anketler ve Ortak Karar Alma (Dijital Oylama)
- **Nasıl Çalışır?**: "Dış cephe ne renk boyansın?" veya "Açık havuza çocuk kaydırağı alınsın mı?" gibi konularda yönetim anket açar. Sadece ev/daire sahipleri dijital olarak oy kullanır. Katılım artar.
