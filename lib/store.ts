"use client";

import { Event, Product } from "./types";

// Simple in-memory store for now
// In production, this would be replaced with a database
let events: Event[] = [
  {
    id: "1",
    name: "Event UKM 2024",
    description: "Event tahunan UKM",
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
  },
];

export function getEvents(): Event[] {
  return events;
}

export function getEvent(id: string): Event | undefined {
  return events.find((e) => e.id === id);
}

export function createEvent(event: Omit<Event, "id" | "createdAt" | "updatedAt" | "products">): Event {
  const newEvent: Event = {
    ...event,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
  };
  events.push(newEvent);
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<Omit<Event, "id" | "createdAt" | "products">>): Event | null {
  const event = events.find((e) => e.id === id);
  if (!event) return null;
  
  Object.assign(event, updates, { updatedAt: new Date() });
  return event;
}

export function deleteEvent(id: string): boolean {
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return false;
  events.splice(index, 1);
  return true;
}

export function addProductToEvent(eventId: string, product: Omit<Product, "id" | "eventId" | "createdAt">): Product | null {
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;
  
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    eventId,
    createdAt: new Date(),
    variantId: product.variantId,
    variantName: product.variantName,
  };
  event.products.push(newProduct);
  event.updatedAt = new Date();
  return newProduct;
}

export function updateProduct(eventId: string, productId: string, updates: Partial<Omit<Product, "id" | "eventId" | "createdAt">>): Product | null {
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;
  
  const product = event.products.find((p) => p.id === productId);
  if (!product) return null;
  
  Object.assign(product, updates);
  event.updatedAt = new Date();
  return product;
}

export function deleteProduct(eventId: string, productId: string): boolean {
  const event = events.find((e) => e.id === eventId);
  if (!event) return false;
  
  const index = event.products.findIndex((p) => p.id === productId);
  if (index === -1) return false;
  
  event.products.splice(index, 1);
  event.updatedAt = new Date();
  return true;
}

