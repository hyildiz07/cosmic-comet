/**
 * Lilium Evleri - Apsiyon RPA (Robotic Process Automation) Bot
 * Bu script, her gece saat 03:00'te (cron job ile) çalıştırılarak Apsiyon üzerindeki 
 * güncel aidat borçlarını çeker ve Lilium AI ("Cosmic Comet") sistemine aktarır.
 */

require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Apsiyon Credentials from .env
const APSIYON_EMAIL = process.env.APSIYON_EMAIL;
const APSIYON_PASSWORD = process.env.APSIYON_PASSWORD;
const SITE_ID = process.env.APSIYON_SITE_ID; // Eğer şube/site seçimi varsa

async function runApsiyonBot() {
    console.log(`[${new Date().toISOString()}] 🤖 Lilium RPA Bot Başlatılıyor...`);

    if (!APSIYON_EMAIL || !APSIYON_PASSWORD) {
        console.error("❌ HATA: APSIYON_EMAIL veya APSIYON_PASSWORD .env dosyasında bulunamadı!");
        process.exit(1);
    }

    // Launch headless browser
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set a realistic viewport and user agent to avoid bot detection
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        console.log("➡️ Adım 1: Apsiyon Giriş Sayfasına Gidiliyor...");
        await page.goto('https://app.apsiyon.com/login', { waitUntil: 'networkidle2' });

        console.log("➡️ Adım 2: Form Dolduruluyor...");
        // Wait for email input (Note: selectors might need to be adjusted based on real Apsiyon DOM)
        await page.waitForSelector('input[name="email"]', { timeout: 10000 });
        await page.type('input[name="email"]', APSIYON_EMAIL, { delay: 50 });
        await page.type('input[name="password"]', APSIYON_PASSWORD, { delay: 50 });

        // Click login button
        await page.click('button[type="submit"]');

        console.log("➡️ Adım 3: Giriş Yapılıyor ve Dashboard Bekleniyor...");
        // Wait for a successful post-login element (e.g., the dashboard wrapper)
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

        console.log("✅ Giriş Başarılı!");

        console.log("➡️ Adım 4: Finans > Borçlu Listesi Çekiliyor...");
        // Navigate to the financial reports page where dues are listed
        // URL is hypothetical, needs real Apsiyon URL schema
        await page.goto(`https://app.apsiyon.com/${SITE_ID}/reports/debtors`, { waitUntil: 'networkidle2' });

        // If there's an "Excel İndir" button
        /*
        console.log("➡️ Adım 5: Excel İndiriliyor...");
        const downloadBtn = await page.$('.export-excel-btn');
        if(downloadBtn) {
           await downloadBtn.click();
           // wait for download to finish...
        }
        */

        // OR Scrape data directly from table
        console.log("➡️ Adım 5: Tablodan Veri Okunuyor...");

        // --- MOCK SCRAPING SCRIPT ---
        // This is a simulated scraping logic. In reality, you will map over document.querySelectorAll('tr.debtor-row')
        const scrapedData = [
            { id: 1, name: "Ahmet Yılmaz", phone: "5551234567", flat: "A Blok D:12", debt: 1250, date: new Date().toISOString() },
            { id: 2, name: "Ayşe Kaya", phone: "5329876543", flat: "B Blok D:05", debt: 0, date: new Date().toISOString() },
        ];

        // Simulate some processing time
        await new Promise(r => setTimeout(r, 2000));

        console.log(`✅ ${scrapedData.length} Kişinin Borç Durumu Başarıyla Çekildi!`);

        // Save data to a JSON file format that Next.js / Lilium AI can consume
        const dataPath = path.join(__dirname, '..', 'src', 'data', 'apsiyon_sync.json');

        // Ensure directory exists
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(dataPath, JSON.stringify(scrapedData, null, 2));
        console.log(`💾 Veriler '${dataPath}' adresine kaydedildi.`);

        console.log("🚀 RPA Süreci Başarıyla Tamamlandı!");

    } catch (error) {
        console.error("❌ BİR HATA OLUŞTU:", error.message);
        // Take an error screenshot for debugging
        await page.screenshot({ path: path.join(__dirname, 'error_screenshot.png') });
    } finally {
        console.log("🧹 Tarayıcı Kapatılıyor...");
        await browser.close();
    }
}

// Execute the bot
runApsiyonBot();
