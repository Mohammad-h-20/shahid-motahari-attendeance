import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let grades = await prisma.grade.findMany({
      orderBy: { order: "asc" },
      include: {
        classes: {
          include: {
            _count: {
              select: { students: true },
            },
          },
        },
      },
    });

    if (grades.length === 0) {
      await prisma.grade.createMany({
        data: [
          { name: "پایه هفتم", code: "grade-7", order: 1 },
          { name: "پایه هشتم", code: "grade-8", order: 2 },
          { name: "پایه نهم", code: "grade-9", order: 3 },
        ]
      });
      
      grades = await prisma.grade.findMany({
        orderBy: { order: "asc" },
        include: {
          classes: {
            include: {
              _count: {
                select: { students: true },
              },
            },
          },
        },
      });
    }

    const formatted = grades.map((g) => {
      const totalStudents = g.classes.reduce(
        (acc, c) => acc + (c._count?.students || 0),
        0
      );
      return {
        id: g.id,
        name: g.name,
        code: g.code,
        order: g.order,
        classCount: g.classes.length,
        studentCount: totalStudents,
        classes: g.classes,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات پایه‌ها" },
      { status: 500 }
    );
  }
}
