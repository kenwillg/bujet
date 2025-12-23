import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/[id]/products - Get all products for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await prisma.product.findMany({
      where: { eventId: id },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      products.map((product) => ({
        ...product,
        price: Number(product.price),
      }))
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/products - Create new product
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      price,
      stock,
      quantity = 1,
      link,
      source,
      shopName,
      variantId,
      variantName,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (price === undefined || typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (stock === undefined || typeof stock !== "number" || stock < 0) {
      return NextResponse.json(
        { error: "Valid stock is required" },
        { status: 400 }
      );
    }

    if (!link || typeof link !== "string") {
      return NextResponse.json(
        { error: "Link is required" },
        { status: 400 }
      );
    }

    if (!source || !["shopee", "tokopedia", "manual"].includes(source)) {
      return NextResponse.json(
        { error: "Valid source is required (shopee, tokopedia, or manual)" },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const product = await prisma.product.create({
      data: {
        eventId: id,
        name: name.trim(),
        price: price,
        stock: stock,
        quantity: quantity || 1,
        link: link.trim(),
        source: source,
        shopName: shopName?.trim() || null,
        variantId: variantId?.trim() || null,
        variantName: variantName?.trim() || null,
      },
    });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

