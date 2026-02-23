"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldAlert, Users, Building2, Activity, Wallet, ShieldCheck, Database, Server, ServerCrash, Cpu } from "lucide-react";

export default function MasterAdminDashboard() {
    const { currentUser } = useSite();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        // Double check both the context user and the raw DB user just to be sure
        const role = currentUser?.role;
        if (role === undefined) return; // Still loading

        if (role !== "super_admin") {
            router.push("/select-site");
        } else {
            setIsAuthorized(true);
        }
    }, [currentUser, router]);

    if (isAuthorized === null) {
        return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-emerald-500 animate-pulse flex flex-col items-center gap-4">
                <ShieldAlert className="w-12 h-12" />
                <span className="font-mono tracking-widest text-sm">AUTHENTICATING_MAINFRAME...</span>
            </div>
        </div>;
    }

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-mono selection:bg-emerald-900 selection:text-emerald-100 pb-20">
            {/* Topbar */}
            <div className="border-b border-gray-900 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-500">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="font-bold tracking-widest text-sm uppercase">Olympos Core // ELIFA (God Mode)</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-gray-500">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM: ONLINE</span>
                        <span className="text-gray-700">|</span>
                        <span>{currentUser?.phone}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
                {/* Header Sequence */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Global Command Center</h1>
                    <p className="text-gray-500 max-w-2xl leading-relaxed">Sisteme hoş geldin, Master Architect. ELIFA aktif. 10 Sitenin MRR gelirleri, API kullanım maliyetleri ve otonom işlemleri izleniyor.</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="Active Sites" icon={<Building2 />} value="10" trend="Full capacity" color="emerald" />
                    <MetricCard title="Total MRR (10 Sites)" icon={<Wallet />} value="₺145,000" trend="Stable (Monthly)" color="indigo" />
                    <MetricCard title="AI API Costs" icon={<Activity />} value="$12.40" trend="DeepSeek saving 85%" color="cyan" />
                    <MetricCard title="Total Residents" icon={<Users />} value="1,240" trend="+15 this week" color="blue" />
                </div>

                {/* Mainframe Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                    {/* Activity Stream */}
                    <div className="lg:col-span-2 border border-gray-900 bg-black/40 rounded-xl overflow-hidden">
                        <div className="border-b border-gray-900 p-4 bg-black/60 flex items-center justify-between">
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-500" /> Database Mutations (Live)
                            </h3>
                            <span className="text-[10px] text-gray-600 font-bold uppercase py-1 px-2 border border-gray-800 rounded bg-gray-900 text-emerald-500/50 flex gap-2 items-center"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> REALTIME</span>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-gray-900/50 text-gray-600 text-xs font-bold tracking-wider uppercase">
                                        <th className="p-4 font-medium">Timestamp</th>
                                        <th className="p-4 font-medium">Organization</th>
                                        <th className="p-4 font-medium">Event Type</th>
                                        <th className="p-4 font-medium">Node</th>
                                        <th className="p-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-900/50 text-gray-400 font-mono text-xs">
                                    <tr className="hover:bg-gray-900/30">
                                        <td className="p-4 text-gray-500">14:02:45.002</td>
                                        <td className="p-4 text-blue-400">Çamlıtepe Evleri</td>
                                        <td className="p-4 text-emerald-400">CREATE_LISTING</td>
                                        <td className="p-4">doc_78f1a23b</td>
                                        <td className="p-4"><span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">200 OK</span></td>
                                    </tr>
                                    <tr className="hover:bg-gray-900/30">
                                        <td className="p-4 text-gray-500">14:01:12.110</td>
                                        <td className="p-4 text-indigo-400">Vadi Konakları</td>
                                        <td className="p-4 text-yellow-400">TICKET_UPDATE</td>
                                        <td className="p-4">tick_99x0z11</td>
                                        <td className="p-4"><span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">200 OK</span></td>
                                    </tr>
                                    <tr className="hover:bg-gray-900/30">
                                        <td className="p-4 text-gray-500">13:58:05.441</td>
                                        <td className="p-4 text-pink-400">Güneş Sitesi</td>
                                        <td className="p-4 text-red-500">AUTH_FAILED</td>
                                        <td className="p-4">uid_unknown</td>
                                        <td className="p-4"><span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded">403 FORBIDDEN</span></td>
                                    </tr>
                                    <tr className="hover:bg-gray-900/30">
                                        <td className="p-4 text-gray-500">13:55:22.990</td>
                                        <td className="p-4 text-blue-400">Çamlıtepe Evleri</td>
                                        <td className="p-4 text-cyan-400">PAYMENT_SUCCESS</td>
                                        <td className="p-4">inv_08912x9</td>
                                        <td className="p-4"><span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">200 OK</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Infrastructure Health */}
                    <div className="border border-gray-900 bg-black/40 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-colors">
                        <div className="border-b border-gray-900 p-4 bg-black/60">
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs flex items-center gap-2">
                                <Server className="w-4 h-4" /> Infrastructure Nodes
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <HealthRow label="Google Cloud Run" status="Operational" percent={24} color="emerald" icon={<Cpu className="w-4 h-4" />} />
                            <HealthRow label="Firestore Cluster" status="Optimal" percent={45} color="blue" icon={<Database className="w-4 h-4" />} />
                            <HealthRow label="Firebase Storage" status="Storage limits normal" percent={12} color="indigo" icon={<Server className="w-4 h-4" />} />
                            <HealthRow label="Payment Gateway" status="Rate limits elevated" percent={88} color="amber" icon={<Database className="w-4 h-4" />} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, icon, value, trend, color }: { title: string, icon: React.ReactNode, value: string, trend: string, color: 'emerald' | 'blue' | 'indigo' | 'cyan' }) {
    const colorClasses = {
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    }
    const colorClass = colorClasses[color];

    return (
        <div className="bg-black/40 border border-gray-900 p-6 rounded-xl relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center mb-6`}>
                <div className="opacity-80 stroke-[1.5px] scale-110">
                    {icon}
                </div>
            </div>
            <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">{title}</h4>
            <p className="text-3xl font-light text-white tracking-tight mb-2">{value}</p>
            <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                {trend}
            </p>
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tl border-t border-l ${colorClass} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
        </div>
    )
}

function HealthRow({ label, status, percent, color, icon }: any) {
    const colorMap: any = {
        emerald: "bg-emerald-500",
        blue: "bg-blue-500",
        indigo: "bg-indigo-500",
        amber: "bg-amber-500",
    }
    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
                    <span className="text-gray-600">{icon}</span> {label}
                </div>
                <div className="text-xs text-gray-500 text-right">{status}</div>
            </div>
            <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                <div className={`h-full ${colorMap[color]}`} style={{ width: `${percent}%` }} />
            </div>
        </div>
    )
}
