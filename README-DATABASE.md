# Setup Database dengan Supabase

## 1. Setup Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Tunggu hingga project selesai dibuat

## 2. Dapatkan Connection String

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Pergi ke **Settings** > **Database**
4. Scroll ke bagian **Connection string**
5. Pilih **URI** mode dan copy connection string untuk `DATABASE_URL`
6. Pilih **Direct connection** dan copy untuk `DIRECT_URL`

## 3. Setup Environment Variables

1. Copy `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` dan isi dengan connection string dari Supabase:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

   **Penting:** Ganti `[YOUR-PASSWORD]` dengan password database Anda dan `[YOUR-PROJECT-REF]` dengan project reference ID Anda.

## 4. Generate Prisma Client

```bash
npm run db:generate
```

atau

```bash
npx prisma generate
```

## 5. Push Schema ke Database

Untuk development (akan langsung push tanpa migration file):

```bash
npm run db:push
```

atau

```bash
npx prisma db push
```

## 6. (Optional) Buat Migration

Jika ingin membuat migration file untuk version control:

```bash
npm run db:migrate
```

atau

```bash
npx prisma migrate dev --name init
```

## 7. (Optional) Buka Prisma Studio

Untuk melihat dan mengedit data di database:

```bash
npm run db:studio
```

atau

```bash
npx prisma studio
```

## Schema

### Event
- `id`: String (CUID)
- `name`: String
- `description`: String (optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `products`: Relation ke Product[]

### Product
- `id`: String (CUID)
- `eventId`: String (Foreign Key ke Event)
- `name`: String
- `price`: Decimal(12, 2)
- `stock`: Int
- `quantity`: Int (default: 1)
- `link`: String
- `source`: String ("shopee" | "tokopedia" | "manual")
- `variantId`: String (optional)
- `variantName`: String (optional)
- `createdAt`: DateTime

## Troubleshooting

### Error: P1001 - Can't reach database server
- Pastikan connection string sudah benar
- Pastikan password sudah benar
- Cek apakah Supabase project masih aktif

### Error: P1003 - Database does not exist
- Pastikan menggunakan database `postgres` (default Supabase)
- Atau buat database baru di Supabase

### Error: P2002 - Unique constraint failed
- Data sudah ada di database
- Gunakan `prisma db push --force-reset` untuk reset (HATI-HATI: akan menghapus semua data!)

