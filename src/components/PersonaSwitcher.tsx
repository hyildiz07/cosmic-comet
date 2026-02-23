"use client";

import { useState, useEffect } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { useRouter, usePathname } from "next/navigation";
import { UserCog, Crown, Briefcase, Home, Wrench, X } from "lucide-react";

export default function PersonaSwitcher() {
    const { currentUser, setCurrentUser } = useSite();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Only show if the user is logged in with the Master Bypass number
    useEffect(() => {
        if (currentUser?.phone === "+905070835122" || currentUser?.phone === "+905555555555") {
            setIsVisible(true);
        } else {
            setIsVisible(false);
            setIsOpen(false);
        }
    }, [currentUser]);

    if (!isVisible) return null;

    const switchRole = (role: string) => {
        const newName = role === "super_admin" ? "Master Architect" :
            role === "manager" ? "LILIUM PRO" :
                role === "resident" ? "LILIUM KOMŞU" :
                    "LILIUM STAFF";

        // Update global context instantly
        setCurrentUser({
            ...currentUser,
            role: role,
            name: newName
        });

        // Route instantly based on new persona
        if (role === "super_admin") router.push("/master-admin");
        else if (role === "manager" || role === "admin") router.push("/admin");
        else if (role === "staff") router.push("/staff");
        else router.push("/dashboard");

        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">

            {/* The Floating Menu */}
            {isOpen && (
                <div className="mb-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-2 w-56 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="flex justify-between items-center px-3 py-2 border-b border-gray-700/50 mb-2">
                        <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Kozmik Geçiş</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => switchRole('super_admin')}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentUser?.role === 'super_admin' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <Crown className="w-4 h-4" /> ELIFA (Owner)
                        </button>
                        <button
                            onClick={() => switchRole('manager')}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentUser?.role === 'manager' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <Briefcase className="w-4 h-4" /> LILIUM PRO
                        </button>
                        <button
                            onClick={() => switchRole('resident')}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentUser?.role === 'resident' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <Home className="w-4 h-4" /> LILIUM KOMŞU
                        </button>
                        <button
                            onClick={() => switchRole('staff')}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentUser?.role === 'staff' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <Wrench className="w-4 h-4" /> LILIUM STAFF
                        </button>
                    </div>
                </div>
            )}

            {/* The Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:scale-110 active:scale-95 border-2 border-indigo-400/50"
            >
                <UserCog className="w-6 h-6" />
            </button>
        </div>
    );
}
