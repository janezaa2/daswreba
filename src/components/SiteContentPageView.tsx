"use client";

import { useEffect, useState } from "react";
import { SiteTopBar } from "@/components/SiteTopBar";
import type { SiteContentBlock, SiteContentPageKey } from "@/types";

const PAGE_TITLES: Record<SiteContentPageKey, string> = {
  about: "ჩვენს შესახებ",
  contact: "კონტაქტი",
};

export function SiteContentPageView({ page }: { page: SiteContentPageKey }) {
  const [blocks, setBlocks] = useState<SiteContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/site-content?page=${page}`)
      .then((r) => r.json())
      .then((data) => setBlocks(data.blocks || []))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-20">
      <SiteTopBar />
      <div className="w-full max-w-2xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-slate-900">
          {PAGE_TITLES[page]}
        </h1>

        {loading && <p className="text-center text-slate-400">იტვირთება...</p>}

        {!loading && blocks.length === 0 && (
          <p className="text-center text-slate-400">ინფორმაცია ჯერ არ არის დამატებული</p>
        )}

        <div className="flex flex-col gap-6">
          {blocks.map((block) => (
            <div key={block.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">{block.title}</h2>
              <p className="whitespace-pre-line text-slate-600">{block.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
