import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('password', 12)
    const user = await prisma.user.upsert({
        where: { email: 'system@fleetflow.com' },
        update: {},
        create: {
            email: 'system@fleetflow.com',
            name: 'System Admin',
            password,
            role: 'Fleet Manager',
        },
    })
    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
