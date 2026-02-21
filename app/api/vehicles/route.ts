import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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
    try {
        const json = await request.json()
        const { name, licensePlate, maxCapacity, odometer } = json

        const vehicle = await prisma.vehicle.create({
            data: {
                name,
                licensePlate,
                maxCapacity: parseInt(maxCapacity),
                odometer: parseFloat(odometer || 0),
                status: "AVAILABLE",
            },
        })
        return NextResponse.json(vehicle)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ error: "License plate must be unique." }, { status: 400 })
        return NextResponse.json({ error: "Failed to create vehicle." }, { status: 500 })
    }
}
