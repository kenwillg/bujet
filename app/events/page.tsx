"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardPanel, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from "lucide-react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/store";
import { Event } from "@/lib/types";
import { toastSuccess, toastError } from "@/lib/toast";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      toastError("Gagal memuat events", "Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    
    setIsCreating(true);
    try {
      const newEvent = await createEvent({
        name: formData.name,
        description: formData.description || undefined,
      });
      
      if (newEvent) {
        toastSuccess("Event berhasil dibuat", `Event "${formData.name}" telah ditambahkan`);
        await loadEvents();
        setFormData({ name: "", description: "" });
        setIsCreateDialogOpen(false);
      } else {
        toastError("Gagal membuat event", "Silakan coba lagi");
      }
    } catch (error) {
      toastError("Gagal membuat event", "Terjadi kesalahan saat membuat event");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({ name: event.name, description: event.description || "" });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEvent || !formData.name.trim()) {
      toastError("Nama event tidak boleh kosong");
      return;
    }
    
    setIsUpdating(true);
    try {
      const updated = await updateEvent(editingEvent.id, {
        name: formData.name,
        description: formData.description || undefined,
      });
      
      if (updated) {
        toastSuccess("Event berhasil diupdate", `"${updated.name}" telah diperbarui`);
        await loadEvents();
        setFormData({ name: "", description: "" });
        setIsEditDialogOpen(false);
        setEditingEvent(null);
      } else {
        toastError("Gagal mengupdate event", "Silakan coba lagi");
      }
    } catch (error) {
      toastError("Gagal mengupdate event", "Terjadi kesalahan saat mengupdate event");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const event = events.find((e) => e.id === id);
    setIsDeleting(id);
    try {
      const success = await deleteEvent(id);
      if (success) {
        toastSuccess("Event berhasil dihapus", event ? `"${event.name}" telah dihapus` : undefined);
        await loadEvents();
      } else {
        toastError("Gagal menghapus event", "Silakan coba lagi");
      }
    } catch (error) {
      toastError("Gagal menghapus event", "Terjadi kesalahan saat menghapus event");
    } finally {
      setIsDeleting(null);
      setDeleteEventId(null);
    }
  };

  const totalBudget = (event: Event) => {
    return event.products.reduce(
      (sum, product) => sum + product.price * (product.quantity || 1),
      0
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Bujet</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground">
              Kelola semua event dan RAB Anda di sini
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Buat Event Baru
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogPopup>
              <DialogHeader>
                <DialogTitle>Buat Event Baru</DialogTitle>
                <DialogDescription>
                  Buat event baru untuk mulai mengelola RAB dan logistik
                </DialogDescription>
              </DialogHeader>
              <DialogPanel>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Event</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Contoh: Event UKM 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Deskripsi event..."
                      rows={3}
                    />
                  </div>
                </div>
              </DialogPanel>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Membuat...
                    </>
                  ) : (
                    "Buat"
                  )}
                </Button>
              </DialogFooter>
            </DialogPopup>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogPopup>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Ubah informasi event
              </DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nama Event</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Contoh: Event UKM 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Deskripsi (Opsional)</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Deskripsi event..."
                    rows={3}
                  />
                </div>
              </div>
            </DialogPanel>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingEvent(null);
                }}
              >
                Batal
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>

        {/* Events Grid */}
        {isLoading ? (
          <Card>
            <CardPanel className="py-12 text-center">
              <Spinner className="mx-auto mb-4 h-8 w-8" />
              <p className="text-muted-foreground">Memuat events...</p>
            </CardPanel>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardPanel className="py-12 text-center">
              <p className="text-muted-foreground">
                Belum ada event. Buat event pertama Anda!
              </p>
            </CardPanel>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{event.name}</CardTitle>
                      {event.description && (
                        <CardDescription className="mt-2">
                          {event.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(event)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => setDeleteEventId(event.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={deleteEventId === event.id} onOpenChange={(open) => !open && setDeleteEventId(null)}>
                        <AlertDialogPopup>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Event?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus event "{event.name}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <Button 
                              variant="outline"
                              onClick={() => setDeleteEventId(null)}
                            >
                              Batal
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(event.id)}
                              disabled={isDeleting === event.id}
                            >
                              {isDeleting === event.id ? (
                                <>
                                  <Spinner className="mr-2 h-4 w-4" />
                                  Menghapus...
                                </>
                              ) : (
                                "Hapus"
                              )}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogPopup>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardPanel className="flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Produk:</span>
                      <Badge>{event.products.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Anggaran:</span>
                      <span className="font-semibold">
                        Rp {totalBudget(event).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </CardPanel>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    Buka Event
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

