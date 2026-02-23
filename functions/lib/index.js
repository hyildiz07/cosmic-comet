"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAiVerdict = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const genai_1 = require("@google/genai");
admin.initializeApp();
const db = admin.firestore();
// Initialize the Official Google Gen AI SDK
// The API key should be set in Firebase Functions Secrets or process.env
// For demo purposes, we will initialize it dynamically inside the function if passed, 
// or set it config: `firebase functions:config:set gemini.key="YOUR_KEY"`
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });
exports.generateAiVerdict = functions.https.onCall(async (data, context) => {
    // 1. Validate Input
    const { siteId, topic, comments, mode } = data;
    if (!siteId || !topic || !comments || !mode) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }
    // 2. Determine Cost
    const cost = mode === "single" ? 5 : 15;
    // 3. Billing & Balance Check using Firestore Transaction
    const siteRef = db.collection("sites").doc(siteId);
    try {
        await db.runTransaction(async (transaction) => {
            var _a;
            const siteDoc = await transaction.get(siteRef);
            if (!siteDoc.exists) {
                throw new Error("Site not found.");
            }
            const currentBalance = ((_a = siteDoc.data()) === null || _a === void 0 ? void 0 : _a.aiBalance) || 0;
            if (currentBalance < cost) {
                throw new Error("Insufficient AI Credits. Please top-up.");
            }
            // Deduct the cost
            transaction.update(siteRef, {
                aiBalance: currentBalance - cost
            });
        });
    }
    catch (err) {
        throw new functions.https.HttpsError("resource-exhausted", err.message);
    }
    // 4. AI Generation
    try {
        let systemPrompt = "";
        let promptText = `Konu: ${topic}\nYorumlar:\n${comments.map((c) => `- ${c.author}: ${c.text}`).join('\n')}`;
        if (mode === "single") {
            systemPrompt = "Sen tarafsız, adil ve profesyonel bir site yöneticisi ve arabulucusun. Amacın, sitedeki tartışmaları analiz edip makul, kanunlara (KMK) uygun ve herkesin faydasına olacak bir özet/karar metni çıkarmaktır.";
            promptText += "\n\nLütfen tüm bu yorumları tarafsızca analiz et ve ortak bir uzlaşı kararı açıkla.";
        }
        else {
            systemPrompt = `Sen aynı anda üç farklı uzmansın, ve bu üç uzman kendi aralarında sırayla konuşarak ortak bir karara varacaklar:
1. Ekonomist: Olayların sadece bütçe ve maliyet kısmına bakar.
2. Empatik Komşu (Zehra Teyze): Sadece insanların mutluluğuna, komşuluk ilişkilerine ve huzura odaklanır.
3. Hukukçu: Kat Mülkiyeti Kanunu (KMK) ve yasal mevzuatlara odaklanır.
             
Format şu şekilde olmalı:
[Ekonomist]: (fikirleri)
[Empatik Komşu]: (fikirleri)
[Hukukçu]: (fikirleri)
[Sentez Karar]: (Üçünün uzlaştığı nihai sonuç)`;
            promptText += "\n\nLütfen bu konuyu yukarıdaki üç uzman perspektifinden tartışarak nihai bir uzlaşı kararına bağla.";
        }
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: promptText,
            config: {
                systemInstruction: systemPrompt
            }
        });
        // 5. Return success and new AI text
        return {
            success: true,
            verdict: response.text,
            costDeduced: cost
        };
    }
    catch (err) {
        console.error("AI Error:", err);
        throw new functions.https.HttpsError("internal", "AI Engine failed to generate a verdict. " + err.message);
    }
});
//# sourceMappingURL=index.js.map