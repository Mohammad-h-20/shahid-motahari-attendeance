import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendSmsIrNormal, sendSmsIrPattern } from "@/lib/sms";

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

    // 1. Get sms.ir settings from user
    const adminUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    const apiKey = adminUser?.smsApiKey?.trim();
    const sender = adminUser?.smsSender?.trim() || "";

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "کلید وب‌سرویس sms.ir (API Key) هنوز در سامانه تنظیم نشده است. لطفاً ابتدا در بخش پروفایل، کلید sms.ir خود را وارد نمایید.",
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
          error: "شماره موبایل نامعتبر است",
        });
        failedCount++;
        continue;
      }

      try {
        if (mode === "NORMAL" || !adminUser?.smsTemplateAbsent) {
          // Normal mode (Bulk send via Line Number)
          let finalMessage = customMessage || "";
          
          if (!finalMessage) {
            if (status === "ABSENT") {
              finalMessage = `ولی محترم دانش‌آموز ${studentName}،\nفرزند شما امروز مورخ ${date} در کلاس ${className || ''} غایب می‌باشد.\nدبیرستان دوره اول شهید مطهری`;
            } else if (status === "LATE") {
              finalMessage = `ولی محترم دانش‌آموز ${studentName}،\nفرزند شما امروز مورخ ${date} با ${delayMinutes} دقیقه تاخیر وارد مدرسه شد.\nدبیرستان دوره اول شهید مطهری`;
            } else {
              finalMessage = `ولی محترم دانش‌آموز ${studentName}،\nفرزند شما امروز مورخ ${date} در مدرسه حاضر شد.\nدبیرستان دوره اول شهید مطهری`;
            }
          }

          const res = await sendSmsIrNormal({
            apiKey,
            sender,
            receptor: phone,
            message: finalMessage,
          });

          if (res.status === 1) {
            results.push({ phone, studentName, status: "SUCCESS" });
            successCount++;
          } else {
            results.push({ phone, studentName, status: "FAILED", error: res.message || "خطای ارسال" });
            failedCount++;
          }

        } else {
          // Pattern / Template Mode
          let templateIdStr = "";
          let parameters: Array<{ name: string; value: string }> = [
            { name: "NAME", value: studentName },
            { name: "DATE", value: date }
          ];

          if (status === "ABSENT") {
            templateIdStr = adminUser.smsTemplateAbsent;
          } else if (status === "LATE") {
            templateIdStr = adminUser.smsTemplateLate || adminUser.smsTemplateAbsent;
            parameters.push({ name: "DELAY", value: String(delayMinutes) });
          }

          if (!templateIdStr) {
            throw new Error("شناسه قالب (Template ID) تنظیم نشده است.");
          }

          const templateId = parseInt(templateIdStr, 10);
          if (isNaN(templateId)) {
            throw new Error("شناسه قالب باید عدد باشد.");
          }

          const res = await sendSmsIrPattern({
            apiKey,
            receptor: phone,
            templateId,
            parameters,
          });

          if (res.status === 1) {
            results.push({ phone, studentName, status: "SUCCESS" });
            successCount++;
          } else {
            results.push({ phone, studentName, status: "FAILED", error: res.message || "خطا از سرور پیامک" });
            failedCount++;
          }
        }
      } catch (err: any) {
        results.push({
          phone,
          studentName,
          status: "FAILED",
          error: err.message || "ارتباط با پنل پیامکی ناموفق بود.",
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: { total: recipients.length, success: successCount, failed: failedCount },
      results,
    });
  } catch (error) {
    console.error("SMS Sending Error:", error);
    return NextResponse.json(
      { error: "خطایی در برقراری ارتباط با وب‌سرویس پیامکی رخ داد." },
      { status: 500 }
    );
  }
}
