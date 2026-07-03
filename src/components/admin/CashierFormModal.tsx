"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Cashier } from "@/types";

type CashierFormModalProps = {
  cashier?: Cashier | null;
  onClose: () => void;
  onSaved: () => void;
};

export function CashierFormModal({ cashier, onClose, onSaved }: CashierFormModalProps) {
  const isEdit = Boolean(cashier);
  const [firstName, setFirstName] = useState(cashier?.firstName ?? "");
  const [lastName, setLastName] = useState(cashier?.lastName ?? "");
  const [personalId, setPersonalId] = useState(cashier?.personalId ?? "");
  const [phone, setPhone] = useState(cashier?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = isEdit ? `/api/cashiers/${cashier!.id}` : "/api/cashiers";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          personalId: personalId || null,
          phone: phone || null,
        }),
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
    <Modal title={isEdit ? "მოლარის რედაქტირება" : "ახალი მოლარის დამატება"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="სახელი"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label="გვარი"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <Input
          label="პირადი ნომერი (არასავალდებულო)"
          value={personalId ?? ""}
          onChange={(e) => setPersonalId(e.target.value)}
        />
        <Input
          label="ტელეფონი (არასავალდებულო)"
          value={phone ?? ""}
          onChange={(e) => setPhone(e.target.value)}
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
