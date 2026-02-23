"use client";

import { LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSite } from "@/components/providers/SiteProvider";

export function SignIn() {
    const router = useRouter();
    return (
        <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
            <LogIn className="w-4 h-4" />
            Giriş Yap
        </button>
    );
}

export function SignOut() {
    const router = useRouter();
    const { setCurrentUser } = useSite();

    return (
        <button
            onClick={() => {
                setCurrentUser(null);
                router.push("/login");
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
        >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
        </button>
    );
}
