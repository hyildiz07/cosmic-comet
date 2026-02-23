"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Site, SiteMembership } from "@/data/mockDB";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type SiteContextType = {
    activeSite: Site | null;
    activeMembership: SiteMembership | null;
    currentUser: any | null;
    setActiveSiteId: (siteId: string) => void;
    setCurrentUser: (user: any | null) => void;
    hasFeature: (feature: string) => boolean;
    isLoading: boolean;
};

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
    const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
    const [activeSite, setActiveSite] = useState<Site | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial ID and User from localStorage
    useEffect(() => {
        const savedSiteId = localStorage.getItem("activeSiteId");
        if (savedSiteId) setActiveSiteId(savedSiteId);

        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
            } catch (e) { }
        }

        if (!savedSiteId) setIsLoading(false);
    }, []);

    // Listen to Firebase whenever activeSiteId changes
    useEffect(() => {
        if (!activeSiteId) {
            setActiveSite(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsubscribe = onSnapshot(doc(db, "sites", activeSiteId), (docSnap) => {
            if (docSnap.exists()) {
                setActiveSite(docSnap.data() as Site);
            } else {
                setActiveSite(null);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching site details:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [activeSiteId]);

    const handleSetSiteId = (id: string) => {
        setActiveSiteId(id);
        localStorage.setItem("activeSiteId", id);
    };

    const handleSetCurrentUser = (user: any) => {
        setCurrentUser(user);
        if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));
        } else {
            localStorage.removeItem("currentUser");
        }
    };

    // We can load membership later using Firebase Auth uid
    const activeMembership = null;

    const hasFeature = (feature: string) => {
        if (!activeSite) return true; // Show all by default if no site selected (e.g. for preview)
        return activeSite.features.includes(feature as any);
    };

    return (
        <SiteContext.Provider value={{
            activeSite,
            activeMembership,
            currentUser,
            setActiveSiteId: handleSetSiteId,
            setCurrentUser: handleSetCurrentUser,
            hasFeature,
            isLoading
        }}>
            {children}
        </SiteContext.Provider>
    );
}

export function useSite() {
    const context = useContext(SiteContext);
    if (context === undefined) {
        throw new Error("useSite must be used within a SiteProvider");
    }
    return context;
}
