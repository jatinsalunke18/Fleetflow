import { PrismaClient } from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create default users for each role
    const users = [
        { email: 'admin@fleetflow.com', name: 'Fleet Admin', role: 'Fleet Manager', password: 'fleetflow123' },
        { email: 'dispatch@fleetflow.com', name: 'Dispatch Officer', role: 'Dispatcher', password: 'fleetflow123' },
        { email: 'safety@fleetflow.com', name: 'Safety Officer', role: 'Safety Officer', password: 'fleetflow123' },
        { email: 'finance@fleetflow.com', name: 'Finance Analyst', role: 'Financial Analyst', password: 'fleetflow123' },
    ]

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                role: u.role,
                password: hashSync(u.password, 12),
            },
        })
        console.log(`✅ Created user: ${u.email}`)
    }

    console.log('Seed complete!')
}

main()
    .finally(async () => { await prisma.$disconnect() })
