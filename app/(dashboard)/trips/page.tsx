"use client"

import { useState, useEffect } from "react"
import { MapPin, CheckCircle, Package, Plus, AlertTriangle } from "lucide-react"
import { useSession } from "next-auth/react"

export default function TripsPage() {
    const { data: session } = useSession()
    const userRole = session?.user?.role || "Dispatcher"
    const canCreateTrips = userRole === 'Fleet Manager' || userRole === 'Dispatcher'
    const [trips, setTrips] = useState<any[]>([])
    const [vehicles, setVehicles] = useState<any[]>([])
    const [drivers, setDrivers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({ vehicleId: '', driverId: '', cargoWeight: '' })

    const fetchData = async () => {
        setLoading(true)
        const [tripsRes, vehRes, driRes] = await Promise.all([
            fetch('/api/trips'),
            fetch('/api/vehicles'),
            fetch('/api/drivers')
        ])

        setTrips(await tripsRes.json() || [])
        setVehicles(await vehRes.json() || [])
        setDrivers(await driRes.json() || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const handleDispatch = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/trips', {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" }
        })

        if (res.ok) {
            setShowModal(false)
            setFormData({ vehicleId: '', driverId: '', cargoWeight: '' })
            fetchData()
        } else {
            const { error } = await res.json()
            alert("DISPATCH FAILED: " + error)
        }
    }

    const completeTrip = async (tripId: number) => {
        if (!confirm("Are you sure you want to log this trip as COMPLETED?")) return
        const res = await fetch('/api/trips', { method: "PATCH", body: JSON.stringify({ tripId }), headers: { "Content-Type": "application/json" } })
        if (res.ok) fetchData()
        else alert("Failed to complete trip")
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Trip Dispatcher</h2>
                    <p className="text-gray-400 mt-1">Rule-based dispatching engine with auto constraints checks.</p>
                </div>
                {canCreateTrips && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Dispatch Trip
                    </button>
                )}
            </div>

            <div className="bg-[#09090b] border border-white/5 rounded-3xl shadow-xl shadow-black/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 bg-white/5">
                                <th className="px-6 py-4 font-semibold">TID</th>
                                <th className="px-6 py-4 font-semibold">Vehicle</th>
                                <th className="px-6 py-4 font-semibold">Assigned Driver</th>
                                <th className="px-6 py-4 font-semibold">Payload</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading trips list...</td></tr>
                            ) : trips.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-gray-500">No trips logged yet.</td></tr>
                            ) : trips.map((t) => (
                                <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{t.id.toString().padStart(4, '0')}</td>
                                    <td className="px-6 py-4 font-bold text-white">{t.vehicle?.name || "Unknown"}</td>
                                    <td className="px-6 py-4 text-gray-300">{t.driver?.name || "Unknown"}</td>
                                    <td className="px-6 py-4 text-gray-400 font-mono">{t.cargoWeight} kg</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold tracking-wide uppercase ${t.status === 'COMPLETED' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' :
                                            t.status === 'DISPATCHED' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.2)]' :
                                                'text-gray-400 border-gray-500/30 bg-white/5'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {t.status === "DISPATCHED" && (
                                            <button
                                                onClick={() => completeTrip(t.id)}
                                                className="text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                Complete Target
                                            </button>
                                        )}
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
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-amber-400" />
                            Configure New Dispatch Route
                        </h3>

                        <form onSubmit={handleDispatch} className="flex flex-col gap-5 relative z-10">
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-200">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-medium">Automatic system validation in effect. Cannot dispatch overloaded vehicles or drivers with expired licenses.</p>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Assign Vehicle Unit</label>
                                <select
                                    required
                                    value={formData.vehicleId}
                                    onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
                                >
                                    <option value="" disabled className="bg-black text-gray-400">Select Available Vehicle...</option>
                                    {vehicles.filter(v => v.status === "AVAILABLE").map(v => (
                                        <option key={v.id} value={v.id} className="bg-black text-white">{v.name} (Cap: {v.maxCapacity}kg)</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Assign Available Driver</label>
                                <select
                                    required
                                    value={formData.driverId}
                                    onChange={e => setFormData({ ...formData, driverId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
                                >
                                    <option value="" disabled className="bg-black text-gray-400">Select Contract Driver...</option>
                                    {drivers.filter(d => d.status === "OFF_DUTY" || d.status === "ON_DUTY").map(d => (
                                        <option key={d.id} value={d.id} className="bg-black text-white">{d.name} (License: {d.licenseNumber})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Cargo Payload (kg)</label>
                                <div className="relative group">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-amber-400 transition-colors" />
                                    <input required value={formData.cargoWeight} onChange={e => setFormData({ ...formData, cargoWeight: e.target.value })} type="number" min="1" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors border border-white/10">
                                    Abort
                                </button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Execute Dispatch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
