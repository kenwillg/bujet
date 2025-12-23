import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/products/[id] - Update product
export async function PUT(
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
      quantity,
      variantId,
      variantName,
    } = body;

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return NextResponse.json(
          { error: "Price must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.price = price;
    }

    if (stock !== undefined) {
      if (typeof stock !== "number" || stock < 0) {
        return NextResponse.json(
          { error: "Stock must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.stock = stock;
    }

    if (quantity !== undefined) {
      if (typeof quantity !== "number" || quantity < 1) {
        return NextResponse.json(
          { error: "Quantity must be at least 1" },
          { status: 400 }
        );
      }
      updateData.quantity = quantity;
    }

    if (variantId !== undefined) {
      updateData.variantId = variantId?.trim() || null;
    }

    if (variantName !== undefined) {
      updateData.variantName = variantName?.trim() || null;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

