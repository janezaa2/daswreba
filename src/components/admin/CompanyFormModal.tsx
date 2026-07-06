"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type CompanyRow = {
  id: string;
  name: string;
  identificationCode: string | null;
  adminUsers: { id: string; username: string }[];
};

type CompanyFormModalProps = {
  company: CompanyRow;
  onClose: () => void;
  onSaved: () => void;
};

export function CompanyFormModal({ company, onClose, onSaved }: CompanyFormModalProps) {
  const [name, setName] = useState(company.name);
  const [identificationCode, setIdentificationCode] = useState(company.identificationCode ?? "");
  const [username, setUsername] = useState(company.adminUsers[0]?.username ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          identificationCode: identificationCode || undefined,
          username: username || undefined,
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
    <Modal title="კომპანიის რედაქტირება" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="კომპანიის სახელი"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="საიდენტიფიკაციო კოდი (9 ციფრი)"
          value={identificationCode}
          onChange={(e) => setIdentificationCode(e.target.value.replace(/\D/g, "").slice(0, 9))}
          inputMode="numeric"
          maxLength={9}
        />
        <Input
          label="მომხმარებლის სახელი (login username)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
