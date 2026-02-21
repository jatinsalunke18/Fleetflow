import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
    try {
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { trips: true, maintenance: true }
                }
            }
        })
        return NextResponse.json(vehicles)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session || (session.user as any).role === 'Safety Officer') {
        return NextResponse.json({ error: "Unauthorized: Safety Officers cannot register vehicles." }, { status: 403 })
    }

    try {
        const json = await request.json()
        const { name, licensePlate, maxCapacity, odometer, type } = json

        const vehicle = await prisma.vehicle.create({
            data: {
                name,
                licensePlate,
                maxCapacity: parseInt(maxCapacity),
                odometer: parseFloat(odometer || 0),
                type: type || "Van",
                status: "AVAILABLE",
            },
        })
        return NextResponse.json(vehicle)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ error: "License plate must be unique." }, { status: 400 })
        return NextResponse.json({ error: "Failed to create vehicle." }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const session = await auth()
    if (!session || (session.user as any).role === 'Safety Officer') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    try {
        const { id, status } = await request.json()
        const vehicle = await prisma.vehicle.update({
            where: { id: parseInt(id) },
            data: { status }
        })
        return NextResponse.json(vehicle)
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update vehicle status" }, { status: 500 })
    }
}
export async function DELETE(request: Request) {
    const session = await auth()
    if (!session || (session.user as any).role === 'Safety Officer' || (session.user as any).role === 'Financial Analyst') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

        // Delete associated records first if they aren't cascading
        await prisma.$transaction([
            prisma.maintenanceLog.deleteMany({ where: { vehicleId: parseInt(id) } }),
            prisma.fuelLog.deleteMany({ where: { vehicleId: parseInt(id) } }),
            prisma.trip.deleteMany({ where: { vehicleId: parseInt(id) } }),
            prisma.vehicle.delete({ where: { id: parseInt(id) } })
        ])

        return NextResponse.json({ message: "Vehicle deleted successfully" })
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
    }
}
