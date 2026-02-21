"use client"

import { useState, useEffect } from "react"
import { Users, Plus, ShieldAlert, CheckCircle2, MoreVertical } from "lucide-react"

export default function DriversPage() {
    const [drivers, setDrivers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({ name: '', licenseNumber: '', licenseExpiry: '' })

    const fetchDrivers = async () => {
        setLoading(true)
        const res = await fetch('/api/drivers')
        setDrivers(await res.json() || [])
        setLoading(false)
    }

    useEffect(() => { fetchDrivers() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/drivers', {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" }
        })

        if (res.ok) {
            setShowModal(false)
            setFormData({ name: '', licenseNumber: '', licenseExpiry: '' })
            fetchDrivers()
        } else {
            const { error } = await res.json()
            alert(error)
        }
    }

    const isExpired = (dateString: string) => {
        return new Date(dateString) < new Date()
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Driver Roster</h2>
                    <p className="text-gray-400 mt-1">Manage personnel, safety compliance, and license expirations.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Driver
                </button>
            </div>

            <div className="bg-[#09090b] border border-white/5 rounded-3xl shadow-xl shadow-black/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 bg-white/5">
                                <th className="px-6 py-4 font-semibold">Contractor Name</th>
                                <th className="px-6 py-4 font-semibold">License #</th>
                                <th className="px-6 py-4 font-semibold">License Valid Until</th>
                                <th className="px-6 py-4 font-semibold text-center">Safety Score</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading roster...</td></tr>
                            ) : drivers.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-gray-500">No drivers on roster.</td></tr>
                            ) : drivers.map((d) => (
                                <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Users className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        {d.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 font-mono text-xs tracking-wider">{d.licenseNumber}</td>
                                    <td className="px-6 py-4">
                                        {isExpired(d.licenseExpiry) ? (
                                            <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded w-fit">
                                                <ShieldAlert className="w-3.5 h-3.5" /> EXPIRED
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded w-fit">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> {new Date(d.licenseExpiry).toLocaleDateString()}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">{d.safetyScore}/100</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold tracking-wide ${d.status === 'OFF_DUTY' ? 'text-gray-400 border-gray-500/30 bg-white/5' :
                                                d.status === 'ON_DUTY' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                                    d.status === 'ON_TRIP' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                                        'text-red-400 border-red-500/30 bg-red-500/10'
                                            }`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-white p-2 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
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
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Onboard Contracting Driver
                        </h3>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Full Legal Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">State/Commercial License Number</label>
                                <input required value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono tracking-wider" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">License Expiration Date</label>
                                <input required value={formData.licenseExpiry} onChange={e => setFormData({ ...formData, licenseExpiry: e.target.value })} type="date" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                <p className="text-[10px] text-gray-500 mt-2">Note: The system will automatically block dispatch operations for drivers whose licenses have passed this expiration date.</p>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors border border-white/10">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Driver
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
