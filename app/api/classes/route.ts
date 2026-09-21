import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");
    const gradeCode = searchParams.get("gradeCode");

    const where: any = {};
    if (gradeId) where.gradeId = gradeId;
    if (gradeCode) where.grade = { code: gradeCode };

    const classes = await prisma.class.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        grade: true,
        _count: {
          select: { students: true },
        },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات کلاس‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, gradeId, room, teacher } = body;

    if (!name || !gradeId) {
      return NextResponse.json(
        { error: "نام کلاس و پایه تحصیلی الزامی است." },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        gradeId,
        room: room?.trim() || null,
        teacher: teacher?.trim() || null,
      },
      include: {
        grade: true,
        _count: {
          select: { students: true },
        },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "خطا در ثبت کلاس جدید" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "شناسه کلاس الزامی است." }, { status: 400 });
    }

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "کلاس با موفقیت حذف شد." });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "خطا در حذف کلاس" },
      { status: 500 }
    );
  }
}
