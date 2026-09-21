const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- شروع بذرپاشی داده‌های اولیه سامانه حضور و غیاب مدرسه شهید مطهری ---');

  // ۱. ایجاد یا به‌روزرسانی کاربر پیش‌فرض با کلمه عبور 123456
  const user = await prisma.user.upsert({
    where: { username: '123456' },
    update: { password: '123456' },
    create: {
      username: '123456',
      password: '123456',
      fullName: 'مدیر و ناظم مدرسه شهید مطهری',
      role: 'ADMIN',
    },
  });
  console.log('کاربر مدیریت ایجاد شد:', user.username);

  // ۲. ایجاد پایه‌های تحصیلی: هفتم، هشتم، نهم
  const gradesData = [
    { name: 'پایه هفتم', code: 'grade-7', order: 1 },
    { name: 'پایه هشتم', code: 'grade-8', order: 2 },
    { name: 'پایه نهم', code: 'grade-9', order: 3 },
  ];

  for (const g of gradesData) {
    const grade = await prisma.grade.upsert({
      where: { code: g.code },
      update: { name: g.name, order: g.order },
      create: g,
    });
    console.log(`پایه تحصیلی ثبت شد: ${grade.name}`);

    // ۳. ایجاد کلاس‌های پیش‌فرض برای هر پایه
    let classesToCreate = [];
    if (g.code === 'grade-7') {
      classesToCreate = [
        { name: 'کلاس ۷۰۱ (شهید بهشتی)', room: '۱۰۱', teacher: 'استاد احمدی' },
        { name: 'کلاس ۷۰۲ (شهید مطهری)', room: '۱۰۲', teacher: 'استاد حسینی' },
        { name: 'کلاس ۷۰۳ (شهید چمران)', room: '۱۰۳', teacher: 'استاد رضایی' },
      ];
    } else if (g.code === 'grade-8') {
      classesToCreate = [
        { name: 'کلاس ۸۰۱ (شهید همت)', room: '۲۰۱', teacher: 'استاد کاظمی' },
        { name: 'کلاس ۸۰۲ (شهید باکری)', room: '۲۰۲', teacher: 'استاد باقری' },
      ];
    } else if (g.code === 'grade-9') {
      classesToCreate = [
        { name: 'کلاس ۹۰۱ (شهید سلیمانی)', room: '۳۰۱', teacher: 'استاد میرزایی' },
        { name: 'کلاس ۹۰۲ (شهید آوینی)', room: '۳۰۲', teacher: 'استاد کریمی' },
      ];
    }

    for (const c of classesToCreate) {
      const existingClass = await prisma.class.findFirst({
        where: { name: c.name, gradeId: grade.id },
      });

      let currentClass;
      if (!existingClass) {
        currentClass = await prisma.class.create({
          data: {
            name: c.name,
            room: c.room,
            teacher: c.teacher,
            gradeId: grade.id,
          },
        });
      } else {
        currentClass = existingClass;
      }

      // ۴. ایجاد چند دانش‌آموز نمونه در هر کلاس برای تست فوری و دیدن زیبایی سیستم
      const studentCount = await prisma.student.count({ where: { classId: currentClass.id } });
      if (studentCount === 0) {
        const sampleStudents = [
          { firstName: 'زهرا', lastName: 'محمدی', nationalId: '0012345678', phone: '09123456789' },
          { firstName: 'فاطمه', lastName: 'اکبری', nationalId: '0023456789', phone: '09121112233' },
          { firstName: 'سارینا', lastName: 'رضایی', nationalId: '0034567890', phone: '09122223344' },
          { firstName: 'مریم', lastName: 'صادقی', nationalId: '0045678901', phone: '09123334455' },
          { firstName: 'یسنا', lastName: 'حسینی', nationalId: '0056789012', phone: '09124445566' },
        ];

        for (const s of sampleStudents) {
          await prisma.student.create({
            data: {
              firstName: s.firstName,
              lastName: s.lastName,
              nationalId: s.nationalId,
              phone: s.phone,
              classId: currentClass.id,
            },
          });
        }
      }
    }
  }

  console.log('--- داده‌های اولیه با موفقیت در دیتابیس ثبت شدند ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
