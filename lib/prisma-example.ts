/**
 * Contoh penggunaan Prisma Client
 * File ini hanya sebagai referensi, tidak digunakan di aplikasi
 */

import { prisma } from "./prisma";

// Contoh: Get semua events
export async function getAllEvents() {
  return await prisma.event.findMany({
    include: {
      products: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Contoh: Get event by ID
export async function getEventById(id: string) {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });
}

// Contoh: Create event
export async function createEvent(data: {
  name: string;
  description?: string;
}) {
  return await prisma.event.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });
}

// Contoh: Update event
export async function updateEvent(
  id: string,
  data: {
    name?: string;
    description?: string;
  }
) {
  return await prisma.event.update({
    where: { id },
    data,
  });
}

// Contoh: Delete event
export async function deleteEvent(id: string) {
  return await prisma.event.delete({
    where: { id },
  });
}

// Contoh: Add product to event
export async function addProductToEvent(
  eventId: string,
  data: {
    name: string;
    price: number;
    stock: number;
    quantity: number;
    link: string;
    source: "shopee" | "tokopedia" | "manual";
    variantId?: string;
    variantName?: string;
  }
) {
  return await prisma.product.create({
    data: {
      eventId,
      name: data.name,
      price: data.price,
      stock: data.stock,
      quantity: data.quantity,
      link: data.link,
      source: data.source,
      variantId: data.variantId,
      variantName: data.variantName,
    },
  });
}

// Contoh: Update product
export async function updateProduct(
  id: string,
  data: {
    name?: string;
    price?: number;
    stock?: number;
    quantity?: number;
    variantId?: string;
    variantName?: string;
  }
) {
  return await prisma.product.update({
    where: { id },
    data,
  });
}

// Contoh: Delete product
export async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id },
  });
}

// Contoh: Get products by event
export async function getProductsByEvent(eventId: string) {
  return await prisma.product.findMany({
    where: { eventId },
    orderBy: {
      createdAt: "desc",
    },
  });
}

