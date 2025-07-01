import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      studentId: "ADMIN001",
      password: "admin123",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      firstName: "Student",
      lastName: "User",
      studentId: "ST12345",
      password: "student123",
      role: "student",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });