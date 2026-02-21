import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
    const session = await auth()
    if (!session || (session.user as any).role === 'Dispatcher' || (session.user as any).role === 'Safety Officer') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    try {
        const logs = await prisma.fuelLog.findMany({
            orderBy: { dateLogged: 'desc' },
            include: { vehicle: true }
        })
        return NextResponse.json(logs)
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch fuel logs" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await auth()
    if (!session || (session.user as any).role !== 'Fleet Manager' && (session.user as any).role !== 'Financial Analyst') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    try {
        const { vehicleId, litersUsed, cost } = await request.json()
        const log = await prisma.fuelLog.create({
            data: {
                vehicleId: parseInt(vehicleId),
                litersUsed: parseFloat(litersUsed),
                cost: parseFloat(cost),
            }
        })
        return NextResponse.json(log)
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to log fuel entry." }, { status: 500 })
    }
}
