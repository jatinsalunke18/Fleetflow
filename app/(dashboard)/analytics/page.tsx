"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, DollarSign, Fuel, Award, FileDown, Truck } from "lucide-react"

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'vehicles'>('overview')

    useEffect(() => {
        fetch('/api/analytics').then(r => r.json()).then(d => { setData(d); setLoading(false) })
    }, [])

    const exportCSV = () => {
        if (!data?.vehicleStats?.length) return alert("No data to export.")
        const headers = ["ID,Name,License Plate,Status,Odometer,Fuel Cost,Maintenance Cost,Total Cost,Total Trips,Fuel Efficiency"]
        const rows = data.vehicleStats.map((v: any) =>
            [v.id, v.name, v.licensePlate, v.status, v.odometer,
            v.totalFuelCost.toFixed(2), v.totalMaintenanceCost.toFixed(2), v.totalOperationalCost.toFixed(2),
            v.totalTrips, v.fuelEfficiency ?? 'N/A'].join(',')
        )
        const csv = [...headers, ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `fleetflow_report_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return (
        <div className="flex flex-col gap-4">
            <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
        </div>
    )

    const s = data?.summary || {}
    const monthly = data?.monthlyData || []
    const vehicleStats = data?.vehicleStats || []

    const maxCost = Math.max(...monthly.map((m: any) => m.cost), 1)
    const maxTrips = Math.max(...monthly.map((m: any) => m.trips), 1)

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                        Analytics & Reports
                    </h2>
                    <p className="text-gray-400 mt-1">Financial performance, fuel efficiency, and fleet ROI insights.</p>
                </div>
                <button onClick={exportCSV}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2">
                    <FileDown className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                    { label: "Fleet Utilization", value: `${s.utilizationRate}%`, sub: `${s.activeVehicles} of ${s.totalVehicles} active`, icon: Truck, color: "#6366f1" },
                    { label: "Total Operational Cost", value: `$${(s.totalOperationalCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: `Fuel: $${(s.totalFuelCost || 0).toFixed(0)} + Maintenance: $${(s.totalMaintenanceCost || 0).toFixed(0)}`, icon: DollarSign, color: "#ef4444" },
                    { label: "Trips Completed", value: s.completedTrips ?? 0, sub: `${s.totalTrips ?? 0} total trips dispatched`, icon: Award, color: "#10b981" },
                    { label: "Fuel Expenditure", value: `$${(s.totalFuelCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: "Total fuel cost across fleet", icon: Fuel, color: "#f59e0b" },
                ].map((item, i) => (
                    <div key={i} className="relative bg-[#09090b] border border-white/5 p-5 rounded-2xl overflow-hidden group hover:bg-white/[0.03] transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none transition-all" style={{ backgroundColor: item.color + '15' }} />
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: item.color + '20', color: item.color }}>
                                <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{item.value}</p>
                        <p className="text-[10px] text-gray-500 mt-1 truncate">{item.sub}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Monthly Cost Bar Chart */}
                <div className="bg-[#09090b] border border-white/5 p-6 rounded-3xl shadow-xl">
                    <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-400" />
                        Monthly Operational Cost
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">Fuel + Maintenance spend per month (last 6 months)</p>
                    <div className="flex items-end gap-3 h-40">
                        {monthly.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">No data yet</div>
                        ) : monthly.map((m: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                                <div className="relative w-full flex justify-center">
                                    <div
                                        className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all group-hover:from-indigo-500 group-hover:to-indigo-300"
                                        style={{ height: `${Math.max((m.cost / maxCost) * 130, 4)}px` }}
                                    />
                                    {m.cost > 0 && (
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 pointer-events-none backdrop-blur-sm">
                                            ${m.cost.toFixed(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] text-gray-500 font-medium">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Trip Count Chart */}
                <div className="bg-[#09090b] border border-white/5 p-6 rounded-3xl shadow-xl">
                    <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Monthly Trip Volume
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">Total trips dispatched per month (last 6 months)</p>
                    <div className="flex items-end gap-3 h-40">
                        {monthly.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">No data yet</div>
                        ) : monthly.map((m: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                                <div className="relative w-full flex justify-center">
                                    <div
                                        className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all group-hover:from-emerald-500 group-hover:to-emerald-300"
                                        style={{ height: `${Math.max((m.trips / maxTrips) * 130, 4)}px` }}
                                    />
                                    {m.trips > 0 && (
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 pointer-events-none backdrop-blur-sm">
                                            {m.trips} trip{m.trips !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] text-gray-500 font-medium">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Per-Vehicle Breakdown Table */}
            <div className="bg-[#09090b] border border-white/5 rounded-3xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold">Per-Vehicle Cost Breakdown</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Fuel efficiency, operational costs, and trip records per asset</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500 bg-white/5">
                                <th className="px-6 py-4 font-semibold">Unit</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Fuel Cost</th>
                                <th className="px-6 py-4 font-semibold text-right">Maint. Cost</th>
                                <th className="px-6 py-4 font-semibold text-right">Total Cost</th>
                                <th className="px-6 py-4 font-semibold text-center">Trips</th>
                                <th className="px-6 py-4 font-semibold text-right">Fuel Efficiency</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {vehicleStats.length === 0 ? (
                                <tr><td colSpan={7} className="py-12 text-center text-gray-500">No vehicle data found. Add vehicles to see analytics.</td></tr>
                            ) : vehicleStats.map((v: any) => (
                                <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{v.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{v.licensePlate}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${v.status === 'AVAILABLE' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                                v.status === 'ON_TRIP' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                                    v.status === 'IN_SHOP' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                                        'text-gray-400 border-gray-500/30 bg-white/5'
                                            }`}>{v.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-amber-400">${v.totalFuelCost.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-red-400">${v.totalMaintenanceCost.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right font-bold font-mono text-white">${v.totalOperationalCost.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold">
                                            {v.completedTrips}/{v.totalTrips}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {v.fuelEfficiency ? (
                                            <span className="font-mono text-emerald-400 font-bold">{v.fuelEfficiency} km/L</span>
                                        ) : (
                                            <span className="text-xs text-gray-600">No fuel logs</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {vehicleStats.length > 0 && (
                                <tr className="bg-white/[0.03] border-t border-white/10 font-bold">
                                    <td className="px-6 py-4 text-gray-300">Fleet Total</td>
                                    <td className="px-6 py-4" />
                                    <td className="px-6 py-4 text-right font-mono text-amber-400">
                                        ${vehicleStats.reduce((a: number, v: any) => a + v.totalFuelCost, 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-red-400">
                                        ${vehicleStats.reduce((a: number, v: any) => a + v.totalMaintenanceCost, 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-white text-base">
                                        ${vehicleStats.reduce((a: number, v: any) => a + v.totalOperationalCost, 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-white">
                                        {vehicleStats.reduce((a: number, v: any) => a + v.totalTrips, 0)} total
                                    </td>
                                    <td className="px-6 py-4" />
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
