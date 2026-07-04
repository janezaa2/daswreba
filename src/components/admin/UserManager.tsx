"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { UserFormModal, type AdminUserRow } from "@/components/admin/UserFormModal";

const ROLE_LABEL: Record<AdminUserRow["role"], string> = {
  platform_admin: "საიტის ადმინი",
  company_user: "კომპანიის მომხმარებელი",
};

export function UserManager() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "ჩატვირთვა ვერ მოხერხდა");
        return;
      }
      setUsers(data.users);
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-slate-900">მომხმარებლების მართვა</h2>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">მომხმარებელი</th>
              <th className="px-4 py-3 font-medium">როლი</th>
              <th className="px-4 py-3 font-medium">კომპანია</th>
              <th className="px-4 py-3 font-medium">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  იტვირთება...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  მომხმარებლები არ არის
                </td>
              </tr>
            )}
            {!loading &&
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-slate-900">
                    {user.username}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{ROLE_LABEL[user.role]}</td>
                  <td className="px-4 py-3 text-slate-500">{user.company?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      className="px-2 py-1"
                      onClick={() => setEditingUser(user)}
                    >
                      რედაქტირება
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <UserFormModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}
