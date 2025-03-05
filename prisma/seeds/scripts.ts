import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      uid: Buffer.from('a1d109c290d0fb1ca068ffaddf33abc1', 'hex'),
      username: 'hmd777',
      password: await bcrypt.hash('triw12345678@', await bcrypt.genSalt(10)),
      email: 'hmd686@behmd.com',
      phone: '0987654321',
      type: 'internal',
      loginAttempts: 1,
      isBlockedByTenantOwner: false,
      isBannedBySystem: false,
      emailVerified: true,
      phoneVerified: true,
      passwordUpdatedAt: new Date('2025-01-15T10:30:00Z'),
      createdAt: new Date('2025-01-01T09:00:00Z'),
      updatedAt: new Date('2025-01-20T14:45:00Z'),
      createdBy: Buffer.from('d41d8cd98f00b204e9800998ecf8427f', 'hex'),
      updatedBy: Buffer.from('e41d8cd98f00b204e9800998ecf8427f', 'hex'),
      deletedAt: null,
    },
  })
  console.log('New user created:', user)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error creating user:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
