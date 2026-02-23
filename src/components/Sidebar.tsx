"use client";

import Link from "next/link";
import { Users, Megaphone, Receipt, Settings as SettingsIcon, Wrench, Store, PieChart, ShieldAlert, BarChart3, QrCode, Scale, Home } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";

export default function Sidebar() {
    const { hasFeature, activeSite, currentUser } = useSite();

    const allLinks = [
        { href: "/dashboard", icon: Home, label: "Özet Panosu" },
        { href: "/directory", icon: Users, label: "Site Sakinleri" },
        { href: "/arbitration", icon: Scale, label: "AI Uzlaşı Konseyi", badge: "Yeni" },
        { href: "/guestpass", icon: QrCode, label: "Misafir & Kargo", featureId: "guestpass" },
        { href: "/finances", icon: BarChart3, label: "Finansal Şeffaflık", badge: "Yeni", featureId: "finances" },
        { href: "/announcements", icon: Megaphone, label: "Duyurular", featureId: "announcements" },
        { href: "/helpdesk", icon: Wrench, label: "Talep & Arıza (Helpdesk)", featureId: "helpdesk" },
        { href: "/marketplace", icon: Store, label: "Komşuluk Ağı (2. El)", featureId: "marketplace" },
        { href: "/polls", icon: PieChart, label: "Anketler & Oylama", featureId: "polls" },
        { href: "/dues", icon: Receipt, label: "Aidat & Ödemeler" },
        { href: "/settings", icon: SettingsIcon, label: "Ayarlar & Gizlilik" },
        { href: "/admin", icon: ShieldAlert, label: "Yönetici Paneli", adminOnly: true },
        { href: "/master-admin", icon: ShieldAlert, label: "Olympos Core", superAdminOnly: true },
        { href: "/staff", icon: Wrench, label: "Saha Görevleri", staffOnly: true },
    ];

    const links = allLinks.filter(link => {
        // Enforce Feature Toggles
        if (link.featureId && !hasFeature(link.featureId)) return false;

        // Enforce Super Admin Only Links
        if (link.superAdminOnly) {
            return currentUser?.role === "super_admin";
        }

        // Enforce Admin/Manager Only Links
        if (link.adminOnly) {
            return ["admin", "manager", "super_admin"].includes(currentUser?.role);
        }

        // Enforce Staff Only Links
        if (link.staffOnly) {
            return currentUser?.role === "staff";
        }

        // If user is Staff, they ONLY see staffOnly links. They shouldn't see general links.
        if (currentUser?.role === "staff" && !link.staffOnly) {
            return false;
        }

        // If not restricted by role or feature, allow it
        return true;
    });

    const shortcuts = [
        { href: "#", label: "A Blok Grubu" },
        { href: "#", label: "Site Yönetimi" },
        { href: "#", label: "Havuz & Spor Salonu" },
    ];

    return (
        <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-[280px] overflow-y-auto hidden lg:block hover:bg-transparent">
            <div className="p-4 flex flex-col gap-1">

                {/* Active Site Indicator */}
                <Link href="/select-site" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 transition-colors group">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                        {activeSite?.logo || "S"}
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="font-bold text-sm text-gray-900 truncate">{activeSite?.name || "Site Seçilmedi"}</h2>
                        <p className="text-xs text-gray-500 truncate group-hover:text-indigo-600">Değiştirmek İçin Tıklayın</p>
                    </div>
                </Link>

                <div className="my-2 border-t border-gray-300/50" />

                {/* Main Links */}
                {links.map((link) => (
                    <Link key={link.href} href={link.href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <link.icon className="w-7 h-7 text-blue-500 bg-gray-100 p-1 rounded-full" />
                        <span className="font-medium text-[15px]">{link.label}</span>
                    </Link>
                ))}

                {/* Shortcuts */}
                <div className="mt-4 border-t border-gray-300/50 pt-4">
                    <h3 className="text-gray-500 font-semibold px-2 mb-2 text-[17px]">Kısayollarınız</h3>
                    {shortcuts.map((shortcut) => (
                        <Link key={shortcut.label} href={shortcut.href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg as-icon" />
                            <span className="font-medium text-sm text-gray-700">{shortcut.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </aside>
    );
}
