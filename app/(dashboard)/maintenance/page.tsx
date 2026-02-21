"use client"

import { useState, useEffect } from "react"
import { Wrench, Plus, Tag, RefreshCcw } from "lucide-react"

export default function MaintenancePage() {
    const [logs, setLogs] = useState<any[]>([])
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({ vehicleId: '', description: '', cost: '', statusAction: 'NONE' })

    const fetchData = async () => {
        setLoading(true)
        const [lRes, vRes] = await Promise.all([
            fetch('/api/maintenance'),
            fetch('/api/vehicles')
        ])
        setLogs(await lRes.json() || [])
        setVehicles(await vRes.json() || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/maintenance', {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" }
        })

        if (res.ok) {
            setShowModal(false)
            setFormData({ vehicleId: '', description: '', cost: '', statusAction: 'NONE' })
            fetchData()
        } else {
            const { error } = await res.json()
            alert("Error: " + error)
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Shop & Maintenance Logs</h2>
                    <p className="text-gray-400 mt-1">Track asset maintenance events, repair costs, and downtime.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-2"
                >
                    <Wrench className="w-4 h-4" /> Add Service Entry
                </button>
            </div>

            <div className="bg-[#09090b] border border-white/5 rounded-3xl shadow-xl shadow-black/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 bg-white/5">
                                <th className="px-6 py-4 font-semibold">Log ID</th>
                                <th className="px-6 py-4 font-semibold">Service Date</th>
                                <th className="px-6 py-4 font-semibold">Target Vehicle</th>
                                <th className="px-6 py-4 font-semibold">Task Description</th>
                                <th className="px-6 py-4 font-semibold text-right">Invoiced Cost</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">Retrieving service logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-500">No maintenance events found.</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">LOG-{log.id.toString().padStart(4, '0')}</td>
                                    <td className="px-6 py-4 font-medium text-white">{new Date(log.dateLogged).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold text-indigo-300 group-hover:text-indigo-200 transition-colors">{log.vehicle?.name || "Deleted Asset"}</td>
                                    <td className="px-6 py-4 text-gray-400 max-w-md truncate">{log.description}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
                                            ${log.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                    <div className="bg-[#0f0f13] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-red-500" />
                            Log System Maintenance
                        </h3>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Select Vehicle Asset</label>
                                <select
                                    required
                                    value={formData.vehicleId}
                                    onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 appearance-none"
                                >
                                    <option value="" disabled className="bg-black text-gray-400">Choose Fleet Asset...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id} className="bg-black text-white">
                                            {v.name} (Current: {v.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Service Performed / Description</label>
                                <textarea
                                    required
                                    placeholder="e.g. Engine Oil Change & Rotation"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 min-h-[100px]"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Invoiced Task Cost ($)</label>
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
                                    <input required value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} type="number" min="0" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50" />
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <label className="text-xs text-white font-semibold mb-3 flex z-20 items-center gap-2">
                                    <RefreshCcw className="w-4 h-4 text-indigo-400" />
                                    Update Availability Status?
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                        <input type="radio" name="statusAction" value="NONE" checked={formData.statusAction === 'NONE'} onChange={e => setFormData({ ...formData, statusAction: e.target.value })} className="accent-indigo-500 w-4 h-4 cursor-pointer" />
                                        Do Not Change
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                        <input type="radio" name="statusAction" value="PUT_IN_SHOP" checked={formData.statusAction === 'PUT_IN_SHOP'} onChange={e => setFormData({ ...formData, statusAction: e.target.value })} className="accent-red-500 w-4 h-4 cursor-pointer" />
                                        <span className="text-red-400 font-medium">To 'IN SHOP'</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer group">
                                        <input type="radio" name="statusAction" value="RESTORE_AVAILABLE" checked={formData.statusAction === 'RESTORE_AVAILABLE'} onChange={e => setFormData({ ...formData, statusAction: e.target.value })} className="accent-emerald-500 w-4 h-4 cursor-pointer" />
                                        <span className="text-emerald-400 font-medium">To 'AVAILABLE'</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors border border-white/10">
                                    Cancel Event
                                </button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] text-sm font-semibold transition-colors">
                                    Log Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
