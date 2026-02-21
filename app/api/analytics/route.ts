import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
    const session = await auth()
    if (!session || (session.user as any).role === 'Dispatcher' || (session.user as any).role === 'Safety Officer') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    try {
        const [vehicles, trips, maintenance, fuelLogs] = await Promise.all([
            prisma.vehicle.findMany({ include: { trips: true, maintenance: true, fuelLogs: true } }),
            prisma.trip.findMany({ include: { vehicle: true, driver: true } }),
            prisma.maintenanceLog.findMany(),
            prisma.fuelLog.findMany(),
        ])

        // --- Per-vehicle analytics ---
        const vehicleStats = vehicles.map((v: any) => {
            const totalFuelCost = v.fuelLogs.reduce((sum: number, f: any) => sum + f.cost, 0)
            const totalFuelLiters = v.fuelLogs.reduce((sum: number, f: any) => sum + f.litersUsed, 0)
            const totalMaintenanceCost = v.maintenance.reduce((sum: number, m: any) => sum + m.cost, 0)
            const totalOperationalCost = totalFuelCost + totalMaintenanceCost
            const totalTrips = v.trips.length
            const completedTrips = v.trips.filter((t: any) => t.status === 'COMPLETED').length

            // Fuel efficiency: km per liter (odometer as proxy for distance)
            const fuelEfficiency = totalFuelLiters > 0 ? (v.odometer / totalFuelLiters).toFixed(2) : null

            return {
                id: v.id,
                name: v.name,
                licensePlate: v.licensePlate,
                status: v.status,
                odometer: v.odometer,
                totalFuelCost,
                totalMaintenanceCost,
                totalOperationalCost,
                totalTrips,
                completedTrips,
                fuelEfficiency,
            }
        })

        // --- Fleet-level summary ---
        const totalVehicles = vehicles.length
        const activeVehicles = vehicles.filter((v: any) => v.status === 'ON_TRIP').length
        const inShopVehicles = vehicles.filter((v: any) => v.status === 'IN_SHOP').length
        const availableVehicles = vehicles.filter((v: any) => v.status === 'AVAILABLE').length
        const retiredVehicles = vehicles.filter((v: any) => v.status === 'RETIRED').length
        const utilizationRate = totalVehicles > 0 ? ((activeVehicles / totalVehicles) * 100).toFixed(1) : 0

        const totalMaintenanceCost = maintenance.reduce((s: number, m: any) => s + m.cost, 0)
        const totalFuelCost = fuelLogs.reduce((s: number, f: any) => s + f.cost, 0)
        const totalOperationalCost = totalMaintenanceCost + totalFuelCost

        const totalTrips = trips.length
        const completedTrips = trips.filter((t: any) => t.status === 'COMPLETED').length
        const dispatchedTrips = trips.filter((t: any) => t.status === 'DISPATCHED').length
        const draftTrips = trips.filter((t: any) => t.status === 'DRAFT').length
        const cancelledTrips = trips.filter((t: any) => t.status === 'CANCELLED').length

        // Monthly trip stats (last 6 months)
        const now = new Date()
        const monthlyData = Array.from({ length: 6 }, (_, i) => {
            const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit' })
            const monthTrips = trips.filter((t: any) => {
                const d = new Date(t.createdAt)
                return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
            })
            const monthMaint = maintenance.filter((m: any) => {
                const d = new Date(m.dateLogged)
                return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
            })
            const monthFuel = fuelLogs.filter((f: any) => {
                const d = new Date(f.dateLogged)
                return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()
            })
            return {
                month: label,
                trips: monthTrips.length,
                cost: monthMaint.reduce((s: number, m: any) => s + m.cost, 0) + monthFuel.reduce((s: number, f: any) => s + f.cost, 0)
            }
        })

        return NextResponse.json({
            summary: {
                totalVehicles, activeVehicles, inShopVehicles, availableVehicles, retiredVehicles,
                utilizationRate,
                totalTrips, completedTrips, dispatchedTrips, draftTrips, cancelledTrips,
                totalOperationalCost, totalFuelCost, totalMaintenanceCost,
            },
            vehicleStats,
            monthlyData,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
