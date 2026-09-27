import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendKavenegarNormal, sendKavenegarLookup } from "@/lib/kavenegar";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipients, customMessage } = body; // Array of { studentName, phone, status, delayMinutes, className, date }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "لیست گیرندگان خالی است." }, { status: 400 });
    }

    const adminUser = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

    const apiKey = adminUser?.kavenegarApiKey || process.env.KAVENEGAR_API_KEY;
    const sender = adminUser?.kavenegarSender || "2000660110";
    const mode = adminUser?.smsMode || "NORMAL"; // NORMAL, LOOKUP, or BALE
    const baleBotToken = adminUser?.baleBotToken;

    if (mode === "BALE" && !baleBotToken) {
       return NextResponse.json(
        { error: "توکن بازو بله تنظیم نشده است.", needConfig: true },
        { status: 400 }
      );
    }

    if (mode !== "BALE" && !apiKey) {
      return NextResponse.json(
        { error: "کلید وب‌سرویس پیامک تنظیم نشده است.", needConfig: true },
        { status: 400 }
      );
    }

    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const rec of recipients) {
      const { studentName, phone, status, delayMinutes, className, date } = rec;
      
      try {
        if (mode === "BALE") {
           // Get student's baleChatId
           // Need to clean phone string to match db
           let cleanPhone = String(phone).replace('+', '');
           if (cleanPhone.startsWith('98')) {
             cleanPhone = '0' + cleanPhone.substring(2);
           } else if (!cleanPhone.startsWith('0')) {
             cleanPhone = '0' + cleanPhone;
           }

           const student = await prisma.student.findFirst({ where: { phone: cleanPhone }});
           
           if (!student || !student.baleChatId) {
              results.push({ phone, studentName, status: "FAILED", error: "اولیا هنوز در بازو بله ثبت‌نام نکرده‌اند." });
              failedCount++;
              continue;
           }

           let finalMessage = customMessage || "";
           if (!finalMessage) {
             if (status === "ABSENT") {
               finalMessage = \ولی محترم دانش‌آموز \،\nفرزند شما امروز مورخ \ در کلاس \ غایب می‌باشد.\nدبیرستان دوره اول شهید مطهری\;
             } else if (status === "LATE") {
               finalMessage = \ولی محترم دانش‌آموز \،\nفرزند شما امروز مورخ \ با \ دقیقه تاخیر وارد مدرسه شد.\nدبیرستان دوره اول شهید مطهری\;
             } else {
               finalMessage = \ولی محترم دانش‌آموز \،\nفرزند شما امروز مورخ \ در مدرسه حاضر شد.\nدبیرستان دوره اول شهید مطهری\;
             }
           }

           const baleRes = await fetch('https://tapi.bale.ai/bot' + baleBotToken + '/sendMessage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: student.baleChatId, text: finalMessage })
           });
           
           const baleData = await baleRes.json();
           if (baleData.ok) {
              results.push({ phone, studentName, status: "SUCCESS" });
              successCount++;
           } else {
              results.push({ phone, studentName, status: "FAILED", error: baleData.description || "خطا در ارسال بله" });
              failedCount++;
           }

        } else if (mode === "NORMAL" || !adminUser?.lookupTemplateAbsent) {
          // Normal mode (Bulk send via Line Number)
          let finalMessage = customMessage || "";
          
          if (!finalMessage) {
            if (status === "ABSENT") {
              finalMessage = \ولی محترم دانش‌آموز \،\nفرزند شما امروز مورخ \ در کلاس \ غایب می‌باشد.\nدبیرستان دوره اول شهید مطهری\;
            } else if (status === "LATE") {
              finalMessage = \ولی محترم دانش‌آموز \،\nفرزند شما امروز مورخ \ با \ دقیقه تاخیر وارد مدرسه شد.\nدبیرستان دوره اول شهید مطهری\;
            } else {
              finalMessage = \ولی محترم دانش‌آموز \،\nفرزند شما امروز مورخ \ در مدرسه حاضر شد.\nدبیرستان دوره اول شهید مطهری\;
            }
          }

          const res = await sendKavenegarNormal({
            apiKey,
            sender,
            receptor: phone,
            message: finalMessage,
          });

          if (res.status === 200) {
            results.push({ phone, studentName, status: "SUCCESS" });
            successCount++;
          } else {
            results.push({ phone, studentName, status: "FAILED", error: res.message || "خطای ارسال" });
            failedCount++;
          }

        } else {
          // Pattern / Template Mode (Kavenegar)
          let templateStr = "";
          let token1 = "", token2 = "", token3 = "";

          if (status === "ABSENT") {
            templateStr = adminUser.lookupTemplateAbsent;
            token1 = studentName.replace(/\s+/g, '-');
            token2 = date.replace(/\//g, '-');
          } else if (status === "LATE") {
            templateStr = adminUser.lookupTemplateLate || adminUser.lookupTemplateAbsent;
            token1 = studentName.replace(/\s+/g, '-');
            token2 = date.replace(/\//g, '-');
            token3 = String(delayMinutes);
          }

          if (!templateStr) {
            throw new Error("قالب مربوطه تنظیم نشده است.");
          }

          const res = await sendKavenegarLookup({
            apiKey,
            receptor: phone,
            template: templateStr,
            token: token1,
            token2: token2,
            token3: token3,
          });

          if (res.status === 200) {
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
          error: err.message || "ارتباط با سرور ناموفق بود.",
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
    console.error("Sending Error:", error);
    return NextResponse.json(
      { error: "خطایی در پردازش درخواست رخ داد." },
      { status: 500 }
    );
  }
}
