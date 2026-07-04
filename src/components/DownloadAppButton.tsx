"use client";

import { useState } from "react";
import QRCode from "qrcode";

const APK_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_ANDROID_APK_URL ||
  "https://expo.dev/artifacts/eas/-f5AHyytVEGZDl-8KyOAi8K3heF5GGMciMzo9F0Xhuo.apk";

export function DownloadAppButton() {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setOpen(true);
    if (qrDataUrl) return;
    setLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(APK_DOWNLOAD_URL, {
        width: 240,
        margin: 1,
      });
      setQrDataUrl(dataUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed top-4 left-4 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
      >
        <span aria-hidden>⬇</span>
        გადმოწერა
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Android აპლიკაციის გადმოწერა
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              დაასკანერეთ QR კოდი მობილურით
            </p>

            <div className="mt-4 flex items-center justify-center">
              {loading && (
                <div className="flex h-60 w-60 items-center justify-center">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                </div>
              )}
              {qrDataUrl && !loading && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="QR კოდი აპლიკაციის გადმოსაწერად" width={240} height={240} />
              )}
            </div>

            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              პირდაპირი ბმული
            </a>

            <button
              onClick={() => setOpen(false)}
              className="mt-3 text-sm text-slate-400 hover:text-slate-600"
            >
              დახურვა
            </button>
          </div>
        </div>
      )}
    </>
  );
}
