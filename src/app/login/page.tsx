"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "შესვლა ვერ მოხერხდა");
        return;
      }
      const destination = data.admin.role === "platform_admin" ? "/admin/dashboard" : "/company/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="mt-1 text-2xl font-bold text-slate-900">შესვლა</h1>
          <p className="mt-1 text-sm text-slate-500">კომპანიის ან ადმინისტრატორის ანგარიშით</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="მომხმარებლის სახელი"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
          <Input
            label="პაროლი"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="mt-2 w-full">
            შესვლა
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          არ გაქვთ ანგარიში?{" "}
          <Link href="/register" className="font-medium text-emerald-600 hover:underline">
            დაარეგისტრირეთ თქვენი კომპანია
          </Link>
        </p>
      </div>
    </main>
  );
}
