"use client"

import { useState, useEffect } from "react"
import { Fuel, Plus, Tag } from "lucide-react"

export default function FuelPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({ vehicleId: '', litersUsed: '', cost: '' })

    const fetchData = async () => {
        setLoading(true)
        const [lRes, vRes] = await Promise.all([fetch('/api/fuel'), fetch('/api/vehicles')])
        setLogs(await lRes.json() || [])
        setVehicles(await vRes.json() || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/fuel', {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" }
        })
        if (res.ok) {
            setShowModal(false)
            setFormData({ vehicleId: '', litersUsed: '', cost: '' })
            fetchData()
        } else {
            const { error } = await res.json()
            alert(error)
        }
    }

    const totalCost = logs.reduce((s, l) => s + l.cost, 0)
    const totalLiters = logs.reduce((s, l) => s + l.litersUsed, 0)

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Fuel & Expenses</h2>
                    <p className="text-gray-400 mt-1">Track fuel consumption and operational costs per vehicle.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Log Fuel Entry
                </button>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-3 gap-5">
                {[
                    { label: "Total Fuel Spent", value: `$${totalCost.toFixed(2)}`, color: "#ef4444" },
                    { label: "Total Liters Consumed", value: `${totalLiters.toFixed(1)} L`, color: "#f59e0b" },
                    { label: "Avg Cost Per Liter", value: totalLiters > 0 ? `$${(totalCost / totalLiters).toFixed(3)}/L` : "—", color: "#6366f1" },
                ].map((item, i) => (
                    <div key={i} className="bg-[#09090b] border border-white/5 rounded-2xl p-5">
                        <p className="text-xs text-gray-500 font-medium mb-2">{item.label}</p>
                        <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Logs Table */}
            <div className="bg-[#09090b] border border-white/5 rounded-3xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 bg-white/5">
                                <th className="px-6 py-4 font-semibold">Log ID</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Vehicle</th>
                                <th className="px-6 py-4 font-semibold text-right">Liters</th>
                                <th className="px-6 py-4 font-semibold text-right">Cost</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">Loading fuel logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No fuel logs yet. Click "Log Fuel Entry" to start tracking.</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">FUEL-{log.id.toString().padStart(4, '0')}</td>
                                    <td className="px-6 py-4 text-white font-medium">{new Date(log.dateLogged).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold text-indigo-300">{log.vehicle?.name || "Unknown"}</td>
                                    <td className="px-6 py-4 text-right font-mono text-amber-400">{log.litersUsed.toFixed(1)} L</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
                                            ${log.cost.toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0f0f13] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                            <Fuel className="w-5 h-5 text-amber-400" />
                            Log Fuel Expense
                        </h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Vehicle Unit</label>
                                <select required value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
                                    <option value="" disabled className="bg-black">Select Vehicle...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id} className="bg-black">{v.name} ({v.licensePlate})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Liters Filled</label>
                                    <input required value={formData.litersUsed} onChange={e => setFormData({ ...formData, litersUsed: e.target.value })}
                                        type="number" min="0.1" step="0.1"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Total Cost ($)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input required value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                            type="number" min="0.01" step="0.01"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold border border-white/10 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
