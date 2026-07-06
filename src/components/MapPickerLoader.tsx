"use client";

import dynamic from "next/dynamic";

export const MapPicker = dynamic(
  () => import("@/components/MapPicker").then((mod) => mod.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-400">
        რუკა იტვირთება...
      </div>
    ),
  },
);
