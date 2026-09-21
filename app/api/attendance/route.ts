import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTodayJalaliString } from "@/lib/jalali";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date") || getTodayJalaliString();
    const overview = searchParams.get("overview");
    const report = searchParams.get("report");

    // If overview statistics are requested
    if (overview === "true") {
      const today = getTodayJalaliString();
      const totalStudents = await prisma.student.count();
      const totalClasses = await prisma.class.count();
      const totalGrades = await prisma.grade.count();

      const todayRecords = await prisma.attendance.findMany({
        where: { date: today },
      });

      const presentCount = todayRecords.filter((r) => r.status === "PRESENT").length;
      const absentCount = todayRecords.filter((r) => r.status === "ABSENT").length;
      const lateCount = todayRecords.filter((r) => r.status === "LATE").length;
      const excusedCount = todayRecords.filter((r) => r.status === "EXCUSED").length;

      return NextResponse.json({
        totalStudents,
        totalClasses,
        totalGrades,
        today,
        todayRecordsCount: todayRecords.length,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate:
          totalStudents > 0
            ? Math.round((presentCount / (totalStudents || 1)) * 100)
            : 100,
      });
    }

    // Comprehensive report
    if (report === "true") {
      const students = await prisma.student.findMany({
        include: {
          class: {
            include: { grade: true },
          },
          attendances: {
            orderBy: { date: "desc" },
          },
        },
      });

      const reportData = students.map((s) => {
        const total = s.attendances.length;
        const present = s.attendances.filter((a) => a.status === "PRESENT").length;
        const absent = s.attendances.filter((a) => a.status === "ABSENT").length;
        const late = s.attendances.filter((a) => a.status === "LATE").length;
        const totalDelay = s.attendances.reduce((acc, a) => acc + (a.delayMinutes || 0), 0);

        return {
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          fullName: `${s.firstName} ${s.lastName}`,
          nationalId: s.nationalId,
          phone: s.phone,
          className: s.class.name,
          gradeName: s.class.grade.name,
          totalDaysRecorded: total,
          presentCount: present,
          absentCount: absent,
          lateCount: late,
          totalDelayMinutes: totalDelay,
          attendances: s.attendances,
        };
      });

      return NextResponse.json(reportData);
    }

    // Standard attendance sheet for a specific class and date
    if (!classId) {
      return NextResponse.json(
        { error: "شناسه کلاس (classId) الزامی است." },
        { status: 400 }
      );
    }

    // Fetch class info
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      include: { grade: true },
    });

    if (!classInfo) {
      return NextResponse.json({ error: "کلاس یافت نشد." }, { status: 404 });
    }

    // Fetch students in this class
    const students = await prisma.student.findMany({
      where: { classId },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        attendances: {
          where: { date },
        },
      },
    });

    // Merge student with their attendance record for this date
    const attendanceSheet = students.map((student) => {
      const record = student.attendances[0] || null;
      return {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        nationalId: student.nationalId,
        phone: student.phone,
        studentNumber: student.studentNumber,
        status: record ? record.status : "PRESENT", // default to PRESENT if not yet marked
        delayMinutes: record ? record.delayMinutes : 0,
        notes: record ? record.notes || "" : "",
        isRecorded: !!record,
        recordId: record ? record.id : null,
      };
    });

    return NextResponse.json({
      classInfo,
      date,
      students: attendanceSheet,
    });
  } catch (error) {
    console.error("Error in attendance GET:", error);
    return NextResponse.json(
      { error: "خطا در بارگذاری لیست حضور و غیاب" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classId, date, records } = body;

    if (!classId || !date || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "اطلاعات کلاس، تاریخ و لیست رکوردها ناقص است." },
        { status: 400 }
      );
    }

    // Upsert each record
    const updates = records.map((rec) => {
      return prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: rec.studentId,
            date: date,
          },
        },
        update: {
          status: rec.status,
          delayMinutes: parseInt(rec.delayMinutes || "0", 10) || 0,
          notes: rec.notes || null,
          classId: classId,
        },
        create: {
          studentId: rec.studentId,
          classId: classId,
          date: date,
          status: rec.status,
          delayMinutes: parseInt(rec.delayMinutes || "0", 10) || 0,
          notes: rec.notes || null,
        },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({
      success: true,
      message: `حضور و غیاب تاریخ ${date} با موفقیت در سرور ذخیره شد.`,
      count: records.length,
    });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره‌سازی داده‌های حضور و غیاب روی سرور" },
      { status: 500 }
    );
  }
}
