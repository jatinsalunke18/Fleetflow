import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const result = await prisma.user.updateMany({
        where: { email: 'admin@fleetflow.com' },
        data: { role: 'Fleet Manager' }
    })
    console.log(`Updated ${result.count} users.`)
}

main().finally(() => prisma.$disconnect())
