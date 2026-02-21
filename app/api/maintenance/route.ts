import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const logs = await prisma.maintenanceLog.findMany({
            orderBy: { dateLogged: 'desc' },
            include: {
                vehicle: true,
            }
        })
        return NextResponse.json(logs)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch maintenance logs" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { vehicleId, description, cost, statusAction } = await request.json()

        const result = await prisma.$transaction(async (prisma) => {
            // 1. Log Maintenance
            const log = await prisma.maintenanceLog.create({
                data: {
                    vehicleId: parseInt(vehicleId),
                    description,
                    cost: parseFloat(cost),
                }
            })

            // 2. Change Vehicle Status optionally (Put IN_SHOP or Return to AVAILABLE)
            if (statusAction === "PUT_IN_SHOP") {
                await prisma.vehicle.update({
                    where: { id: parseInt(vehicleId) },
                    data: { status: "IN_SHOP" }
                })
            } else if (statusAction === "RESTORE_AVAILABLE") {
                await prisma.vehicle.update({
                    where: { id: parseInt(vehicleId) },
                    data: { status: "AVAILABLE" }
                })
            }

            return log
        })

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to log maintenance event." }, { status: 500 })
    }
}
