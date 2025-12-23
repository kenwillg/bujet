import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events - Get all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        products: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal to number for JSON response
    const eventsWithNumbers = events.map((event: any) => ({
      ...event,
      products: event.products.map((product: any) => ({
        ...product,
        price: Number(product.price),
      })),
    }));

    return NextResponse.json(eventsWithNumbers);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json({
      ...event,
      products: event.products.map((product: any) => ({
        ...product,
        price: Number(product.price),
      })),
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
