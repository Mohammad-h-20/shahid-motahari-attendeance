import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { toEnglishDigits } from "@/lib/jalali";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "خطا در بارگذاری اطلاعات پروفایل" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword, fullName, username } = body;

    const user = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
    }

    // Verify current password if user is attempting to change password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "جهت تعیین رمز عبور جدید، وارد کردن رمز عبور فعلی الزامی است." },
          { status: 400 }
        );
      }

      const cleanCurrent = toEnglishDigits(currentPassword.trim());
      const rawCurrent = currentPassword.trim();
      const isCurrentMatch =
        user.password === rawCurrent ||
        user.password === cleanCurrent ||
        toEnglishDigits(user.password) === cleanCurrent;

      if (!isCurrentMatch) {
        return NextResponse.json(
          { error: "رمز عبور فعلی نادرست است." },
          { status: 400 }
        );
      }

      if (newPassword.trim().length < 4) {
        return NextResponse.json(
          { error: "رمز عبور جدید باید حداقل ۴ رقم یا نویسه باشد." },
          { status: 400 }
        );
      }
    }

    // Check if new username is unique if changing username
    if (username && toEnglishDigits(username.trim()) !== user.username) {
      const cleanNewUser = toEnglishDigits(username.trim());
      const existing = await prisma.user.findUnique({
        where: { username: cleanNewUser },
      });
      if (existing) {
        return NextResponse.json(
          { error: "این نام کاربری قبلاً انتخاب شده است." },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(newPassword ? { password: toEnglishDigits(newPassword.trim()) } : {}),
        ...(username ? { username: toEnglishDigits(username.trim()) } : {}),
        ...(fullName ? { fullName: fullName.trim() } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "اطلاعات حساب کاربری و رمز عبور با موفقیت به‌روزرسانی شد.",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "خطا در تغییر رمز عبور و به‌روزرسانی پروفایل" },
      { status: 500 }
    );
  }
}
