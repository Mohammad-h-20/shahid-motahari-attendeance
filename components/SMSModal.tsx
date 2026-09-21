"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Key,
  Settings,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toPersianDigits } from "@/lib/jalali";

interface SMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameTitle: string;
  date: string;
  studentsWithIssues: Array<{
    firstName: string;
    lastName: string;
    phone: string;
    status: string;
    delayMinutes?: number;
    notes?: string;
  }>;
}

export default function SMSModal({
  isOpen,
  onClose,
  classNameTitle,
  date,
  studentsWithIssues,
}: SMSModalProps) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [kavenegarConfigured, setKavenegarConfigured] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [senderInput, setSenderInput] = useState("2000660110");
  const [showConfig, setShowConfig] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [configSuccess, setConfigSuccess] = useState("");
  const [error, setError] = useState("");
  const [sendResult, setSendResult] = useState<any>(null);

  // Check if Kavenegar is configured
  const checkConfig = async () => {
    try {
      const res = await fetch("/api/sms/settings");
      const data = await res.json();
      if (data.configured) {
        setKavenegarConfigured(true);
        if (data.sender) setSenderInput(data.sender);
      } else {
        setKavenegarConfigured(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkConfig();
      setSent(false);
      setError("");
      setSendResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Save Kavenegar API key
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setError("لطفاً کلید وب‌سرویس کاوه نگار را وارد کنید.");
      return;
    }

    setSavingKey(true);
    setError("");

    try {
      const res = await fetch("/api/sms/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kavenegarApiKey: apiKeyInput.trim(),
          kavenegarSender: senderInput.trim() || "2000660110",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "خطا در اتصال به کاوه نگار");
      }

      setKavenegarConfigured(true);
      setShowConfig(false);
      setConfigSuccess("کلید کاوه نگار با موفقیت ذخیره و اعتبارسنجی شد!");
      setTimeout(() => setConfigSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingKey(false);
    }
  };

  // Real SMS Sending via API
  const handleSend = async () => {
    setSending(true);
    setError("");

    const recipients = studentsWithIssues.map((s) => ({
      studentName: `${s.firstName} ${s.lastName}`,
      phone: s.phone,
      status: s.status,
      delayMinutes: s.delayMinutes || 0,
      className: classNameTitle,
      date,
    }));

    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needConfig) {
          setShowConfig(true);
        }
        throw new Error(data.error || "خطا در ارسال پیامک");
      }

      setSendResult(data);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "خطایی در ارسال پیامک رخ داد.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative transition-all max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>ارسال پیامک واقعی به اولیا</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-full">
                  وب‌سرویس کاوه نگار
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ارسال پیامک زنده به تلفن همراه والدین دانش‌آموزان غایب و تاخیری
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="تنظیمات وب‌سرویس کاوه نگار"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">تنظیم کلید</span>
          </button>
        </div>

        {/* Kavenegar Quick Config Form (if toggled or needed) */}
        {showConfig && (
          <form
            onSubmit={handleSaveConfig}
            className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 flex-shrink-0 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" />
                <span>تنظیم کلید وب‌سرویس کاوه نگار (API Key)</span>
              </span>
              <a
                href="https://panel.kavenegar.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
              >
                <span>پنل کاوه نگار</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="کلید API را اینجا پیست کنید..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="شماره خط (مثال: 2000660110)"
                  value={senderInput}
                  onChange={(e) => setSenderInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                بستن
              </button>
              <button
                type="submit"
                disabled={savingKey}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>تایید و اتصال به کاوه نگار</span>
              </button>
            </div>
          </form>
        )}

        {configSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{configSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs rounded-2xl flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Main Content */}
        {sent ? (
          <div className="py-8 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              پیامک‌ها با موفقیت به سرور کاوه نگار تحویل داده شدند
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              تعداد {toPersianDigits(sendResult?.successCount || studentsWithIssues.length)} پیامک موفق به شماره همراه اولیای دانش‌آموزان ارسال شد.
            </p>

            {sendResult?.failedCount > 0 && (
              <p className="text-xs text-rose-500 font-medium">
                تعداد {toPersianDigits(sendResult.failedCount)} شماره به دلیل خطا یا نامعتبر بودن ارسال نشد.
              </p>
            )}

            <div className="pt-4">
              <button
                onClick={() => {
                  setSent(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm flex-1 flex flex-col min-h-0">
            {studentsWithIssues.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-3xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  تمامی دانش‌آموزان حاضر هستند!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  هیچ مورد غیبت یا تاخیری برای ارسال پیامک در تاریخ {toPersianDigits(date)} وجود ندارد.
                </p>
              </div>
            ) : (
              <>
                <div className="text-xs text-slate-500 flex items-center justify-between flex-shrink-0">
                  <span>لیست دانش‌آموزان نیازمند اطلاع‌رسانی:</span>
                  <span className="font-bold text-amber-600">
                    {toPersianDigits(studentsWithIssues.length)} مورد غایب یا دارای تاخیر
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[140px]">
                  {studentsWithIssues.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span>{s.firstName} {s.lastName}</span>
                          {s.status === "ABSENT" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-600 font-medium">
                              <AlertTriangle className="w-3 h-3" /> غایب
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 font-medium">
                              <Clock className="w-3 h-3" /> تاخیر ({toPersianDigits(s.delayMinutes || 0)} دقیقه)
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono" dir="ltr">
                          {s.phone}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                        {s.status === "ABSENT"
                          ? `«ولی محترم ${s.firstName} ${s.lastName}، به اطلاع می‌رساند فرزند شما در تاریخ ${toPersianDigits(date)} در کلاس ${classNameTitle} دبیرستان دخترانه شهید مطهری غایب بوده است.»`
                          : `«ولی محترم ${s.firstName} ${s.lastName}، به اطلاع می‌رساند فرزند شما در تاریخ ${toPersianDigits(date)} با ${toPersianDigits(s.delayMinutes || 0)} دقیقه تاخیر در کلاس حضور یافت.»`}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${kavenegarConfigured ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`}></span>
                    <span>{kavenegarConfigured ? "وب‌سرویس کاوه نگار فعال است" : "کلید کاوه نگار هنوز تنظیم نشده است"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
                    >
                      انصراف
                    </button>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={sending}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all disabled:opacity-50"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>در حال ارسال پیامک‌ها...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>ارسال واقعی پیامک‌ها</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
