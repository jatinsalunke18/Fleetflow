import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
    try {
        const drivers = await prisma.driver.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { trips: true }
                }
            }
        })
        return NextResponse.json(drivers)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session || (session.user as any).role === 'Safety Officer') {
        return NextResponse.json({ error: "Unauthorized: Safety Officers cannot onboard drivers." }, { status: 403 })
    }

    try {
        const { name, licenseNumber, licenseExpiry } = await request.json()

        const driver = await prisma.driver.create({
            data: {
                name,
                licenseNumber,
                licenseExpiry: new Date(licenseExpiry),
                status: "OFF_DUTY",
            },
        })
        return NextResponse.json(driver)
    } catch (error: any) {
        if (error.code === 'P2002') return NextResponse.json({ error: "License number must be unique." }, { status: 400 })
        return NextResponse.json({ error: "Failed to create driver." }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Allow Fleet Managers, Dispatchers, and Safety Officers to update status
    try {
        const { id, status } = await request.json()
        const driver = await prisma.driver.update({
            where: { id: parseInt(id) },
            data: { status }
        })
        return NextResponse.json(driver)
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update driver status." }, { status: 500 })
    }
}
