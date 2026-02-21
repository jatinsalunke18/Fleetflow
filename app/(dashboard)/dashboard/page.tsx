"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Truck, AlertTriangle, Activity, Package, Wrench, ExternalLink, RefreshCw, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

function StatCard({ name, value, subtext, icon: Icon, color, trend }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.07] transition-all overflow-hidden cursor-default"
        >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-500"
                style={{ backgroundColor: color + '15' }} />
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl transition-all" style={{ backgroundColor: color + '20', color }}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-emerald-400">{trend}</span>
            </div>
            <h3 className="text-gray-400 font-medium text-sm mb-1">{name}</h3>
            <p className="text-3xl font-bold tracking-tight text-white mb-2">{value}</p>
            <p className="text-xs text-gray-500 font-medium truncate">{subtext}</p>
        </motion.div>
    )
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const userRole = session?.user?.role
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [mounted, setMounted] = useState(false)

    const fetchDashboard = useCallback(async () => {
        setLoading(true)
        const res = await fetch('/api/dashboard')
        if (res.ok) {
            setData(await res.json())
            setLastUpdated(new Date())
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        setMounted(true)
        if (status === "authenticated") {
            fetchDashboard()
            // Auto-refresh every 30 seconds
            const interval = setInterval(fetchDashboard, 30000)
            return () => clearInterval(interval)
        }
    }, [fetchDashboard, status])

    const stats = data ? [
        {
            name: "Active Fleet",
            value: data.stats.activeVehicles,
            subtext: `${data.stats.availableVehicles} Available, ${data.stats.inShopVehicles} In Shop`,
            icon: Truck,
            color: "#6366f1",
            trend: `${data.stats.totalVehicles} Total`
        },
        {
            name: "Maintenance Alerts",
            value: data.stats.inShopVehicles,
            subtext: "Vehicles currently in maintenance shop",
            icon: AlertTriangle,
            color: "#ef4444",
            trend: "Live"
        },
        {
            name: "Utilization Rate",
            value: `${data.stats.utilizationRate}%`,
            subtext: "On-trip vs. total fleet",
            icon: Activity,
            color: "#10b981",
            trend: "Real-time"
        },
        {
            name: "Pending Cargo",
            value: data.stats.pendingTrips,
            subtext: "Draft trips awaiting dispatch",
            icon: Package,
            color: "#f59e0b",
            trend: "Draft"
        },
    ] : []

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">Command Center</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live data
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium tracking-wide">• Last synced {mounted ? lastUpdated.toLocaleTimeString() : "--:--"}</span>
                        <button
                            onClick={fetchDashboard}
                            className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                            title="Manual Sync"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
                        </button>
                    </div>
                </div>
                {(userRole === 'Fleet Manager' || userRole === 'Dispatcher') && (
                    <button
                        onClick={() => window.location.href = '/trips'}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-sm font-bold transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center gap-2 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Dispatch Trip
                    </button>
                )}
            </div>

            {/* KPI Cards */}
            {loading && !data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 animate-pulse h-40" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {stats.map((s, i) => <StatCard key={i} {...s} />)}
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Recent Trips */}
                <div className="xl:col-span-2 bg-[#09090b] border border-white/5 p-6 rounded-3xl shadow-xl shadow-black/50 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            Live Dispatch Tracking
                        </h3>
                        <Link href="/trips" className="text-xs text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1">
                            View all <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="pb-3 font-semibold">Vehicle</th>
                                    <th className="pb-3 font-semibold">Driver</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold text-right">Cargo</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading && !data ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                                                <p className="text-gray-500 font-medium animate-pulse">Initial tracking synchronization...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : !data || data.recentTrips.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">
                                            No trips dispatched yet. <Link href="/trips" className="text-indigo-400 underline">Dispatch now →</Link>
                                        </td>
                                    </tr>
                                ) : data.recentTrips.map((t: any) => (
                                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3.5 font-bold text-white">{t.vehicle?.name || "—"}</td>
                                        <td className="py-3.5 text-gray-300">{t.driver?.name || "—"}</td>
                                        <td className="py-3.5">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold tracking-wide uppercase ${t.status === 'COMPLETED' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' :
                                                t.status === 'DISPATCHED' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse' :
                                                    t.status === 'CANCELLED' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                                        'text-gray-400 border-gray-500/30 bg-white/5'
                                                }`}>{t.status}</span>
                                        </td>
                                        <td className="py-3.5 text-right text-gray-400 font-mono text-xs">{t.cargoWeight} kg</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Maintenance Alerts */}
                <div className="bg-[#09090b] border border-white/5 p-6 rounded-3xl shadow-xl shadow-black/50 relative flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-red-400" />
                            Maintenance Log
                        </h3>
                        <Link href="/maintenance" className="text-xs text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1">
                            View all <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    {loading && !data ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin mx-auto mb-2" />
                                <p className="text-xs text-gray-500 font-medium">Synchronizing logs...</p>
                            </div>
                        </div>
                    ) : !data || data.maintenanceAlerts.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                    <Wrench className="w-5 h-5 text-emerald-400" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">No maintenance entries</p>
                                <Link href="/maintenance" className="text-xs text-indigo-400 mt-1 block">Add service entry →</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 flex-1">
                            {data.maintenanceAlerts.map((m: any) => (
                                <div key={m.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col gap-2 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-sm text-indigo-300 group-hover:text-indigo-200 transition-colors">{m.vehicle?.name || "Unknown"}</span>
                                        <span className="text-[10px] font-mono text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                            ${m.cost.toFixed(0)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">{m.description}</p>
                                    <p className="text-[10px] text-gray-600">{new Date(m.dateLogged).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <Link href="/maintenance" className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-gray-300 transition-colors border border-white/5 text-center block">
                        Log Service Entry
                    </Link>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Add Vehicle", href: "/vehicles", color: "#6366f1", icon: Truck, roles: ['Fleet Manager', 'Dispatcher'] },
                    { label: "Add Driver", href: "/drivers", color: "#10b981", icon: Activity, roles: ['Fleet Manager', 'Dispatcher'] },
                    { label: "Dispatch Trip", href: "/trips", color: "#f59e0b", icon: Package, roles: ['Fleet Manager', 'Dispatcher'] },
                    { label: "View Analytics", href: "/analytics", color: "#a855f7", icon: AlertTriangle, roles: ['Fleet Manager', 'Financial Analyst'] },
                ].filter(q => status !== "loading" && userRole && q.roles.includes(userRole as string)).map((q) => (
                    <Link key={q.href} href={q.href}
                        className="group flex items-center gap-3 p-4 bg-white/5 hover:bg-white/[0.08] border border-white/5 rounded-2xl transition-all hover:border-white/10"
                    >
                        <div className="p-2 rounded-xl" style={{ backgroundColor: q.color + '20', color: q.color }}>
                            <q.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">{q.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
