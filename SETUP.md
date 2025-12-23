# Setup Bujet - RAB Tracker

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database (Supabase)

1. **Buat akun Supabase** di [https://supabase.com](https://supabase.com)

2. **Buat project baru** di Supabase Dashboard

3. **Dapatkan Connection String:**
   - Buka **Settings** > **Database**
   - Di bagian **Connection string**, pilih **URI**
   - Copy connection string untuk `DATABASE_URL`
   - Pilih **Direct connection** dan copy untuk `DIRECT_URL`

4. **Setup Environment Variables:**
   ```bash
   # Copy example file
   cp .env.example .env
   ```
   
   Edit `.env` dan isi dengan connection string dari Supabase:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

5. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

6. **Push Schema ke Database:**
   ```bash
   npm run db:push
   ```

### 3. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database (development)
npm run db:push

# Buat migration (untuk version control)
npm run db:migrate

# Buka Prisma Studio (GUI untuk database)
npm run db:studio
```

## Project Structure

```
bujet/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── events/            # Events pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── ui/               # COSS UI components
├── lib/                   # Utilities
│   ├── prisma.ts         # Prisma client instance
│   ├── store.ts          # In-memory store (akan diganti dengan Prisma)
│   └── types.ts          # TypeScript types
├── prisma/               # Prisma schema
│   └── schema.prisma     # Database schema
└── README-DATABASE.md     # Database setup guide
```

## Tech Stack

- **Framework:** Next.js 16
- **UI:** COSS UI (Base UI + Tailwind CSS)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 6.15.0
- **Language:** TypeScript

## Features

- ✅ Landing page (SaaS-style)
- ✅ Events CRUD
- ✅ Product management dengan varian
- ✅ Fetch produk dari Shopee/Tokopedia (mock data)
- ✅ Light mode UI
- ✅ Database schema dengan Prisma

## Next Steps

1. Implementasi web scraping untuk fetch produk real dari Shopee/Tokopedia
2. User authentication
3. Multi-user support
4. Export RAB ke PDF/Excel
5. Analytics & reporting

