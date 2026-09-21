const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAllData() {
  console.log('--- پاک‌سازی تمام داده‌های تستی و فیک ---');

  // ۱. حذف تمامی رکوردهای حضور و غیاب
  const deletedAttendance = await prisma.attendance.deleteMany();
  console.log(`تعداد ${deletedAttendance.count} رکورد حضور و غیاب حذف شد.`);

  // ۲. حذف تمامی دانش‌آموزان
  const deletedStudents = await prisma.student.deleteMany();
  console.log(`تعداد ${deletedStudents.count} دانش‌آموز حذف شد.`);

  // ۳. حذف تمامی کلاس‌ها
  const deletedClasses = await prisma.class.deleteMany();
  console.log(`تعداد ${deletedClasses.count} کلاس حذف شد.`);

  // ۴. اطمینان از وجود ۳ پایه تحصیلی (هفتم، هشتم، نهم) برای ورود کلاس‌ها توسط کاربر
  const grades = [
    { name: 'پایه هفتم', code: 'grade-7', order: 1 },
    { name: 'پایه هشتم', code: 'grade-8', order: 2 },
    { name: 'پایه نهم', code: 'grade-9', order: 3 },
  ];

  for (const g of grades) {
    await prisma.grade.upsert({
      where: { code: g.code },
      update: { name: g.name, order: g.order },
      create: g,
    });
  }

  // ۵. اطمینان از کاربر مدیر
  await prisma.user.upsert({
    where: { username: '123456' },
    update: {},
    create: {
      username: '123456',
      password: '123456',
      fullName: 'مدیریت دبیرستان دخترانه شهید مطهری',
      role: 'ADMIN',
    },
  });

  console.log('--- تمامی داده‌های فیک با موفقیت پاک شدند. دیتابیس کاملاً آماده ورود اطلاعات واقعی توسط شماست. ---');
}

cleanAllData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
