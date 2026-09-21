import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { toEnglishDigits } from "@/lib/jalali";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "127.0.0.1";
    const userAgent = headersList.get("user-agent") || "نامشخص";
    
    let os = "نامشخص";
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
    
    let browser = "نامشخص";
    if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";

    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور الزامی است." },
        { status: 400 }
      );
    }

    const rawUsername = String(username).trim();
    const cleanUsername = toEnglishDigits(rawUsername).trim();

    const rawPassword = String(password).trim();
    const cleanPassword = toEnglishDigits(rawPassword).trim();

    // Look up user by username (matching either english or raw)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { username: rawUsername },
        ],
      },
    });

    if (!user) {
      await prisma.loginHistory.create({
        data: { username: rawUsername, ip, os, browser, status: "FAILED" }
      });
      return NextResponse.json(
        { error: "نام کاربری یا کلمه عبور اشتباه است." },
        { status: 401 }
      );
    }

    // Strictly check user's actual password in database (support both raw and normalized digits)
    const isPasswordValid =
      user.password === rawPassword ||
      user.password === cleanPassword ||
      (cleanPassword && toEnglishDigits(user.password) === cleanPassword);

    if (!isPasswordValid) {
      await prisma.loginHistory.create({
        data: { username: rawUsername, ip, os, browser, status: "FAILED" }
      });
      return NextResponse.json(
        { error: "نام کاربری یا کلمه عبور اشتباه است." },
        { status: 401 }
      );
    }

    await prisma.loginHistory.create({
      data: { username: user.username, ip, os, browser, status: "SUCCESS" }
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });

    // Set cookie
    response.cookies.set({
      name: "school_auth",
      value: `authenticated_${user.id}`,
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "خطایی در پردازش ورود به سامانه رخ داد." },
      { status: 500 }
    );
  }
}
