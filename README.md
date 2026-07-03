# მთაწმინდის პარკი — დასწრების აღრიცხვის სისტემა

მოლარეების დასწრების აღრიცხვის ვებ სისტემა, რომელიც ჩაანაცვლებს fingerprint მოწყობილობას: მოლარე შედის უნიკალური კოდით, აჭერს ვირტუალურ "თითის" ღილაკს, სისტემა იღებს მისი მობილურის GPS ლოკაციას და ირჩევს სალაროს — ასე ფიქსირდება დღიური დასწრება.

## ტექნოლოგიები

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma ORM 6 + SQLite (`prisma/dev.db`)
- jose (JWT ადმინის სესიისთვის), bcryptjs (პაროლის ჰეშირება)
- xlsx (Excel გატანა)

## გაშვება VS Code-ში

```bash
npm install
cp .env.example .env      # PowerShell-ზე: Copy-Item .env.example .env
npm run db:migrate        # ქმნის SQLite ბაზას და ცხრილებს
npm run db:seed           # ამატებს ადმინს, სატესტო სალაროებსა და მოლარეებს
npm run dev
```

გახსენით http://localhost:3000

## საწყისი მონაცემები (seed)

- **ადმინის შესვლა:** `/admin/login` — `admin` / `admin123`
- **სატესტო მოლარის კოდები:** `MP-100001`, `MP-100002`, `MP-100003` — გამოსაყენებელია `/check-in` გვერდზე
- სატესტო სალაროები: მთავარი შესასვლელი, ატრაქციონების ზონა, კაფე ბარი

`.env` ფაილში (`SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`) შეგიძლიათ შეცვალოთ საწყისი ადმინის მონაცემები ხელახალი სიდის გაშვებამდე.

## გვერდები

- `/` — მთავარი გვერდი, აირჩიეთ როლი
- `/check-in` — მოლარის დასწრების დაფიქსირება (კოდი → GPS → სალარო → დადასტურება)
- `/admin/login` — ადმინის შესვლა
- `/admin/dashboard` — დღევანდელი სტატისტიკა და სწრაფი მოქმედებები
- `/admin/cashiers` — მოლარეების მართვა (დამატება/რედაქტირება/დეაქტივაცია/კოდის განახლება)
- `/admin/registers` — სალაროების მართვა
- `/admin/attendance` — დასწრების ჟურნალი, ფილტრები და Excel Export
- `/admin/settings` — კომპანიის სახელი და Geofence (დაშვებული ლოკაცია/რადიუსი)

## სასარგებლო სკრიპტები

```bash
npm run db:studio   # Prisma Studio — ბაზის ვიზუალური დათვალიერება
npm run build        # production build
```

⚠️ `prisma/dev.db` არის ლოკალური SQLite ფაილი — production-ისთვის შეცვალეთ `DATABASE_URL` PostgreSQL-ის კავშირის სტრიქონით `prisma/schema.prisma`-ში (`provider = "postgresql"`) და გაუშვით მიგრაცია ხელახლა.
