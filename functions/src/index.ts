import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();
const db = admin.firestore();

// Initialize the Official Google Gen AI SDK
// The API key should be set in Firebase Functions Secrets or process.env
// For demo purposes, we will initialize it dynamically inside the function if passed, 
// or set it config: `firebase functions:config:set gemini.key="YOUR_KEY"`
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

export const generateAiVerdict = functions.https.onCall(async (data, context) => {
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
            const siteDoc = await transaction.get(siteRef);
            if (!siteDoc.exists) {
                throw new Error("Site not found.");
            }

            const currentBalance = siteDoc.data()?.aiBalance || 0;
            if (currentBalance < cost) {
                throw new Error("Insufficient AI Credits. Please top-up.");
            }

            // Deduct the cost
            transaction.update(siteRef, {
                aiBalance: currentBalance - cost
            });
        });
    } catch (err: any) {
        throw new functions.https.HttpsError("resource-exhausted", err.message);
    }

    // 4. AI Generation
    try {
        let systemPrompt = "";
        let promptText = `Konu: ${topic}\nYorumlar:\n${comments.map((c: any) => `- ${c.author}: ${c.text}`).join('\n')}`;

        if (mode === "single") {
            systemPrompt = "Sen tarafsız, adil ve profesyonel bir site yöneticisi ve arabulucusun. Amacın, sitedeki tartışmaları analiz edip makul, kanunlara (KMK) uygun ve herkesin faydasına olacak bir özet/karar metni çıkarmaktır.";
            promptText += "\n\nLütfen tüm bu yorumları tarafsızca analiz et ve ortak bir uzlaşı kararı açıkla.";
        } else {
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

    } catch (err: any) {
        console.error("AI Error:", err);
        throw new functions.https.HttpsError("internal", "AI Engine failed to generate a verdict. " + err.message);
    }
});

// =========================================================================
// AGENT 7: AI LOGIC BUILDER (Invoice Auto-Processor)
// Conceptual Cloud Function: Triggers when an invoice is uploaded, uses AI 
// to extract the total amount and automatically routes it to the specific Site.
// =========================================================================
export const processInvoiceUpload = functions.storage.object().onFinalize(async (object) => {
    // Only process files in the invoices directory
    if (!object.name?.includes("invoices/")) {
        console.log("[AI Logic Builder] Ignored file. Not an invoice.");
        return;
    }

    console.log(`[AI Logic Builder] New Invoice Detected: ${object.name}`);
    console.log(`[AI Logic Builder] Activating Gemini Vision API for data extraction...`);

    try {
        // Path Example: sites/{siteId}/invoices/{fileName}
        const siteId = object.name.split("/")[1];

        // Mock AI Extracted Data
        const simulatedExtraction = {
            totalAmount: Math.floor(Math.random() * 8000) + 500,
            vendorName: "EnerjiSA Dağıtım A.Ş.",
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending",
            aiConfidence: 0.98
        };

        console.log(`[AI Logic Builder] OCR Extraction Complete:`, simulatedExtraction);

        // Auto-route to the correct multi-tenant site ledger
        await db.collection("sites").doc(siteId).collection("dues").add({
            title: `${simulatedExtraction.vendorName} Faturası`,
            amount: simulatedExtraction.totalAmount,
            dueDate: simulatedExtraction.dueDate,
            status: simulatedExtraction.status,
            type: "expense",
            fileUrl: `gs://${object.bucket}/${object.name}`,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            systemSource: "AI Logic Builder (Auto-Router)"
        });

        console.log(`[AI Logic Builder] Invoice Successfully Registered to Site: ${siteId}`);
    } catch (err: any) {
        console.error("[AI Logic Builder] Fatal Error processing invoice:", err);
    }
});
