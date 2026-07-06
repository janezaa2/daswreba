"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DownloadAppButton } from "@/components/DownloadAppButton";

export function SiteTopBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="fixed top-4 left-4 z-40 flex items-center gap-2">
      {!isHome && (
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span aria-hidden>←</span>
          მთავარი
        </Link>
      )}
      <DownloadAppButton />
    </div>
  );
}
