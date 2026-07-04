"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export type AdminUserRow = {
  id: string;
  username: string;
  role: "platform_admin" | "company_user";
  companyId: string | null;
  createdAt: string;
  company: { id: string; name: string; status: string } | null;
};

type UserFormModalProps = {
  user: AdminUserRow;
  onClose: () => void;
  onSaved: () => void;
};

export function UserFormModal({ user, onClose, onSaved }: UserFormModalProps) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          ...(password ? { password } : {}),
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
    <Modal title="მომხმარებლის რედაქტირება" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="მომხმარებლის სახელი"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          label="ახალი პაროლი (არასავალდებულო)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="დატოვეთ ცარიელი, თუ არ გსურთ შეცვლა"
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
