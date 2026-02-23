"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Receipt, FileText, Download, ShieldCheck, TrendingUp, Info } from "lucide-react";

// Mock Expense Data
const expenseData = [
    { name: "SGK ve Personel Maaşları", value: 85000, color: "#4f46e5" }, // Indigo
    { name: "Elektrik, Su, Doğalgaz", value: 24000, color: "#06b6d4" }, // Cyan
    { name: "Peyzaj ve Bahçe Bakımı", value: 12000, color: "#10b981" }, // Emerald
    { name: "Asansör ve Teknik Bakım", value: 8000, color: "#f59e0b" },  // Amber
    { name: "Temizlik Malzemeleri", value: 5000, color: "#ec4899" },   // Pink
    { name: "Sarf ve Diğer", value: 3500, color: "#64748b" }            // Slate
];

const totalExpense = expenseData.reduce((acc, curr) => acc + curr.value, 0);

// Custom Tooltip for Pie Chart
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                <p className="font-semibold text-gray-800">{payload[0].name}</p>
                <p className="text-indigo-600 font-bold mt-1">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(payload[0].value)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    Toplam Bütçenin: %{((payload[0].value / totalExpense) * 100).toFixed(1)}
                </p>
            </div>
        );
    }
    return null;
};

// Mock Invoices
const invoices = [
    { id: "INV-2023-0045", vendor: "Yıldız Asansör Bakım A.Ş.", amount: 8000, date: "12 Mayıs 2026", status: "Ödendi", category: "Teknik Servis" },
    { id: "INV-2023-0046", vendor: "EnerjiSA Dağıtım", amount: 15400, date: "10 Mayıs 2026", status: "Ödendi", category: "Faturalar" },
    { id: "INV-2023-0047", vendor: "YeşilDoğa Peyzaj Ltd.", amount: 6000, date: "08 Mayıs 2026", status: "Ödendi", category: "Bahçe Bakım" }
];

export default function FinancesPage() {
    const [selectedMonth, setSelectedMonth] = useState("Mayıs 2026");

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                        Açık Bütçe ve Şeffaflık
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Sitenizin güncel finansal durumunu ve harcama detaylarını inceleyin.</p>
                </div>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-2 cursor-pointer outline-none"
                >
                    <option>Mayıs 2026</option>
                    <option>Nisan 2026</option>
                    <option>Mart 2026</option>
                </select>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-gray-500 font-medium text-sm">Toplanan Aidat</span>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-gray-900">₺145.200</p>
                    <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                        <span>+2%</span> <span className="text-gray-400">geçen aya göre</span>
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-gray-500 font-medium text-sm">Gerçekleşen Gider</span>
                        <Receipt className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold mt-2 text-gray-900">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(totalExpense)}
                    </p>
                    <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
                        <span>+5%</span> <span className="text-gray-400">mevsimsel artış</span>
                    </p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400 rounded-xl p-5 shadow-sm text-white">
                    <div className="flex justify-between items-start">
                        <span className="text-white/80 font-medium text-sm">Kasa Bakiyesi</span>
                        <ShieldCheck className="w-5 h-5 text-green-300" />
                    </div>
                    <p className="text-2xl font-bold mt-2">₺32.850</p>
                    <p className="text-xs text-white/80 mt-2 font-medium">Acil Durum Fonu Dahil</p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    Gider Dağılımı ({selectedMonth})
                </h2>

                <div className="flex flex-col md:flex-row items-center gap-8 min-h-[300px]">
                    {/* Chart */}
                    <div className="w-full md:w-1/2 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    dataKey="value"
                                    paddingAngle={5}
                                    stroke="none"
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="w-full md:w-1/2 flex flex-col gap-3">
                        {expenseData.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-gray-900">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(item.value)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        Apsiyon sistemine göre en büyük gider kalemimiz %{((expenseData[0].value / totalExpense) * 100).toFixed(0)} ile personel giderleridir. Yaz aylarında bahçe bakım maliyetlerinin artması öngörülmektedir.
                    </p>
                </div>
            </div>

            {/* Scanned Invoices List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        Son Taranan Faturalar
                    </h2>
                    <button className="text-sm text-indigo-600 font-medium hover:underline">Tümünü Gör</button>
                </div>

                <div className="divide-y divide-gray-100">
                    {invoices.map((invoice, i) => (
                        <div key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{invoice.vendor}</h3>
                                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                        <span>{invoice.date}</span>
                                        <span>•</span>
                                        <span>{invoice.category}</span>
                                        <span>•</span>
                                        <span className="hidden sm:inline">{invoice.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3 border-t sm:border-0 pt-3 sm:pt-0">
                                <div className="text-left sm:text-right">
                                    <p className="font-bold text-gray-900">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(invoice.amount)}
                                    </p>
                                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded mt-1">
                                        {invoice.status}
                                    </span>
                                </div>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 shadow-sm rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">PDF</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
