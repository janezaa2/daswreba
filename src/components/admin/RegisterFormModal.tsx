"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { CashRegister } from "@/types";

type RegisterFormModalProps = {
  register?: CashRegister | null;
  onClose: () => void;
  onSaved: () => void;
};

export function RegisterFormModal({ register, onClose, onSaved }: RegisterFormModalProps) {
  const isEdit = Boolean(register);
  const [name, setName] = useState(register?.name ?? "");
  const [registerNumber, setRegisterNumber] = useState(register?.registerNumber ?? "");
  const [zone, setZone] = useState(register?.zone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = isEdit ? `/api/registers/${register!.id}` : "/api/registers";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, registerNumber, zone: zone || null }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "შენახვა ვერ მოხერხდა");
        return;
      }
      onSaved();
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={isEdit ? "სალაროს რედაქტირება" : "ახალი სალაროს დამატება"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="სალაროს სახელი"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="სალაროს ნომერი"
          value={registerNumber}
          onChange={(e) => setRegisterNumber(e.target.value)}
          required
        />
        <Input
          label="ლოკაცია/ზონა (არასავალდებულო)"
          value={zone ?? ""}
          onChange={(e) => setZone(e.target.value)}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            გაუქმება
          </Button>
          <Button type="submit" loading={loading}>
            შენახვა
          </Button>
        </div>
      </form>
    </Modal>
  );
}
