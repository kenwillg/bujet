"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardPanel, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPanel,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon, 
  ExternalLinkIcon,
  LinkIcon,
  ShoppingBagIcon
} from "lucide-react";
import { getEvent, addProductToEvent, updateProduct, deleteProduct } from "@/lib/store";
import { Event, Product, ProductVariant } from "@/lib/types";
import { toastSuccess, toastError } from "@/lib/toast";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [productLink, setProductLink] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [fetchedProduct, setFetchedProduct] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const loadEvent = async () => {
    const eventData = await getEvent(eventId);
    if (!eventData) {
      router.push("/events");
      return;
    }
    setEvent(eventData);
  };

  useEffect(() => {
    loadEvent();
  }, [eventId, router]);

  const handleFetchProduct = async () => {
    if (!productLink.trim()) {
      setFetchError("Link tidak boleh kosong");
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    setFetchedProduct(null);
    setSelectedVariantId(null);

    try {
      const response = await fetch("/api/products/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: productLink }),
      });

      const data = await response.json();

      if (!data.success) {
        setFetchError(data.error || "Gagal mengambil data produk");
        setIsFetching(false);
        return;
      }

      // Store fetched product data and show variant selection
      setFetchedProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariantId(data.selectedVariantId || data.variants[0].id);
      }
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setFetchError("Terjadi kesalahan saat mengambil data produk");
      setIsFetching(false);
    }
  };

  const handleAddProduct = async () => {
    if (!fetchedProduct) return;

    const source = productLink.includes("shopee") ? "shopee" : 
                   productLink.includes("tokopedia") ? "tokopedia" : "manual";
    
    // Get selected variant or use default
    let selectedVariant = null;
    if (fetchedProduct.variants && selectedVariantId) {
      selectedVariant = fetchedProduct.variants.find((v: ProductVariant) => v.id === selectedVariantId);
    }

    const productData = selectedVariant ? {
      name: `${fetchedProduct.name} - ${selectedVariant.name}`,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
    } : {
      name: fetchedProduct.name,
      price: fetchedProduct.price,
      stock: fetchedProduct.stock,
    };
    
    try {
      const newProduct = await addProductToEvent(eventId, {
        ...productData,
        link: productLink,
        source,
        shopName: fetchedProduct.shopName,
        quantity: quantity,
      });

      if (newProduct) {
        toastSuccess("Produk berhasil ditambahkan", `"${newProduct.name}" telah ditambahkan ke event`);
        await loadEvent();
        setProductLink("");
        setQuantity(1);
        setFetchedProduct(null);
        setSelectedVariantId(null);
        setIsAddDialogOpen(false);
      } else {
        toastError("Gagal menambahkan produk", "Silakan coba lagi");
        setFetchError("Gagal menambahkan produk ke event");
      }
    } catch (error) {
      toastError("Gagal menambahkan produk", "Terjadi kesalahan saat menambahkan produk");
      setFetchError("Gagal menambahkan produk ke event");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = event?.products.find((p) => p.id === productId);
    try {
      const success = await deleteProduct(eventId, productId);
      if (success) {
        toastSuccess("Produk berhasil dihapus", product ? `"${product.name}" telah dihapus` : undefined);
        await loadEvent();
      } else {
        toastError("Gagal menghapus produk", "Silakan coba lagi");
      }
    } catch (error) {
      toastError("Gagal menghapus produk", "Terjadi kesalahan saat menghapus produk");
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const product = event?.products.find((p) => p.id === productId);
    try {
      const updated = await updateProduct(eventId, productId, { quantity: newQuantity });
      if (updated) {
        toastSuccess("Jumlah produk diupdate", product ? `Jumlah "${product.name}" menjadi ${newQuantity}` : undefined);
        await loadEvent();
      } else {
        toastError("Gagal mengupdate jumlah", "Silakan coba lagi");
      }
    } catch (error) {
      toastError("Gagal mengupdate jumlah", "Terjadi kesalahan saat mengupdate jumlah");
    }
  };

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const totalBudget = event.products.reduce(
    (sum, product) => sum + product.price * (product.quantity || 1),
    0
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/events">
              <Button variant="ghost" size="icon">
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{event.name}</h1>
              {event.description && (
                <p className="text-sm text-muted-foreground">{event.description}</p>
              )}
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/events">
              <Button variant="ghost">Kembali ke Events</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Summary Card */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Produk
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                {event.products.length}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Anggaran
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                Rp {totalBudget.toLocaleString("id-ID")}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dibuat
              </CardTitle>
              <CardDescription className="text-2xl font-bold">
                {new Date(event.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Add Product Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Daftar Produk</h2>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </div>

          <DialogPopup>
            <DialogHeader>
              <DialogTitle>Tambah Produk dari E-commerce</DialogTitle>
              <DialogDescription>
                Masukkan link produk dari Shopee atau Tokopedia. Kami akan otomatis mengambil 
                nama, harga, dan stok produk untuk Anda.
              </DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <div className="space-y-4">
                {!fetchedProduct ? (
                  <>
                    <div>
                      <Label htmlFor="link">Link Produk (Shopee/Tokopedia)</Label>
                      <Input
                        id="link"
                        value={productLink}
                        onChange={(e) => {
                          setProductLink(e.target.value);
                          setFetchError(null);
                        }}
                        placeholder="https://shopee.co.id/... atau https://tokopedia.com/..."
                        disabled={isFetching}
                      />
                      {fetchError && (
                        <p className="mt-2 text-sm text-destructive">{fetchError}</p>
                      )}
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-sm text-muted-foreground">
                        <LinkIcon className="mr-2 inline h-4 w-4" />
                        Pastikan link yang Anda masukkan adalah link produk langsung dari Shopee atau Tokopedia.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h4 className="font-semibold mb-2">{fetchedProduct.name}</h4>
                      {fetchedProduct.shopName && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Toko: {fetchedProduct.shopName}
                        </p>
                      )}
                      {fetchedProduct.variants && fetchedProduct.variants.length > 0 ? (
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Pilih Varian:</Label>
                          {!selectedVariantId && (
                            <p className="text-sm text-destructive">Silakan pilih varian terlebih dahulu</p>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            {fetchedProduct.variants.map((variant: ProductVariant) => (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={() => setSelectedVariantId(variant.id)}
                                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                                  selectedVariantId === variant.id
                                    ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                                    : "border-border hover:border-primary/50 bg-background"
                                }`}
                              >
                                <div className="font-semibold text-sm mb-1">{variant.name}</div>
                                <div className="text-sm font-medium text-foreground mb-1">
                                  Rp {variant.price.toLocaleString("id-ID")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Stok: {variant.stock}
                                </div>
                              </button>
                            ))}
                          </div>
                          {selectedVariantId && (
                            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <div className="text-sm font-medium text-foreground">
                                Varian terpilih: {fetchedProduct.variants.find((v: ProductVariant) => v.id === selectedVariantId)?.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Harga: Rp {fetchedProduct.variants.find((v: ProductVariant) => v.id === selectedVariantId)?.price.toLocaleString("id-ID")}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm space-y-1">
                          <div className="font-medium">Harga: Rp {fetchedProduct.price.toLocaleString("id-ID")}</div>
                          <div className="text-muted-foreground">Stok: {fetchedProduct.stock}</div>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="quantity">Jumlah</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </>
                )}
              </div>
            </DialogPanel>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setProductLink("");
                  setFetchError(null);
                  setFetchedProduct(null);
                  setSelectedVariantId(null);
                }}
                disabled={isFetching}
              >
                {fetchedProduct ? "Kembali" : "Batal"}
              </Button>
              {!fetchedProduct ? (
                <Button onClick={handleFetchProduct} disabled={isFetching || !productLink.trim()}>
                  {isFetching ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Mengambil Data...
                    </>
                  ) : (
                    "Cari Produk"
                  )}
                </Button>
              ) : (
                <Button onClick={handleAddProduct} disabled={!selectedVariantId && fetchedProduct.variants?.length > 0}>
                  Tambah Produk
                </Button>
              )}
            </DialogFooter>
          </DialogPopup>
        </Dialog>

        {/* Products List */}
        {event.products.length === 0 ? (
          <Card>
            <CardPanel className="py-12 text-center">
              <ShoppingBagIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">Belum ada produk</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Tambah produk pertama Anda dengan mengklik tombol "Tambah Produk" di atas
              </p>
            </CardPanel>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {event.products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.shopName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Toko: {product.shopName}
                        </p>
                      )}
                      {product.variantName && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Varian: {product.variantName}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {product.source === "shopee" ? "Shopee" : 
                           product.source === "tokopedia" ? "Tokopedia" : "Manual"}
                        </Badge>
                      </div>
                    </div>
                    <AlertDialog open={deleteProductId === product.id} onOpenChange={(open) => !open && setDeleteProductId(null)}>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => setDeleteProductId(product.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                      <AlertDialogPopup>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus produk "{product.name}"? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <Button 
                            variant="outline"
                            onClick={() => setDeleteProductId(null)}
                          >
                            Batal
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              handleDeleteProduct(product.id);
                              setDeleteProductId(null);
                            }}
                          >
                            Hapus
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogPopup>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardPanel className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Harga Satuan:</span>
                      <span className="font-semibold">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stok Tersedia:</span>
                      <Badge>{product.stock}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Jumlah:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => handleUpdateQuantity(product.id, (product.quantity || 1) - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {product.quantity || 1}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => handleUpdateQuantity(product.id, (product.quantity || 1) + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>Subtotal:</span>
                        <span>
                          Rp {(product.price * (product.quantity || 1)).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardPanel>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(product.link, "_blank")}
                  >
                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                    Buka Link
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

