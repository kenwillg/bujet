import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardPanel, CardFooter } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Bujet</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/events">
              <Button variant="ghost">Events</Button>
            </Link>
            <Link href="/events">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
              Kelola RAB Event dengan Mudah
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Bujet membantu mahasiswa dari UKM, HIMA, BEM, dan organisasi lainnya 
              untuk mengelola logistik dan anggaran event secara efisien.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/events">
                <Button size="lg">Mulai Sekarang</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Fitur Unggulan</h2>
              <p className="text-muted-foreground">
                Semua yang Anda butuhkan untuk mengelola RAB event
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Kelola Event</CardTitle>
                  <CardDescription>
                    Buat dan kelola multiple event dengan mudah. Setiap event memiliki 
                    daftar produk dan anggaran sendiri.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Import dari E-commerce</CardTitle>
                  <CardDescription>
                    Upload link Shopee atau Tokopedia, dan kami akan otomatis mengambil 
                    nama, harga, dan stok produk untuk Anda.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tracking Anggaran</CardTitle>
                  <CardDescription>
                    Pantau total anggaran setiap event dan lihat breakdown per produk 
                    untuk pengelolaan yang lebih baik.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold">Siap Memulai?</h2>
              <p className="mb-8 text-muted-foreground">
                Mulai kelola RAB event Anda hari ini. Gratis dan mudah digunakan.
              </p>
              <Link href="/events">
                <Button size="lg">Buat Event Pertama</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Bujet. Dibuat untuk mahasiswa Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
