"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { fetchEnvironmentalIntelligence, EnvironmentalData } from "@/lib/environmental";
import { Zap, Droplets, Wifi, Cone, HeartPulse, Stethoscope, Store, Calendar, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const { activeSite, currentUser } = useSite();
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeSite?.id) {
      setLoading(true);
      fetchEnvironmentalIntelligence(activeSite.name || "Site", activeSite.id).then(data => {
        setEnvData(data);
        setLoading(false);
      });
    }
  }, [activeSite?.id, activeSite?.name]);

  const renderInfraCard = (title: string, data: any, icon: any, colorClass: string, isAlert: boolean) => {
    return (
      <div className={`p-4 rounded-2xl flex gap-3 ${isAlert ? 'bg-red-50 border border-red-100' : 'bg-white border border-gray-100 shadow-sm'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{title}</h4>
          <p className={`text-xs mt-0.5 ${isAlert ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{data?.details || "Kontrol ediliyor..."}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse text-cyan-600">
        <HeartPulse className="w-12 h-12 mb-4 animate-bounce" />
        <p className="font-bold tracking-widest text-sm uppercase">Yerel Bağlantılar Kuruluyor...</p>
      </div>
    );
  }

  // LILIUM KOMŞU specific view
  if (currentUser?.role !== "resident") {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-2xl font-black text-gray-900">Yönetim Paneli'ne Geçin</h2>
        <p className="text-gray-500 mt-2">Bu ekran 'Lilium Komşu' (Sakinler) içindir. Lütfen sol menüden kendi yetki alanınıza gidin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">

      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 font-bold text-xs mb-4 backdrop-blur-md border border-white/20">
              <HeartPulse className="w-4 h-4" />
              Lilium Komşu Asistanı Devrede
            </div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Merhaba, {currentUser?.name || "Komşu"} 👋
            </h1>
            <p className="text-cyan-100 mt-2 font-medium max-w-xl leading-relaxed">
              Mahallenizde ve sitemizde bugün neler oluyor? Sizin için derledik.
            </p>
          </div>
          {envData?.infrastructure.electricity.status === 'outage' && (
            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 px-4 py-3 rounded-2xl flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-red-200" />
              <div>
                <p className="text-xs font-bold text-red-200 uppercase tracking-wider">Acil Bildirim</p>
                <p className="text-sm font-medium text-white">Bölgesel Elektrik Kesintisi Aktif</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Infrastructure Watcher */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-900 px-1 border-b pb-2">Altyapı Durumu (Canlı)</h3>
          <div className="grid grid-cols-1 gap-3">
            {renderInfraCard("Elektrik", envData?.infrastructure.electricity, <Zap className="w-5 h-5" />, envData?.infrastructure.electricity.status === 'outage' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600', envData?.infrastructure.electricity.status === 'outage')}
            {renderInfraCard("Su", envData?.infrastructure.water, <Droplets className="w-5 h-5" />, envData?.infrastructure.water.status === 'outage' ? 'bg-red-100 text-red-600' : 'bg-cyan-100 text-cyan-600', envData?.infrastructure.water.status === 'outage')}
            {renderInfraCard("Yol & Trafik", envData?.infrastructure.roads, <Cone className="w-5 h-5" />, envData?.infrastructure.roads.status === 'construction' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600', false)}
          </div>
        </div>

        {/* Local Pulse */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-900 px-1 border-b pb-2">Mahallenin Nabzı</h3>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-emerald-700 font-bold">
              <Stethoscope className="w-5 h-5" />
              Nöbetçi Eczaneler
            </div>
            <div className="divide-y divide-gray-50">
              {envData?.localPulse.pharmacies.filter(p => p.isOpen).map((pharma, idx) => (
                <div key={idx} className="p-3 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{pharma.name}</p>
                    <p className="text-xs text-gray-500">{pharma.address}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">{pharma.distance}</span>
                </div>
              ))}
              {(!envData?.localPulse.pharmacies || envData.localPulse.pharmacies.length === 0) && (
                <div className="p-3 text-sm text-gray-500">Yakında nöbetçi eczane bulunamadı.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
            <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center gap-2 text-purple-700 font-bold">
              <Calendar className="w-5 h-5" />
              Yaklaşan Etkinlikler
            </div>
            <div className="divide-y divide-gray-50">
              {envData?.localPulse.events.map((evt, idx) => (
                <div key={idx} className="p-3 hover:bg-gray-50">
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{evt.title}</p>
                  <div className="flex gap-2 text-[11px] text-gray-500 mt-1 font-medium">
                    <span>{evt.date}</span> • <span>{evt.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
