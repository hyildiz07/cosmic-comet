export type SiteFeature =
    | "polls"
    | "marketplace"
    | "helpdesk"
    | "finances"
    | "guestpass"
    | "announcements";

export interface Site {
    id: string;
    name: string;
    address: string;
    features: SiteFeature[];
    logo: string | null;
    aiBalance: number;
}

export interface User {
    id: string;
    phone: string;
    name: string;
    avatarUrl?: string;
}

export interface SiteMembership {
    id: string;
    userId: string;
    siteId: string;
    role: "resident" | "manager" | "staff";
    block?: string;
    flat?: string;
    status: "active" | "pending";
}
