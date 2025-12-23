import { NextResponse } from "next/server";
import { ProductFetchResult, ProductVariant } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { link } = await request.json();

    if (!link || typeof link !== "string") {
      return NextResponse.json(
        { success: false, error: "Link is required" },
        { status: 400 }
      );
    }

    // Detect platform
    const isShopee = link.includes("shopee.co.id") || link.includes("shopee.com");
    const isTokopedia = link.includes("tokopedia.com");

    if (!isShopee && !isTokopedia) {
      return NextResponse.json(
        { success: false, error: "Unsupported platform. Please provide a Shopee or Tokopedia link." },
        { status: 400 }
      );
    }

    // Extract product ID from Tokopedia URL if possible
    const tokopediaMatch = link.match(/tokopedia\.com\/[^/]+\/([^/?]+)/);
    const productSlug = tokopediaMatch ? tokopediaMatch[1] : null;

    // Check if it's the UGREEN cable product
    const isUgreenCable = link.includes("ugreen") && (link.includes("kabel") || link.includes("cable") || link.includes("type-c"));
    
    // For now, return mock data with variants
    // In production, you would use web scraping or an API to fetch real product data
    // Note: Web scraping Shopee/Tokopedia requires careful handling of their anti-bot measures
    // You might want to use a service like ScraperAPI, Bright Data, or build a custom scraper
    
    // Realistic product names for events
    const shopeeProducts = [
      { name: "Tenda Pramuka 4x4 Meter - Waterproof", basePrice: 500000, variants: ["4x4 Meter", "5x5 Meter", "6x6 Meter"] },
      { name: "Sound System Portable Bluetooth 1000W", basePrice: 3000000, variants: ["1000W", "1500W", "2000W"] },
      { name: "Kursi Plastik Lipat", basePrice: 50000, variants: ["Set 50 Pcs", "Set 100 Pcs", "Set 200 Pcs"] },
      { name: "Meja Folding Portable", basePrice: 200000, variants: ["Set 20 Pcs", "Set 30 Pcs", "Set 50 Pcs"] },
      { name: "Tas Goodie Bag Custom", basePrice: 15000, variants: ["100 Pcs", "200 Pcs", "500 Pcs"] },
      { name: "Banner Vinyl Custom Print", basePrice: 80000, variants: ["2x1 Meter", "3x1 Meter", "4x2 Meter"] },
    ];
    
    const tokopediaProducts = [
      { name: "UGREEN Kabel Data Type C to Type C Fast Charging 3A 60w For Samsung iPad Android iPhone 15 16", basePrice: 54600, variants: [
        { name: "25057 1M", price: 54600, stock: 61 },
        { name: "50123 3A 1M", price: 59600, stock: 45 },
        { name: "50125 3A 2M", price: 69600, stock: 38 },
        { name: "50149 50CM", price: 49600, stock: 52 },
        { name: "50150 1M", price: 54600, stock: 61 }
      ]},
      { name: "Tenda Event Heavy Duty", basePrice: 800000, variants: ["6x3 Meter", "8x4 Meter", "10x5 Meter"] },
      { name: "Panggung Portable", basePrice: 1500000, variants: ["3x2 Meter", "4x3 Meter", "6x4 Meter"] },
      { name: "Kursi Stacking", basePrice: 75000, variants: ["Set 100 Pcs", "Set 200 Pcs", "Set 500 Pcs"] },
      { name: "Meja Seminar", basePrice: 250000, variants: ["Set 30 Pcs", "Set 50 Pcs", "Set 100 Pcs"] },
      { name: "Souvenir Tumbler Custom", basePrice: 25000, variants: ["150 Pcs", "300 Pcs", "500 Pcs"] },
    ];
    
    // If it's UGREEN cable, return that product specifically
    let selectedProduct;
    if (isUgreenCable && isTokopedia) {
      selectedProduct = tokopediaProducts[0];
    } else {
      const products = isShopee ? shopeeProducts : tokopediaProducts;
      selectedProduct = products[Math.floor(Math.random() * products.length)];
    }
    
    // Generate variants
    const variants: ProductVariant[] = selectedProduct.variants.map((variant, index) => {
      // Check if variant is already an object with price and stock
      if (typeof variant === 'object' && variant.price !== undefined) {
        return {
          id: `variant-${index}`,
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
        };
      }
      // Otherwise, treat as string and generate price/stock
      const variantPrice = selectedProduct.basePrice + (index * 10000);
      return {
        id: `variant-${index}`,
        name: variant as string,
        price: variantPrice,
        stock: Math.floor(Math.random() * 200) + 10,
      };
    });
    
    // Select first variant as default
    const selectedVariant = variants[0];
    
    const mockData: ProductFetchResult = {
      name: selectedProduct.name,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      variants: variants,
      selectedVariantId: selectedVariant.id,
      success: true,
    };

    // TODO: Implement actual scraping
    // Example approach:
    // 1. Use a headless browser (Puppeteer, Playwright)
    // 2. Or use a scraping service
    // 3. Parse the HTML to extract product name, price, stock, and variants
    
    return NextResponse.json(mockData);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product data" },
      { status: 500 }
    );
  }
}

