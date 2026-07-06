import Link from "next/link";
import { SiteTopBar } from "@/components/SiteTopBar";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <SiteTopBar />
      <div className="space-y-2">
        <p className="text-sm font-medium tracking-wide text-emerald-600 uppercase">
          მრავალი კომპანიისთვის
        </p>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          დასწრების აღრიცხვის სისტემა
        </h1>
        <p className="max-w-md text-slate-500">
          აირჩიეთ თქვენი როლი სისტემაში შესასვლელად
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/check-in"
          className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-600 px-6 py-6 text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98]"
        >
          <span className="text-lg font-semibold">მოლარის დასწრება</span>
          <span className="text-sm text-emerald-100">
            შედით უნიკალური კოდით და დააფიქსირეთ დასწრება
          </span>
        </Link>

        <Link
          href="/login"
          className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-6 py-6 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
        >
          <span className="text-lg font-semibold">შესვლა</span>
          <span className="text-sm text-slate-400">
            კომპანიის ან საიტის ადმინისტრატორის ანგარიშით
          </span>
        </Link>

        <Link
          href="/register"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          ახალი კომპანიის რეგისტრაცია →
        </Link>
      </div>

      <div className="flex gap-4 text-sm text-slate-400">
        <Link href="/about" className="hover:text-slate-600 hover:underline">
          ჩვენს შესახებ
        </Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-slate-600 hover:underline">
          კონტაქტი
        </Link>
      </div>
    </main>
  );
}
