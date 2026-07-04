# დასწრების აღრიცხვის სისტემა (მრავალკომპანიური)

მოლარეების დასწრების აღრიცხვის ვებ სისტემა, რომელიც ჩაანაცვლებს fingerprint მოწყობილობას: მოლარე შედის უნიკალური კოდით, აჭერს ვირტუალურ "თითის" ღილაკს, სისტემა იღებს მისი მობილურის GPS ლოკაციას და ირჩევს სალაროს — ასე ფიქსირდება დღიური დასწრება.

სისტემა მრავალკომპანიურია (multi-tenant): ნებისმიერ კომპანიას შეუძლია დარეგისტრირდეს და დამოუკიდებლად მართოს საკუთარი მოლარეები/სალაროები/დასწრება.

## ტექნოლოგიები

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM 6 + SQLite (`prisma/dev.db`)
- jose (JWT სესიისთვის), bcryptjs (პაროლის ჰეშირება)
- xlsx (Excel გატანა)

## გაშვება VS Code-ში

```bash
npm install
cp .env.example .env      # PowerShell-ზე: Copy-Item .env.example .env
npm run db:migrate        # ქმნის SQLite ბაზას და ცხრილებს
npm run db:seed           # ამატებს საიტის ადმინს, სატესტო კომპანიას, სალაროებსა და მოლარეებს
npm run dev
```

გახსენით http://localhost:3000

## როლები

1. **პლატფორმის ადმინისტრატორი (`platform_admin`)** — მართავს მთელ საიტს: ამტკიცებს/აუქმებს კომპანიების რეგისტრაციას. გვერდები: `/admin/dashboard`, `/admin/companies`.
2. **კომპანიის მომხმარებელი (`company_user`)** — მართავს მხოლოდ საკუთარი კომპანიის მოლარეებს, სალაროებს, დასწრებას და პარამეტრებს. გვერდები: `/company/dashboard`, `/company/cashiers`, `/company/registers`, `/company/attendance`, `/company/settings`.

ორივე შედის ერთი საერთო `/login` გვერდიდან — შესვლის შემდეგ როლის მიხედვით გადამისამართდება.

## საწყისი მონაცემები (seed)

- **პლატფორმის ადმინი:** `/login` — `superadmin` / `super123`
- **სატესტო კომპანია "მთაწმინდის პარკი":** `/login` — `admin` / `admin123`
- **სატესტო მოლარის კოდები:** `MP-100001`, `MP-100002`, `MP-100003` — გამოსაყენებელია `/check-in` გვერდზე
- სატესტო სალაროები: მთავარი შესასვლელი, ატრაქციონების ზონა, კაფე ბარი

`.env` ფაილში (`SEED_PLATFORM_ADMIN_USERNAME/PASSWORD`, `SEED_COMPANY_ADMIN_USERNAME/PASSWORD`) შეგიძლიათ შეცვალოთ საწყისი მონაცემები ხელახალი სიდის გაშვებამდე.

## გვერდები

- `/` — მთავარი გვერდი
- `/check-in` — მოლარის დასწრების დაფიქსირება (კოდი → GPS → სალარო → დადასტურება)
- `/register` — ახალი კომპანიის რეგისტრაცია (საჭიროებს ადმინის დამტკიცებას)
- `/login` — შესვლა (როლის მიხედვით გადამისამართება)
- `/admin/*` — პლატფორმის ადმინისტრატორის პანელი
- `/company/*` — კომპანიის მართვის პანელი (ყოფილი `/admin/*`, ცალკე გატანილი multi-tenant-ზე გადასვლისას)

## Mobile API (Android აპისთვის)

მოლარის check-in ასევე ხელმისაწვდომია Android აპლიკაციიდან (იხ. სეპარატული პროექტი `../cashier-android-app`) — იმავე database-ს იყენებს:

| Method | Path | Auth |
|---|---|---|
| POST | `/api/mobile/verify-code` | — |
| GET | `/api/mobile/registers` | Bearer token |
| GET | `/api/mobile/today-status` | Bearer token |
| POST | `/api/mobile/attendance/check-in` | Bearer token |

ვებ `/check-in` გვერდი და ეს endpoint-ები ორივე წერენ იმავე `AttendanceRecord` ცხრილში (`platform` ველი განასხვავებს `web`/`android` წყაროს, `companyId` განასხვავებს კომპანიებს).

## სასარგებლო სკრიპტები

```bash
npm run db:studio   # Prisma Studio — ბაზის ვიზუალური დათვალიერება
npm run build        # production build
```

⚠️ `prisma/dev.db` არის ლოკალური SQLite ფაილი — production-ისთვის შეცვალეთ `DATABASE_URL` PostgreSQL-ის კავშირის სტრიქონით `prisma/schema.prisma`-ში (`provider = "postgresql"`) და გაუშვით მიგრაცია ხელახლა.
