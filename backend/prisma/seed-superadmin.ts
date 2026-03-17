import { PrismaClient, PlatformRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_SUPERADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SEED_SUPERADMIN_PASSWORD?.trim();
  const firstName = process.env.SEED_SUPERADMIN_FIRST_NAME?.trim();
  const lastName = process.env.SEED_SUPERADMIN_LAST_NAME?.trim();
  const phone = process.env.SEED_SUPERADMIN_PHONE?.trim();

  if (!email || !password || !firstName || !lastName) {
    throw new Error(
      'Faltan variables de entorno para seed de superadmin: SEED_SUPERADMIN_EMAIL, SEED_SUPERADMIN_PASSWORD, SEED_SUPERADMIN_FIRST_NAME, SEED_SUPERADMIN_LAST_NAME',
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`El superadmin ya existe con email: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: PlatformRole.SUPERADMIN,
      isActive: true,
    },
  });

  console.log('Superadmin creado correctamente:');
  console.log({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

main()
  .catch((error) => {
    console.error('Error creando superadmin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });