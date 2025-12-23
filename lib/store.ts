"use client";

import { Event, Product } from "./types";

// API-based store functions
// All functions now use API routes that connect to Prisma database

export async function getEvents(): Promise<Event[]> {
  try {
    const response = await fetch("/api/events");
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    const events = await response.json();
    return events.map((event: any) => ({
      ...event,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      products: event.products.map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
      })),
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const response = await fetch(`/api/events/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch event");
    }
    const event = await response.json();
    return {
      ...event,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      products: event.products.map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
      })),
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export async function createEvent(
  event: Omit<Event, "id" | "createdAt" | "updatedAt" | "products">
): Promise<Event | null> {
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: event.name,
        description: event.description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create event");
    }

    const newEvent = await response.json();
    return {
      ...newEvent,
      createdAt: new Date(newEvent.createdAt),
      updatedAt: new Date(newEvent.updatedAt),
      products: newEvent.products.map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
      })),
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return null;
  }
}

export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, "id" | "createdAt" | "products">>
): Promise<Event | null> {
  try {
    const response = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: updates.name,
        description: updates.description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update event");
    }

    const updatedEvent = await response.json();
    return {
      ...updatedEvent,
      createdAt: new Date(updatedEvent.createdAt),
      updatedAt: new Date(updatedEvent.updatedAt),
      products: updatedEvent.products.map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
      })),
    };
  } catch (error) {
    console.error("Error updating event:", error);
    return null;
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete event");
    }

    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
}

export async function addProductToEvent(
  eventId: string,
  product: Omit<Product, "id" | "eventId" | "createdAt">
): Promise<Product | null> {
  try {
    const response = await fetch(`/api/events/${eventId}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: product.name,
        price: product.price,
        stock: product.stock,
        quantity: product.quantity || 1,
        link: product.link,
        source: product.source,
        variantId: product.variantId,
        variantName: product.variantName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add product");
    }

    const newProduct = await response.json();
    return {
      ...newProduct,
      createdAt: new Date(newProduct.createdAt),
    };
  } catch (error) {
    console.error("Error adding product:", error);
    return null;
  }
}

export async function updateProduct(
  eventId: string,
  productId: string,
  updates: Partial<Omit<Product, "id" | "eventId" | "createdAt">>
): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: updates.name,
        price: updates.price,
        stock: updates.stock,
        quantity: updates.quantity,
        variantId: updates.variantId,
        variantName: updates.variantName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update product");
    }

    const updatedProduct = await response.json();
    return {
      ...updatedProduct,
      createdAt: new Date(updatedProduct.createdAt),
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
}

export async function deleteProduct(
  eventId: string,
  productId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete product");
    }

    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}
