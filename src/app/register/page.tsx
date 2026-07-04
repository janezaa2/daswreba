"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await fetch("/api/company/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "რეგისტრაცია ვერ მოხერხდა");
        return;
      }
      setSuccess(data.message);
      setCompanyName("");
      setUsername("");
      setPassword("");
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
          <h1 className="mt-1 text-2xl font-bold text-slate-900">კომპანიის რეგისტრაცია</h1>
          <p className="mt-1 text-sm text-slate-500">
            დაარეგისტრირეთ თქვენი კომპანია დასწრების აღრიცხვის სისტემაში
          </p>
        </div>

        {success ? (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="კომპანიის დასახელება"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoFocus
              required
            />
            <Input
              label="მომხმარებლის სახელი"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              რეგისტრაცია
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          უკვე გაქვთ ანგარიში?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline">
            შესვლა
          </Link>
        </p>
      </div>
    </main>
  );
}
