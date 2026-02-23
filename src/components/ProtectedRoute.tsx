"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSite } from "@/components/providers/SiteProvider";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireStaff?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false, requireStaff = false }: ProtectedRouteProps) {
    const { currentUser } = useSite();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Skip check on public routes
        if (pathname === "/login" || pathname === "/") {
            setIsChecking(false);
            return;
        }

        if (currentUser === undefined) {
            // Still loading auth state
            return;
        }

        if (currentUser === null) {
            // Not authenticated
            router.push("/login");
        } else if (requireAdmin && currentUser.role !== "admin" && currentUser.role !== "manager") {
            // Authenticated but not an admin/manager trying to access admin route
            router.push("/dashboard");
        } else if (requireStaff && currentUser.role !== "staff") {
            // Authenticated but not a staff trying to access staff route
            router.push("/dashboard");
        } else if (currentUser.role === "staff" && !requireStaff) {
            // Staff trying to access anywhere else, force them to staff page
            if (pathname !== "/staff") {
                router.push("/staff");
            } else {
                setIsChecking(false);
            }
        } else {
            // Authenticated and authorized
            setIsChecking(false);
        }
    }, [currentUser, pathname, requireAdmin, router]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 text-indigo-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="font-medium text-sm">Yetki Kontrolü...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
