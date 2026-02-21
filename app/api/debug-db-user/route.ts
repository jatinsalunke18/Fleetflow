import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@fleetflow.com' }
    })
    return NextResponse.json({ user })
}
