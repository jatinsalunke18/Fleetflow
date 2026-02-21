import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const [vehicles, trips, maintenance] = await Promise.all([
            prisma.vehicle.findMany(),
            prisma.trip.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { vehicle: true, driver: true } }),
            prisma.maintenanceLog.findMany({ orderBy: { dateLogged: 'desc' }, take: 3, include: { vehicle: true } }),
        ])

        const totalVehicles = vehicles.length
        const activeVehicles = vehicles.filter(v => v.status === 'ON_TRIP').length
        const inShopVehicles = vehicles.filter(v => v.status === 'IN_SHOP').length
        const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length

        const pendingTrips = await prisma.trip.count({ where: { status: 'DRAFT' } })
        const utilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0

        return NextResponse.json({
            stats: {
                totalVehicles,
                activeVehicles,
                inShopVehicles,
                availableVehicles,
                pendingTrips,
                utilizationRate,
            },
            recentTrips: trips,
            maintenanceAlerts: maintenance,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
