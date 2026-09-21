import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const query = searchParams.get("q");

    const where: any = {};
    if (classId) where.classId = classId;
    if (query) {
      where.OR = [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { phone: { contains: query } },
        { nationalId: { contains: query } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        class: {
          include: {
            grade: true,
          },
        },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیست دانش‌آموزان" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, classId, nationalId, studentNumber } = body;

    if (!firstName || !lastName || !classId || !phone) {
      return NextResponse.json(
        { error: "نام، نام خانوادگی، کلاس و شماره موبایل الزامی هستند." },
        { status: 400 }
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        classId,
        nationalId: nationalId?.trim() || null,
        studentNumber: studentNumber?.trim() || null,
      },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "خطا در افزودن دانش‌آموز جدید" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, firstName, lastName, phone, nationalId, studentNumber, classId } = body;

    if (!id || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "شناسه، نام، نام خانوادگی و شماره موبایل الزامی هستند." },
        { status: 400 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        nationalId: nationalId ? nationalId.trim() : null,
        studentNumber: studentNumber ? studentNumber.trim() : null,
        ...(classId ? { classId } : {}),
      },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "خطا در ویرایش اطلاعات دانش‌آموز" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "شناسه دانش‌آموز مشخص نیست." }, { status: 400 });
    }

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "خطا در حذف دانش‌آموز" },
      { status: 500 }
    );
  }
}
