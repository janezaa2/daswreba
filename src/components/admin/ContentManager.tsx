"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Field";
import type { SiteContentBlock, SiteContentPageKey } from "@/types";

const TABS: { key: SiteContentPageKey; label: string }[] = [
  { key: "about", label: "ჩვენს შესახებ" },
  { key: "contact", label: "კონტაქტი" },
];

type Draft = { title: string; body: string; order: string };
const EMPTY_DRAFT: Draft = { title: "", body: "", order: "0" };

export function ContentManager() {
  const [activeTab, setActiveTab] = useState<SiteContentPageKey>("about");
  const [blocks, setBlocks] = useState<SiteContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<
    { mode: "create" } | { mode: "edit"; block: SiteContentBlock } | null
  >(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadBlocks() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/site-content?page=${activeTab}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "ჩატვირთვა ვერ მოხერხდა");
        return;
      }
      setBlocks(data.blocks);
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function openCreate() {
    setDraft({ ...EMPTY_DRAFT, order: blocks.length.toString() });
    setModalState({ mode: "create" });
  }

  function openEdit(block: SiteContentBlock) {
    setDraft({ title: block.title, body: block.body, order: block.order.toString() });
    setModalState({ mode: "edit", block });
  }

  async function handleSave() {
    if (!draft.title.trim() || !draft.body.trim()) {
      setError("სათაური და ტექსტი აუცილებელია");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const isEdit = modalState?.mode === "edit";
      const url = isEdit ? `/api/site-content/${modalState.block.id}` : "/api/site-content";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit
        ? { title: draft.title.trim(), body: draft.body.trim(), order: Number(draft.order) || 0 }
        : { page: activeTab, title: draft.title.trim(), body: draft.body.trim(), order: Number(draft.order) || 0 };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "შენახვა ვერ მოხერხდა");
        return;
      }
      setModalState(null);
      await loadBlocks();
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(block: SiteContentBlock) {
    if (!confirm(`წავშალო "${block.title}"?`)) return;
    setBusyId(block.id);
    try {
      await fetch(`/api/site-content/${block.id}`, { method: "DELETE" });
      await loadBlocks();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-slate-900">საიტის კონტენტი</h2>

      <div className="flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          გვერდი: <span className="font-medium">{TABS.find((t) => t.key === activeTab)?.label}</span>
        </p>
        <Button onClick={openCreate}>+ ბლოკის დამატება</Button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {loading && <p className="text-sm text-slate-400">იტვირთება...</p>}

      {!loading && blocks.length === 0 && (
        <p className="text-sm text-slate-400">ბლოკები არ არის დამატებული</p>
      )}

      {!loading && blocks.length > 0 && (
        <div className="flex flex-col gap-3">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{block.title}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" className="px-2 py-1" onClick={() => openEdit(block)}>
                    რედაქტირება
                  </Button>
                  <Button
                    variant="danger"
                    className="px-2 py-1"
                    loading={busyId === block.id}
                    onClick={() => handleDelete(block)}
                  >
                    წაშლა
                  </Button>
                </div>
              </div>
              <p className="whitespace-pre-line text-sm text-slate-600">{block.body}</p>
            </div>
          ))}
        </div>
      )}

      {modalState && (
        <Modal
          title={modalState.mode === "edit" ? "ბლოკის რედაქტირება" : "ახალი ბლოკის დამატება"}
          onClose={() => setModalState(null)}
          maxWidth="max-w-lg"
        >
          <div className="flex flex-col gap-4">
            <Input
              label="სათაური"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">ტექსტი</span>
              <textarea
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                rows={6}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              />
            </label>
            <Input
              label="თანმიმდევრობა (რიცხვი, პატარა = უფრო ზემოთ)"
              value={draft.order}
              onChange={(e) => setDraft({ ...draft, order: e.target.value })}
            />

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModalState(null)}>
                გაუქმება
              </Button>
              <Button type="button" loading={saving} onClick={handleSave}>
                შენახვა
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
