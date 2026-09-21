import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendKavenegarSms, sendKavenegarLookup } from "@/lib/kavenegar";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipients, customMessage, mode = "NORMAL" } = body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "هیچ گیرنده‌ای برای ارسال پیامک انتخاب نشده است." },
        { status: 400 }
      );
    }

    // 1. Get Kavenegar settings from user settings or env
    const adminUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    const apiKey =
      adminUser?.kavenegarApiKey?.trim() ||
      process.env.KAVENEGAR_API_KEY?.trim();

    const sender =
      adminUser?.kavenegarSender?.trim() ||
      process.env.KAVENEGAR_SENDER?.trim() ||
      "";

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "کلید وب‌سرویس کاوه نگار (API Key) هنوز در سامانه تنظیم نشده است. لطفاً ابتدا در بخش پروفایل، کلید کاوه نگار خود را وارد نمایید.",
          needConfig: true,
        },
        { status: 400 }
      );
    }

    const results: Array<{
      phone: string;
      studentName: string;
      status: "SUCCESS" | "FAILED";
      messageId?: number;
      error?: string;
    }> = [];

    let successCount = 0;
    let failedCount = 0;

    // 2. Iterate and send SMS to each parent
    for (const item of recipients) {
      const { phone, studentName, status, delayMinutes, className, date } = item;

      if (!phone || phone.length < 10) {
        results.push({
          phone: phone || "بدون شماره",
          studentName,
          status: "FAILED",
          error: "شماره تلفن نامعتبر است",
        });
        failedCount++;
        continue;
      }

      try {
        if (mode === "LOOKUP") {
          // Template / Pattern based send
          const template =
            status === "ABSENT"
              ? adminUser?.lookupTemplateAbsent || "school-absent"
              : adminUser?.lookupTemplateLate || "school-late";

          const response = await sendKavenegarLookup({
            apiKey,
            receptor: phone,
            template,
            token: studentName.replace(/\s+/g, "."),
            token2: date,
            token3: delayMinutes ? String(delayMinutes) : undefined,
          });

          results.push({
            phone,
            studentName,
            status: "SUCCESS",
            messageId: response.entries?.[0]?.messageid,
          });
          successCount++;
        } else {
          // Standard text message send
          let text = "";
          if (customMessage) {
            text = customMessage
              .replace(/\{نام\}/g, studentName)
              .replace(/\{تاریخ\}/g, date)
              .replace(/\{کلاس\}/g, className || "")
              .replace(/\{تاخیر\}/g, String(delayMinutes || 0));
          } else if (status === "ABSENT") {
            text = `ولی محترم ${studentName}،\nبه اطلاع می‌رساند فرزند شما در تاریخ ${date} در دبیرستان دخترانه شهید مطهری غایب بوده است.`;
          } else {
            text = `ولی محترم ${studentName}،\nبه اطلاع می‌رساند فرزند شما در تاریخ ${date} با ${delayMinutes} دقیقه تاخیر در دبیرستان دخترانه شهید مطهری حاضر شد.`;
          }

          const response = await sendKavenegarSms({
            apiKey,
            sender: sender || undefined,
            receptor: phone,
            message: text,
          });

          results.push({
            phone,
            studentName,
            status: "SUCCESS",
            messageId: response.entries?.[0]?.messageid,
          });
          successCount++;
        }
      } catch (err: any) {
        console.error(`Error sending SMS to ${phone}:`, err.message);
        results.push({
          phone,
          studentName,
          status: "FAILED",
          error: err.message || "خطا در برقراری ارتباط با وب‌سرویس کاوه نگار",
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      failedCount,
      total: recipients.length,
      results,
    });
  } catch (error: any) {
    console.error("SMS API Error:", error);
    return NextResponse.json(
      { error: error.message || "خطایی در فرآیند ارسال پیامک رخ داد." },
      { status: 500 }
    );
  }
}
