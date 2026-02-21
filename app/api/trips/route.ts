import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
    try {
        const trips = await prisma.trip.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                vehicle: true,
                driver: true,
            }
        })
        return NextResponse.json(trips)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session || (session.user as any).role === 'Safety Officer') {
        return NextResponse.json({ error: "Unauthorized: Safety Officers cannot dispatch trips." }, { status: 403 })
    }

    try {
        const { vehicleId, driverId, cargoWeight, distance } = await request.json()

        // 1. Validate Vehicle
        const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(vehicleId) } })
        if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })

        if (parseInt(cargoWeight) > vehicle.maxCapacity) {
            return NextResponse.json({ error: `Over capacity: Payload ${cargoWeight}kg exceeds max limit ${vehicle.maxCapacity}kg for ${vehicle.name}` }, { status: 400 })
        }

        if (vehicle.status !== "AVAILABLE") {
            return NextResponse.json({ error: `Vehicle is currently ${vehicle.status} and cannot be dispatched.` }, { status: 400 })
        }

        // 2. Validate Driver
        const driver = await prisma.driver.findUnique({ where: { id: parseInt(driverId) } })
        if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 })

        if (driver.status !== "OFF_DUTY" && driver.status !== "ON_DUTY") {
            return NextResponse.json({ error: `Driver is ${driver.status} and cannot take trips.` }, { status: 400 })
        }

        if (new Date(driver.licenseExpiry) < new Date()) {
            return NextResponse.json({ error: "Driver license is EXPIRED. Dispatch blocked for safety compliance." }, { status: 403 })
        }

        // 3. Transaction
        const result = await prisma.$transaction(async (prisma) => {
            const trip = await prisma.trip.create({
                data: {
                    vehicleId: vehicle.id,
                    driverId: driver.id,
                    cargoWeight: parseInt(cargoWeight),
                    distance: parseFloat(distance || 0),
                    status: "DISPATCHED",
                }
            })
            await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: "ON_TRIP" } })
            await prisma.driver.update({ where: { id: driver.id }, data: { status: "ON_TRIP" } })
            return trip
        })

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create trip." }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const { tripId, driverRating, fuelUsed } = await request.json()
        const trip = await prisma.trip.findUnique({ where: { id: parseInt(tripId) }, include: { driver: true } })
        if (!trip || trip.status !== "DISPATCHED") return NextResponse.json({ error: "Invalid trip or status" }, { status: 400 })

        const rating = parseFloat(driverRating || 10)
        const fuel = parseFloat(fuelUsed || 0)

        // Calculate new safety score
        const driverTripsCount = await prisma.trip.count({ where: { driverId: trip.driverId, status: "COMPLETED" } })
        const totalPreviousScoreSum = trip.driver.safetyScore * driverTripsCount
        const newSafetyScore = driverTripsCount === 0 ? Math.round(rating * 10) : Math.round((totalPreviousScoreSum + (rating * 10)) / (driverTripsCount + 1))

        const updates: any[] = [
            // Update Trip
            prisma.trip.update({
                where: { id: trip.id },
                data: { status: "COMPLETED", endDate: new Date(), driverRating: rating, fuelUsed: fuel }
            }),
            // Update Vehicle
            prisma.vehicle.update({
                where: { id: trip.vehicleId },
                data: { status: "AVAILABLE", odometer: { increment: trip.distance } }
            }),
            // Update Driver
            prisma.driver.update({
                where: { id: trip.driverId },
                data: { status: "OFF_DUTY", totalDistance: { increment: trip.distance }, safetyScore: newSafetyScore }
            })
        ]

        // Auto Log Fuel if used
        if (fuel > 0) {
            updates.push(prisma.fuelLog.create({
                data: {
                    vehicleId: trip.vehicleId,
                    litersUsed: fuel,
                    cost: fuel * 1.5, // Standard estimated cost, could be made dynamic
                }
            }))
        }

        await prisma.$transaction(updates)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to complete trip." }, { status: 500 })
    }
}
