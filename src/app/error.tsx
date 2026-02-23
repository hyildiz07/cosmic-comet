"use client";

import { useEffect } from "react";
import { RefreshCcw, ShieldAlert, Home } from "lucide-react";

export default function ErrorBoundaryComponent({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Caught by Error Sentinel:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center p-8 lg:p-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-lg w-full text-center relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Sayfa Yüklenemedi</h2>
                    <p className="text-gray-500 mb-6 font-medium text-sm leading-relaxed">
                        Bu modülü yüklerken geçici bir sorun oluştu (Loop Protection). Lütfen sayfayı yenileyerek tekrar deneyin.
                    </p>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-left mb-8 flex items-start gap-3 overflow-hidden">
                        <div className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                        <p className="text-xs font-mono text-gray-600 truncate flex-1">{error.message || "Render Error"}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => reset()}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" /> Modülü Yenile
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" /> Özet Panosu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
