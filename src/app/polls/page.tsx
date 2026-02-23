"use client";

import { useSite } from "@/components/providers/SiteProvider";
import { PieChart, CheckCircle2, Clock, BarChart3, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function PollsPage() {
    const { activeSite } = useSite();
    const [votedPolls, setVotedPolls] = useState<number[]>([]);

    const POLLS = [
        {
            id: 1,
            title: "Dış Cephe Mantolama Rengi Seçimi",
            description: "Yönetim kurulumuzun aldığı karar gereği yapılacak olan dış cephe boyama işleminde hangi renk paletini tercih edersiniz?",
            endDate: "15 Haziran 2026",
            totalVotes: 142,
            status: "active",
            options: [
                { id: "opt1", text: "Antrasit Gri & Beyaz", votes: 85 },
                { id: "opt2", text: "Toprak Tonları (Krem & Kahve)", votes: 42 },
                { id: "opt3", text: "Mevcut Rengin Aynısı", votes: 15 }
            ]
        },
        {
            id: 2,
            title: "Açık Havuz Kullanım Saatleri",
            description: "Yaz dönemi boyunca sabah erken yüzmek isteyen komşularımızdan gelen talep üzerine havuz açılış saatinin öne çekilmesini oyluyoruz.",
            endDate: "20 Haziran 2026",
            totalVotes: 89,
            status: "active",
            options: [
                { id: "opt1", text: "08:00 - 22:00 (Mevcut)", votes: 30 },
                { id: "opt2", text: "07:00 - 22:00 (Erken Açılış)", votes: 59 }
            ]
        },
        {
            id: 3,
            title: "Çocuk Parkı Zemin Yenilemesi",
            description: "Çocuk parkımızın kauçuk zemin kaplamasının yenilenmesi projesinin onayına sunulmuştur.",
            endDate: "1 Mayıs 2026",
            totalVotes: 210,
            status: "completed",
            options: [
                { id: "opt1", text: "Kabul Edilsin (Bütçe: 45.000 TL)", votes: 180 },
                { id: "opt2", text: "Reddedilsin / Ertelensin", votes: 30 }
            ]
        }
    ];

    const handleVote = (pollId: number) => {
        if (!votedPolls.includes(pollId)) {
            setVotedPolls([...votedPolls, pollId]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-bold text-xs mb-4">
                            <PieChart className="w-4 h-4" />
                            Katılımcı Yönetim
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Anketler & Oylama</h1>
                        <p className="text-gray-500 mt-2 font-medium max-w-xl leading-relaxed">
                            {activeSite?.name || 'Siteniz'} içindeki önemli kararlara ortak olun, fikirlerinizi belirterek yaşam alanınıza yön verin.
                        </p>
                    </div>
                </div>
            </div>

            {/* Polls List */}
            <div className="space-y-6">
                {POLLS.map(poll => {
                    const isVoted = votedPolls.includes(poll.id) || poll.status === 'completed';
                    const maxVotes = Math.max(...poll.options.map(o => o.votes));

                    return (
                        <div key={poll.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden group">

                            {/* Status Badge */}
                            <div className="absolute top-6 right-6 flex items-center gap-2">
                                {poll.status === 'active' ? (
                                    <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                                        <Clock className="w-3.5 h-3.5" /> Devam Ediyor
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Sonuçlandı
                                    </span>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3 pr-24">{poll.title}</h3>
                            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed max-w-2xl">{poll.description}</p>

                            <div className="space-y-3 mb-6">
                                {poll.options.map((option, idx) => {
                                    // Calculate percentage for visual bar (mock)
                                    const percentage = Math.round((option.votes / poll.totalVotes) * 100);
                                    const isWinner = isVoted && option.votes === maxVotes;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleVote(poll.id)}
                                            disabled={isVoted}
                                            className={`w-full relative overflow-hidden flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left
                                                ${!isVoted ? 'hover:border-violet-400 bg-gray-50 border-transparent cursor-pointer' :
                                                    isWinner ? 'bg-violet-50 border-violet-200' : 'bg-gray-50 border-transparent opacity-70'}
                                            `}
                                        >
                                            {/* Results Bar (Only visible if voted or completed) */}
                                            {isVoted && (
                                                <div
                                                    className={`absolute inset-y-0 left-0 ${isWinner ? 'bg-violet-100/50' : 'bg-gray-200/50'} z-0 transition-all duration-1000 ease-out`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            )}

                                            <div className="relative z-10 flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 
                                                    ${isVoted ? (isWinner ? 'border-violet-500 bg-violet-500 text-white' : 'border-gray-300 bg-gray-200 text-gray-400') : 'border-gray-300'}
                                                `}>
                                                    {isVoted && <CheckCircle2 className="w-4 h-4" />}
                                                </div>
                                                <span className={`font-bold ${isVoted && isWinner ? 'text-violet-900' : 'text-gray-700'}`}>
                                                    {option.text}
                                                </span>
                                            </div>

                                            {isVoted && (
                                                <div className="relative z-10 font-bold text-sm text-gray-500">
                                                    {percentage}% <span className="text-xs font-medium opacity-60">({option.votes} oy)</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-400 font-bold">
                                <div className="flex items-center gap-1.5">
                                    <BarChart3 className="w-4 h-4" /> Toplam {poll.totalVotes + (votedPolls.includes(poll.id) ? 1 : 0)} Oy Kullanıldı
                                </div>
                                <div>
                                    Son Tarih: {poll.endDate}
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

        </div>
    );
}
