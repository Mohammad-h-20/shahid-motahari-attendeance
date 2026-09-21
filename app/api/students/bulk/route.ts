import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { students } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "لیست دانش‌آموزان خالی است یا فرمت نامعتبر است." },
        { status: 400 }
      );
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    // Map to cache grade and class lookups
    const gradeCache = new Map<string, string>(); // name -> id
    const classCache = new Map<string, string>(); // gradeId_className -> id

    // Pre-fetch all grades to simplify matching
    const allGrades = await prisma.grade.findMany();

    for (const [index, row] of students.entries()) {
      try {
        const { gradeName, className, firstName, lastName, phone, nationalId } = row;

        if (!firstName || !lastName || !className) {
          throw new Error("نام، نام خانوادگی و کلاس الزامی است.");
        }

        // Match Grade
        let matchedGradeId = "";
        let searchGrade = (gradeName || "").trim();
        
        if (gradeCache.has(searchGrade)) {
          matchedGradeId = gradeCache.get(searchGrade)!;
        } else {
          // Fuzzy search grade
          const found = allGrades.find(g => 
            g.name === searchGrade || 
            g.name.includes(searchGrade) || 
            searchGrade.includes(g.name.replace('پایه ', ''))
          );
          
          if (found) {
            matchedGradeId = found.id;
            gradeCache.set(searchGrade, found.id);
          } else {
            // If completely unmatchable, fallback to the first grade (or throw error)
            if (allGrades.length > 0) {
              matchedGradeId = allGrades[0].id;
            } else {
              throw new Error("پایه‌ای در سیستم یافت نشد.");
            }
          }
        }

        // Find or Create Class
        const classKey = `${matchedGradeId}_${className.trim()}`;
        let matchedClassId = "";
        if (classCache.has(classKey)) {
          matchedClassId = classCache.get(classKey)!;
        } else {
          const existingClass = await prisma.class.findFirst({
            where: {
              name: className.trim(),
              gradeId: matchedGradeId
            }
          });

          if (existingClass) {
            matchedClassId = existingClass.id;
          } else {
            // Auto create class
            const newClass = await prisma.class.create({
              data: {
                name: className.trim(),
                gradeId: matchedGradeId
              }
            });
            matchedClassId = newClass.id;
          }
          classCache.set(classKey, matchedClassId);
        }

        // Insert Student
        await prisma.student.create({
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone ? String(phone).trim() : "",
            nationalId: nationalId ? String(nationalId).trim() : null,
            classId: matchedClassId
          }
        });

        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push({ row: index + 1, name: row.firstName + ' ' + row.lastName, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `تعداد ${successCount} دانش‌آموز با موفقیت وارد شدند. (${failedCount} خطا)`,
      details: { successCount, failedCount, errors }
    });

  } catch (error) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json(
      { error: "خطایی در پردازش لیست اکسل رخ داد." },
      { status: 500 }
    );
  }
}
