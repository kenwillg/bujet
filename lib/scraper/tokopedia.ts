import puppeteer from "puppeteer";

export interface TokopediaProductData {
  name: string;
  shopName: string;
  price: number;
  stock: number;
  variants: Array<{
    name: string;
    price: number;
    stock: number;
  }>;
}

export async function scrapeTokopedia(url: string): Promise<TokopediaProductData> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    
    // Set user agent and viewport
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`Scraping Tokopedia: ${url}`);
    await page.goto(url, {
      waitUntil: "load",
      timeout: 30000,
    });

    // Wait for product content to load
    try {
      await page.waitForSelector('h1[data-testid="lblPDPDetailProductName"], h1, [class*="product"]', { timeout: 5000 });
    } catch (e) {
      // If selector not found, wait a bit anyway
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Extract product name - try multiple selectors
    const productName = await page.evaluate(() => {
      const selectors = [
        'h1[data-testid="lblPDPDetailProductName"]',
        '[data-testid="pdpProductName"]',
        'h1.pdp-product-name',
        'h1[class*="product-name"]',
        'h1',
        '.product-name',
        '[class*="ProductName"]'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      }
      return "";
    });

    // Extract shop name
    const shopName = await page.evaluate(() => {
      const selectors = [
        '[data-testid="llbPDPFooterShopName"]',
        'a[data-testid="shopName"]',
        'a[href*="/shop/"]',
        '.shop-name',
        '[class*="ShopName"]',
        '[class*="shop-name"]'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      }
      return "Unknown Shop";
    });

    // Extract price
    const price = await page.evaluate(() => {
      const selectors = [
        '[data-testid="lblPDPDetailProductPrice"]',
        '.price',
        '[class*="price"]',
        '[class*="Price"]',
        '.product-price'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent) {
          const priceText = element.textContent.replace(/[^\d]/g, "");
          if (priceText) {
            return parseFloat(priceText);
          }
        }
      }
      return 0;
    });

    // Extract stock
    const stock = await page.evaluate(() => {
      const selectors = [
        '[data-testid="lblPDPDetailProductStock"]',
        '.stock',
        '[class*="stock"]',
        '[class*="Stock"]'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element?.textContent) {
          const stockText = element.textContent.replace(/[^\d]/g, "");
          if (stockText) {
            return parseInt(stockText);
          }
        }
      }
      return 100; // Default stock
    });

    // Extract variants - Tokopedia variant structure
    const variants = await page.evaluate(() => {
      const variantList: Array<{ name: string; price: number; stock: number }> = [];

      // Try multiple variant selector patterns
      const variantSelectors = [
        '[data-testid="pdpVariantOption"]',
        '.variant-option',
        'button[data-variant]',
        '.product-variant',
        '[class*="variant"]',
        '.sku-variant-row'
      ];

      for (const selector of variantSelectors) {
        const variantElements = document.querySelectorAll(selector);
        if (variantElements.length > 0) {
          variantElements.forEach((element) => {
            const name = element.textContent?.trim() || element.getAttribute("data-variant-name") || "";
            const priceAttr = element.getAttribute("data-price");
            const stockAttr = element.getAttribute("data-stock");

            if (name && name !== "Default") {
              const price = priceAttr ? parseFloat(priceAttr) : 0;
              const stock = stockAttr ? parseInt(stockAttr) : 100;
              variantList.push({ name, price, stock });
            }
          });
          break; // Found variants, stop searching
        }
      }

      // If no variants found, return default
      if (variantList.length === 0) {
        variantList.push({ name: "Default", price: 0, stock: 100 });
      }

      return variantList;
    });

    await browser.close();

    // If variants are empty or only have default, use main price/stock
    if (variants.length === 0 || (variants.length === 1 && variants[0].name === "Default")) {
      variants[0] = {
        name: "Default",
        price: price || 0,
        stock: stock || 100,
      };
    }

    return {
      name: productName || "Product Name Not Found",
      shopName: shopName || "Unknown Shop",
      price: price || variants[0]?.price || 0,
      stock: stock || variants[0]?.stock || 100,
      variants: variants,
    };
  } catch (error) {
    console.error("Tokopedia scraping error:", error);
    await browser.close();
    throw error;
  }
}
