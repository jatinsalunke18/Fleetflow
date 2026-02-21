"use client"

import { useState, useEffect } from "react"
import { Truck, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"

export default function VehiclesPage() {
    const { data: session, status } = useSession()
    const userRole = session?.user?.role
    const canManageVehicles = (status === "authenticated") && (userRole === 'Fleet Manager' || userRole === 'Dispatcher')
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({ name: '', licensePlate: '', maxCapacity: '', odometer: '', type: 'Van' })

    useEffect(() => {
        fetchVehicles()
    }, [])

    const fetchVehicles = async () => {
        setLoading(true)
        const res = await fetch('/api/vehicles')
        const data = await res.json()
        if (!data.error) setVehicles(data)
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/vehicles', {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" }
        })

        if (res.ok) {
            setShowModal(false)
            setFormData({ name: '', licensePlate: '', maxCapacity: '', odometer: '', type: 'Van' })
            fetchVehicles()
        } else {
            const { error } = await res.json()
            alert(error)
        }
    }

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'RETIRED' ? 'AVAILABLE' : 'RETIRED'
        const res = await fetch('/api/vehicles', {
            method: "PATCH",
            body: JSON.stringify({ id, status: newStatus }),
            headers: { "Content-Type": "application/json" }
        })
        if (res.ok) fetchVehicles()
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this vehicle? All related tracking/maintenance data will be permanently removed.")) return

        const res = await fetch(`/api/vehicles?id=${id}`, {
            method: "DELETE"
        })

        if (res.ok) {
            fetchVehicles()
        } else {
            const { error } = await res.json()
            alert(error)
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Vehicle Registry</h2>
                    <p className="text-gray-400 mt-1">Manage and track your active and retired fleet assets.</p>
                </div>
                {canManageVehicles && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Vehicle
                    </button>
                )}
            </div>

            <div className="bg-[#09090b] border border-white/5 rounded-3xl shadow-xl shadow-black/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 bg-white/5">
                                <th className="px-6 py-4 font-semibold">Unit No / Name</th>
                                <th className="px-6 py-4 font-semibold">Classification</th>
                                <th className="px-6 py-4 font-semibold">License Plate</th>
                                <th className="px-6 py-4 font-semibold">Max Capacity</th>
                                <th className="px-6 py-4 font-semibold">Odometer</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">Loading units...</td>
                                </tr>
                            ) : vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">No vehicles registered found.</td>
                                </tr>
                            ) : vehicles.map((v) => (
                                <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Truck className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        {v.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-300">{v.type || 'Van'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 font-mono text-xs">{v.licensePlate}</td>
                                    <td className="px-6 py-4 text-gray-300">{v.maxCapacity.toLocaleString()} kg</td>
                                    <td className="px-6 py-4 text-gray-400">{v.odometer.toLocaleString()} km</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold tracking-wide uppercase ${v.status === 'AVAILABLE' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                            v.status === 'ON_TRIP' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                                v.status === 'IN_SHOP' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                                    'text-gray-400 border-gray-500/30 bg-white/10'
                                            }`}>
                                            {v.status === 'RETIRED' ? 'OUT OF SERVICE' : v.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {canManageVehicles && (
                                                <>
                                                    <button
                                                        onClick={() => toggleStatus(v.id, v.status)}
                                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${v.status === 'RETIRED'
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                                            }`}
                                                    >
                                                        {v.status === 'RETIRED' ? 'Restore' : 'Retire'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(v.id)}
                                                        className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                                        title="Delete Vehicle"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
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
                            <Truck className="w-5 h-5 text-indigo-400" />
                            Register New Vehicle
                        </h3>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Vehicle Designation (e.g. Van-05)</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Vehicle Classification</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="Van" className="bg-[#0f0f13]">Van</option>
                                    <option value="Box-Truck" className="bg-[#0f0f13]">Box-Truck</option>
                                    <option value="Heavy-duty Truck" className="bg-[#0f0f13]">Heavy-duty Truck</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 block">License Plate (Unique)</label>
                                <input required value={formData.licensePlate} onChange={e => setFormData({ ...formData, licensePlate: e.target.value })} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase" />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Max Payload (kg)</label>
                                    <input required value={formData.maxCapacity} onChange={e => setFormData({ ...formData, maxCapacity: e.target.value })} type="number" min="1" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 font-medium mb-1.5 block">Current Odometer</label>
                                    <input required value={formData.odometer} onChange={e => setFormData({ ...formData, odometer: e.target.value })} type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors border border-white/10">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] text-sm font-semibold transition-colors">
                                    Add Unit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
