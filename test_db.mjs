import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: { email: true, role: true }
        })
        console.log('Database Users:')
        users.forEach(u => console.log(`- ${u.email} (${u.role})`))
    } catch (err) {
        console.error('Error fetching users:', err)
    } finally {
        await prisma.$disconnect()
    }
}

main()
