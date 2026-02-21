import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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
