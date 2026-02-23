"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, ShieldAlert } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Caught by Error Sentinel:", error);
    }, [error]);

    return (
        <html lang="tr">
            <body>
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Sistem Koruması Devrede</h2>
                        <p className="text-gray-500 mb-6 font-medium text-sm">
                            Sistem Bekçisi (Error Sentinel) uygulamanın kilitlenmesini engelledi. İstemci tarafında ölümcül bir hata (Fatal Error) tespit edildi.
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg text-left mb-6 overflow-hidden">
                            <p className="text-xs font-mono text-red-500 truncate">{error.message || "Bilinmeyen Hata"}</p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-3"
                        >
                            <RefreshCcw className="w-5 h-5" /> Sayfayı Yenile (Hard Reset)
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem("currentUser");
                                localStorage.removeItem("activeSiteId");
                                window.location.href = '/login';
                            }}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-all"
                        >
                            Önbelleği Temizle ve Ana Sayfaya Dön
                        </button>
                        <div className="mt-6 flex justify-center items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <span>Olympos Core</span> <span>•</span> <span>Loop Protection Active</span>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
