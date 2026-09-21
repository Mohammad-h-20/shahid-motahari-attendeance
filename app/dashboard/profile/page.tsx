"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  Loader2,
  Lock,
  MessageSquare,
  Key,
  ExternalLink,
  Coins,
  RefreshCw,
} from "lucide-react";
import { toPersianDigits } from "@/lib/jalali";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Kavenegar SMS Settings
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsSender, setSmsSender] = useState("2000660110");
  const [smsMode, setSmsMode] = useState("NORMAL");
  const [templateAbsent, setTemplateAbsent] = useState("");
  const [templateLate, setTemplateLate] = useState("");
  const [smsBalance, setSmsBalance] = useState<any>(null);
  const [smsConnected, setSmsConnected] = useState(false);
  const [savingSms, setSavingSms] = useState(false);
  const [smsSuccessMsg, setSmsSuccessMsg] = useState("");
  const [smsErrorMsg, setSmsErrorMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, smsRes] = await Promise.all([
        fetch("/api/auth/profile"),
        fetch("/api/sms/settings"),
      ]);

      const profData = await profRes.json();
      if (profRes.ok) {
        setProfile(profData);
        setFullName(profData.fullName || "مدیریت مدرسه شهید مطهری");
        setUsername(profData.username || "123456");
      }

      const smsData = await smsRes.json();
      if (smsRes.ok) {
        setSmsApiKey(smsData.rawApiKey || "");
        if (smsData.sender) setSmsSender(smsData.sender);
        if (smsData.smsMode) setSmsMode(smsData.smsMode);
        if (smsData.lookupTemplateAbsent) setTemplateAbsent(smsData.lookupTemplateAbsent);
        if (smsData.lookupTemplateLate) setTemplateLate(smsData.lookupTemplateLate);
        setSmsBalance(smsData.balanceInfo);
        setSmsConnected(smsData.isConnected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg("رمز عبور جدید با تکرار آن یکسان نیست.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          username,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "خطا در به‌روزرسانی اطلاعات");
      }

      setSuccessMsg(data.message || "اطلاعات و رمز عبور با موفقیت به‌روزرسانی شد.");
      if (data.user) {
        setProfile(data.user);
        setUsername(data.user.username);
        setFullName(data.user.fullName);
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "خطایی رخ داد.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsErrorMsg("");
    setSmsSuccessMsg("");
    setSavingSms(true);

    try {
      const res = await fetch("/api/sms/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kavenegarApiKey: smsApiKey,
          kavenegarSender: smsSender,
          smsMode,
          lookupTemplateAbsent: templateAbsent,
          lookupTemplateLate: templateLate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "خطا در اتصال به sms.ir");
      }

      setSmsSuccessMsg(data.message || "تنظیمات وب‌سرویس پیامک با موفقیت ذخیره شد.");
      setSmsConnected(true);
      if (data.accountInfo) setSmsBalance(data.accountInfo);
    } catch (err: any) {
      setSmsErrorMsg(err.message || "خطا در ذخیره تنظیمات sms.ir");
    } finally {
      setSavingSms(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
              پیشخوان
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              پروفایل، امنیت و وب‌سرویس پیامک
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-600" />
            <span>تنظیمات حساب کاربری و سامانه پیامک</span>
          </h1>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>پیشخوان</span>
        </Link>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            مدرسه
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {profile?.fullName || "مدیریت دبیرستان دخترانه شهید مطهری"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              نام کاربری سامانه: <strong className="font-mono text-emerald-600">{profile?.username || "123456"}</strong> • نقش: مدیر کل سیستم
            </p>
          </div>
        </div>

        <div className="text-left hidden sm:block">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${smsConnected ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300" : "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"}`}>
            <span className={`w-2 h-2 rounded-full ${smsConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}></span>
            <span>{smsConnected ? "sms.ir متصل" : "sms.ir در انتظار کلید"}</span>
          </span>
        </div>
      </div>

      {/* Kavenegar SMS Settings Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>تنظیمات وب‌سرویس پیامک sms.ir</span>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md font-bold">
                  SMS.ir API
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ارسال پیامک واقعی غیبت و تاخیر به تلفن همراه اولیا
              </p>
            </div>
          </div>

          <a
            href="https://panel.sms.ir"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
          >
            <span>ورود به پنل sms.ir</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {smsSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{smsSuccessMsg}</span>
          </div>
        )}

        {smsErrorMsg && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{smsErrorMsg}</span>
          </div>
        )}

        {smsBalance && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200 font-bold">
              <Coins className="w-4 h-4 text-blue-600" />
              <span>اتصال به پنل sms.ir موفقیت آمیز بود.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveSmsSettings} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>کلید وب‌سرویس اختصاصی (API Key) <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal">از منوی برنامه‌نویسان در پنل sms.ir</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={smsApiKey}
                onChange={(e) => setSmsApiKey(e.target.value)}
                placeholder="مثال: 4A5934...4D3D"
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                شماره خط اختصاصی فرستنده (Sender)
              </label>
              <input
                type="text"
                value={smsSender}
                onChange={(e) => setSmsSender(e.target.value)}
                placeholder="مثال: 2000660110"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نحوه ارسال پیامک
              </label>
              <select
                value={smsMode}
                onChange={(e) => setSmsMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NORMAL">ارسال متن عادی (پیش‌فرض)</option>
                <option value="PATTERN">ارسال بر اساس الگو/پترن سریع</option>
              </select>
            </div>
          </div>

          {smsMode === "PATTERN" && (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-200/60 dark:border-blue-800/60 space-y-3 animate-in fade-in">
              <div className="text-[11px] text-blue-800 dark:text-blue-300 font-semibold">
                شناسه عددی الگوهای ثبت‌شده در sms.ir را وارد کنید (پارامترها باید NAME و DATE باشند):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    شناسه الگوی غیبت (Template ID)
                  </label>
                  <input
                    type="text"
                    value={templateAbsent}
                    onChange={(e) => setTemplateAbsent(e.target.value)}
                    placeholder="مثال: 100000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    شناسه الگوی تاخیر (Template ID)
                  </label>
                  <input
                    type="text"
                    value={templateLate}
                    onChange={(e) => setTemplateLate(e.target.value)}
                    placeholder="مثال: 100001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={savingSms}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {savingSms ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ذخیره در sms.ir</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              تغییر کلمه عبور و مشخصات مدیر
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              برای تغییر رمز عبور سامانه، رمز قبلی و رمز جدید را وارد نمایید.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نام و عنوان نمایشی
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نام کاربری ورود به سامانه
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
                dir="ltr"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رمز عبور فعلی <span className="text-slate-400 font-normal">(رمز کنونی سیستم)</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                رمز عبور جدید
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                تکرار رمز عبور جدید
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
                dir="ltr"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>ذخیره اطلاعات و تغییر رمز عبور</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
