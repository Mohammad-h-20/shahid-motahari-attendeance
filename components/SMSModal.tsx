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
      setError("Ù„Ø·ÙØ§Ù‹ Ú©Ù„ÛŒØ¯ ÙˆØ¨â€ŒØ³Ø±ÙˆÛŒØ³ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø± Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯.");
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
        throw new Error(data.error || "Ø®Ø·Ø§ Ø¯Ø± Ø§ØªØµØ§Ù„ Ø¨Ù‡ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø±");
      }

      setKavenegarConfigured(true);
      setShowConfig(false);
      setConfigSuccess("Ú©Ù„ÛŒØ¯ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø± Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø°Ø®ÛŒØ±Ù‡ Ùˆ Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ Ø´Ø¯!");
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
        throw new Error(data.error || "Ø®Ø·Ø§ Ø¯Ø± Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…Ú©");
      }

      setSendResult(data);
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Ø®Ø·Ø§ÛŒÛŒ Ø¯Ø± Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…Ú© Ø±Ø® Ø¯Ø§Ø¯.");
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
                <span>Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù… Ø¨Ù‡ Ø§ÙˆÙ„ÛŒØ§</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-full">
                  ÙˆØ¨â€ŒØ³Ø±ÙˆÛŒØ³ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø±
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…Ú© Ø²Ù†Ø¯Ù‡ Ø¨Ù‡ ØªÙ„ÙÙ† Ù‡Ù…Ø±Ø§Ù‡ ÙˆØ§Ù„Ø¯ÛŒÙ† Ø¯Ø§Ù†Ø´â€ŒØ¢Ù…ÙˆØ²Ø§Ù† ØºØ§ÛŒØ¨ Ùˆ ØªØ§Ø®ÛŒØ±ÛŒ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="ØªÙ†Ø¸ÛŒÙ…Ø§Øª ÙˆØ¨â€ŒØ³Ø±ÙˆÛŒØ³ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø±"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">ØªÙ†Ø¸ÛŒÙ… Ú©Ù„ÛŒØ¯</span>
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
                <span>ØªÙ†Ø¸ÛŒÙ… Ú©Ù„ÛŒØ¯ ÙˆØ¨â€ŒØ³Ø±ÙˆÛŒØ³ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø± (API Key)</span>
              </span>
              <a
                href="https://panel.kavenegar.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1"
              >
                <span>Ù¾Ù†Ù„ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø±</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Ú©Ù„ÛŒØ¯ API Ø±Ø§ Ø§ÛŒÙ†Ø¬Ø§ Ù¾ÛŒØ³Øª Ú©Ù†ÛŒØ¯..."
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
                  placeholder="Ø´Ù…Ø§Ø±Ù‡ Ø®Ø· (Ù…Ø«Ø§Ù„: 2000660110)"
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
                Ø¨Ø³ØªÙ†
              </button>
              <button
                type="submit"
                disabled={savingKey}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>ØªØ§ÛŒÛŒØ¯ Ùˆ Ø§ØªØµØ§Ù„ Ø¨Ù‡ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø±</span>
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
              Ù¾ÛŒØ§Ù…Ú©â€ŒÙ‡Ø§ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¨Ù‡ Ø³Ø±ÙˆØ± Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø± ØªØ­ÙˆÛŒÙ„ Ø¯Ø§Ø¯Ù‡ Ø´Ø¯Ù†Ø¯
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              ØªØ¹Ø¯Ø§Ø¯ {toPersianDigits(sendResult?.successCount || studentsWithIssues.length)} Ù¾ÛŒØ§Ù…Ú© Ù…ÙˆÙÙ‚ Ø¨Ù‡ Ø´Ù…Ø§Ø±Ù‡ Ù‡Ù…Ø±Ø§Ù‡ Ø§ÙˆÙ„ÛŒØ§ÛŒ Ø¯Ø§Ù†Ø´â€ŒØ¢Ù…ÙˆØ²Ø§Ù† Ø§Ø±Ø³Ø§Ù„ Ø´Ø¯.
            </p>

            {sendResult?.failedCount > 0 && (
              <p className="text-xs text-rose-500 font-medium">
                ØªØ¹Ø¯Ø§Ø¯ {toPersianDigits(sendResult.failedCount)} Ø´Ù…Ø§Ø±Ù‡ Ø¨Ù‡ Ø¯Ù„ÛŒÙ„ Ø®Ø·Ø§ ÛŒØ§ Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø¨ÙˆØ¯Ù† Ø§Ø±Ø³Ø§Ù„ Ù†Ø´Ø¯.
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
                Ø¨Ø³ØªÙ† Ù¾Ù†Ø¬Ø±Ù‡
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm flex-1 flex flex-col min-h-0">
            {studentsWithIssues.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-3xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  ØªÙ…Ø§Ù…ÛŒ Ø¯Ø§Ù†Ø´â€ŒØ¢Ù…ÙˆØ²Ø§Ù† Ø­Ø§Ø¶Ø± Ù‡Ø³ØªÙ†Ø¯!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Ù‡ÛŒÚ† Ù…ÙˆØ±Ø¯ ØºÛŒØ¨Øª ÛŒØ§ ØªØ§Ø®ÛŒØ±ÛŒ Ø¨Ø±Ø§ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…Ú© Ø¯Ø± ØªØ§Ø±ÛŒØ® {toPersianDigits(date)} ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.
                </p>
              </div>
            ) : (
              <>
                <div className="text-xs text-slate-500 flex items-center justify-between flex-shrink-0">
                  <span>Ù„ÛŒØ³Øª Ø¯Ø§Ù†Ø´â€ŒØ¢Ù…ÙˆØ²Ø§Ù† Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ Ø§Ø·Ù„Ø§Ø¹â€ŒØ±Ø³Ø§Ù†ÛŒ:</span>
                  <span className="font-bold text-amber-600">
                    {toPersianDigits(studentsWithIssues.length)} Ù…ÙˆØ±Ø¯ ØºØ§ÛŒØ¨ ÛŒØ§ Ø¯Ø§Ø±Ø§ÛŒ ØªØ§Ø®ÛŒØ±
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
                              <AlertTriangle className="w-3 h-3" /> ØºØ§ÛŒØ¨
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 font-medium">
                              <Clock className="w-3 h-3" /> ØªØ§Ø®ÛŒØ± ({toPersianDigits(s.delayMinutes || 0)} Ø¯Ù‚ÛŒÙ‚Ù‡)
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono" dir="ltr">
                          {s.phone}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                        {s.status === "ABSENT"
                          ? `Â«ÙˆÙ„ÛŒ Ù…Ø­ØªØ±Ù… ${s.firstName} ${s.lastName}ØŒ Ø¨Ù‡ Ø§Ø·Ù„Ø§Ø¹ Ù…ÛŒâ€ŒØ±Ø³Ø§Ù†Ø¯ ÙØ±Ø²Ù†Ø¯ Ø´Ù…Ø§ Ø¯Ø± ØªØ§Ø±ÛŒØ® ${toPersianDigits(date)} Ø¯Ø± Ú©Ù„Ø§Ø³ ${classNameTitle} Ø¯Ø¨ÛŒØ±Ø³ØªØ§Ù† Ø¯Ø®ØªØ±Ø§Ù†Ù‡ Ø´Ù‡ÛŒØ¯ Ù…Ø·Ù‡Ø±ÛŒ ØºØ§ÛŒØ¨ Ø¨ÙˆØ¯Ù‡ Ø§Ø³Øª.Â»`
                          : `Â«ÙˆÙ„ÛŒ Ù…Ø­ØªØ±Ù… ${s.firstName} ${s.lastName}ØŒ Ø¨Ù‡ Ø§Ø·Ù„Ø§Ø¹ Ù…ÛŒâ€ŒØ±Ø³Ø§Ù†Ø¯ ÙØ±Ø²Ù†Ø¯ Ø´Ù…Ø§ Ø¯Ø± ØªØ§Ø±ÛŒØ® ${toPersianDigits(date)} Ø¨Ø§ ${toPersianDigits(s.delayMinutes || 0)} Ø¯Ù‚ÛŒÙ‚Ù‡ ØªØ§Ø®ÛŒØ± Ø¯Ø± Ú©Ù„Ø§Ø³ Ø­Ø¶ÙˆØ± ÛŒØ§ÙØª.Â»`}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${kavenegarConfigured ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`}></span>
                    <span>{kavenegarConfigured ? "ÙˆØ¨â€ŒØ³Ø±ÙˆÛŒØ³ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø± ÙØ¹Ø§Ù„ Ø§Ø³Øª" : "Ú©Ù„ÛŒØ¯ Ú©Ø§ÙˆÙ‡ Ù†Ú¯Ø§Ø± Ù‡Ù†ÙˆØ² ØªÙ†Ø¸ÛŒÙ… Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
                    >
                      Ø§Ù†ØµØ±Ø§Ù
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
                          <span>Ø¯Ø± Ø­Ø§Ù„ Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ§Ù…Ú©â€ŒÙ‡Ø§...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Ø§Ø±Ø³Ø§Ù„ ÙˆØ§Ù‚Ø¹ÛŒ Ù¾ÛŒØ§Ù…Ú©â€ŒÙ‡Ø§</span>
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

