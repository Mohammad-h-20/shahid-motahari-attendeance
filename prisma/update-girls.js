const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const girlsNames = [
    { firstName: "زهرا", lastName: "محمدی" },
    { firstName: "فاطمه", lastName: "اکبری" },
    { firstName: "سارینا", lastName: "رضایی" },
    { firstName: "مریم", lastName: "صادقی" },
    { firstName: "یسنا", lastName: "حسینی" },
    { firstName: "نسترن", lastName: "کریمی" },
    { firstName: "ریحانه", lastName: "موسوی" },
    { firstName: "بهار", lastName: "احمدی" },
    { firstName: "پریا", lastName: "کاظمی" },
    { firstName: "نیلوفر", lastName: "باقری" },
    { firstName: "رها", lastName: "شجاعی" },
    { firstName: "هستی", lastName: "امینی" },
    { firstName: "درسا", lastName: "فرهادی" },
    { firstName: "الینا", lastName: "مرادی" },
    { firstName: "کیانا", lastName: "سعیدی" },
    { firstName: "ملیکا", lastName: "نوری" },
    { firstName: "آوا", lastName: "نجفی" }
  ];

  const students = await prisma.student.findMany({ orderBy: { createdAt: "asc" } });
  for (let i = 0; i < students.length; i++) {
    const gn = girlsNames[i % girlsNames.length];
    await prisma.student.update({
      where: { id: students[i].id },
      data: { firstName: gn.firstName, lastName: gn.lastName }
    });
  }
  console.log("Successfully updated", students.length, "students to girls names.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
