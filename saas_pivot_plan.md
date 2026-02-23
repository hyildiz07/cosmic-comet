# LİLİUM SAAS: Otonom Site Yönetim Mimarisi (Faz 4)

Bu doküman, uygulamanın dışa bağımlı (Apsiyon) bir yapıdan çıkarak, kendi veritabanına sahip, **Yapay Zeka (Gemini)** tarafından yönetilen, çok kullanıcılı (Multi-Tenant) bir SaaS platformuna dönüşüm mimarisini açıklar.

## 1. Multi-Tenant (Çoklu-Site) Kurgusu

Kullanıcılar tek bir telefon numarası ile uygulamaya girer. Sistem numarayı tarar ve kişinin ilişkili olduğu tüm mülkleri bulur.

**Örnek Senaryo:**
*   **Kullanıcı:** Ahmet Yılmaz (+90 555 123 45 67)
*   Hesap 1: "Çamlıtepe Evleri" sitesinde kiracı (A Blok D:12).
*   Hesap 2: "Mavi Su Villaları" sitesinde ev sahibi (Villa 4).

**Akış:**
1.  Kullanıcı SMS ile girer.
2.  Ekrana "Hangi konutunuza/mahallinize bağlanmak istersiniz?" seçeneği çıkar.
3.  Seçim yapıldığında, uygulamanın tüm arayüzü o siteye özel olarak değişir.

## 2. Dinamik Modüller (Feature Toggling)

Her sitenin ihtiyacı farklıdır. Yöneticiler, sitelerine özel özellikleri menüden açıp kapatabilir.

*   **Örnek A:** "Çamlıtepe Evleri"nin güvenliği vardır -> "Misafir Geçişi (QR)" menüsü **Görünür**.
*   **Örnek B:** "Mavi Su Villaları"nın sadece kapıcısı vardır, havuzu yoktur -> "Havuz Rezervasyonu" ve "Misafir Geçişi" **Gizlenir**.

## 3. Lilium Admin & Google Gemini AI Entegrasyonu

Site yöneticisinin manuel olarak "Daire Ekle", "Fatura Ekle", "Borç Gir" gibi karmaşık formlarla uğraşmasına gerek kalmaz. Her şey **Lilium Admin AI** (Gemini destekli) sohbet penceresinden halledilir.

### Yapay Zeka Nasıl Çalışacak? (Function Calling)

Gemini AI'a sistemimizin veritabanını değiştirebilme yetkisi (Tool/Function Calling) vereceğiz.

**Örnek Diyalog 1:**
*   **Yönetici:** "A Blok Daire 5'e yeni kiracı taşındı. Adı Mehmet Yıldız, telefonu 05559998877."
*   **Gemini AI:** *Arka planda `registerResident(block: "A", flat: "5", name: "Mehmet Yıldız", phone: "...")` fonksiyonunu tetikler.*
*   **Gemini AI Yanıtı:** "Mehmet Yıldız, A Blok Daire 5'e başarıyla kaydedildi. Kendisine sisteme giriş yapabilmesi için otomatik bir hoş geldin SMS'i gönderdim."

**Örnek Diyalog 2:**
*   **Yönetici:** "Geçen ayki su faturası 14.500 TL geldi, sisteme gider olarak ekle."
*   **Gemini AI:** *Arka planda `addExpense(amount: 14500, category: "Su", date: "Last Month")` fonksiyonunu tetikler.*
*   **Gemini AI Yanıtı:** "14.500 TL tutarındaki su faturası giderlere işlendi. Finansal şeffaflık grafikleri (Aidat / Gider pastası) tüm sakinler için güncellendi."

---

## Geliştirme Adımları (Faz 4 Yol Haritası)

1.  **Mock Veritabanı:** Çoklu site (Multi-site) yeteneklerini göstermek için `src/data/mockDB.ts` oluşturulacak. (Siteler, İzinler, Kullanıcı Bağlantıları).
2.  **Karşılama Ekranı (Site Seçici):** Girişten sonra /select-site ekranı yapılacak.
3.  **Dinamik Sidebar:** Menü, seçilen sitenin "Aktif Modüllerine" göre (örn: Güvenlik, Kargo, İkinci El) şekil alacak.
4.  **Gemini AI Admin:** Yöneticiler için özel, "komutla çalışan" bir AI Asistan sayfası yapılacak. Doğal dil işleme (NLP) ile sahte veritabanına komut gönderme yeteneği yazılacak.
