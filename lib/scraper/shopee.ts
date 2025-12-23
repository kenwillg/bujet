import puppeteer from "puppeteer";

export interface ShopeeProductData {
  name: string;
  shopName: string;
  price: number;
  stock: number;
  variants: Array<{
    name: string;
    price: number;
  }>;
}

export async function scrapeShopee(url: string): Promise<ShopeeProductData> {
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

    console.log(`Scraping Shopee: ${url}`);
    await page.goto(url, {
      waitUntil: "load",
      timeout: 30000,
    });

    // Wait longer for Shopee's JavaScript to fully render (Shopee uses heavy JS)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Try to wait for specific Shopee elements
    try {
      await page.waitForSelector('h1, [class*="product"], [class*="name"]', { timeout: 10000 });
    } catch (e) {
      // Continue anyway
    }

    // Extract product name - Shopee uses various class names
    const productName = await page.evaluate(() => {
      // Try to get from window.__NEXT_DATA__ or similar
      try {
        const nextData = (window as any).__NEXT_DATA__;
        if (nextData?.props?.pageProps?.initialData?.productInfo?.name) {
          return nextData.props.pageProps.initialData.productInfo.name;
        }
      } catch (e) {}

      // Try to get from script tags with JSON data
      const scripts = document.querySelectorAll('script[type="application/json"]');
      for (const script of Array.from(scripts)) {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data?.productInfo?.name) return data.productInfo.name;
          if (data?.name) return data.name;
        } catch (e) {}
      }

      // Try various selectors
      const selectors = [
        'h1[class*="product"]',
        'h1[class*="name"]',
        '[class*="product-briefing"] [class*="name"]',
        '[class*="product-name"]',
        'h1',
        '.product-name',
        '[data-testid="product-name"]',
        '[class*="ProductName"]',
        'title'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of Array.from(elements)) {
          const text = element.textContent?.trim() || '';
          if (selector === 'title' && text.includes('Shopee')) {
            const parts = text.split('|');
            if (parts.length > 0 && parts[0].trim().length > 5) {
              return parts[0].trim();
            }
          }
          if (text && text.length > 5 && !text.includes('Shopee') && !text.includes('Home')) {
            return text;
          }
        }
      }
      return "";
    });

    // Extract shop name
    const shopName = await page.evaluate(() => {
      // Try to get from window data
      try {
        const nextData = (window as any).__NEXT_DATA__;
        if (nextData?.props?.pageProps?.initialData?.shopInfo?.shopName) {
          return nextData.props.pageProps.initialData.shopInfo.shopName;
        }
      } catch (e) {}

      const selectors = [
        '[class*="shop-name"]',
        'a[href*="/shop/"]',
        '[class*="shop"] [class*="name"]',
        '.shop-name',
        '[data-testid="shop-name"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of Array.from(elements)) {
          const text = element.textContent?.trim() || '';
          if (text && text.length > 2 && !text.includes('Shopee')) {
            return text;
          }
        }
      }
      return "Unknown Shop";
    });

    // Extract price
    const price = await page.evaluate(() => {
      // Try to get from window data
      try {
        const nextData = (window as any).__NEXT_DATA__;
        if (nextData?.props?.pageProps?.initialData?.productInfo?.price) {
          return parseFloat(nextData.props.pageProps.initialData.productInfo.price);
        }
        if (nextData?.props?.pageProps?.initialData?.productInfo?.priceMin) {
          return parseFloat(nextData.props.pageProps.initialData.productInfo.priceMin);
        }
      } catch (e) {}

      // Try script tags
      const scripts = document.querySelectorAll('script[type="application/json"]');
      for (const script of Array.from(scripts)) {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data?.productInfo?.price) return parseFloat(data.productInfo.price);
          if (data?.price) return parseFloat(data.price);
        } catch (e) {}
      }

      const selectors = [
        '[class*="price"]',
        '[class*="Price"]',
        '.price',
        '[data-testid="price"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of Array.from(elements)) {
          const text = element.textContent || '';
          const priceText = text.replace(/[^\d]/g, "");
          if (priceText && priceText.length > 3) {
            const priceNum = parseFloat(priceText);
            if (priceNum > 0 && priceNum < 1000000000) { // Reasonable price range
              return priceNum;
            }
          }
        }
      }
      return 0;
    });

    // Extract stock
    const stock = await page.evaluate(() => {
      // Try to get from window data
      try {
        const nextData = (window as any).__NEXT_DATA__;
        if (nextData?.props?.pageProps?.initialData?.productInfo?.stock) {
          return parseInt(nextData.props.pageProps.initialData.productInfo.stock);
        }
      } catch (e) {}

      const selectors = [
        '[class*="stock"]',
        '[class*="Stock"]',
        '.stock',
        '[data-testid="stock"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of Array.from(elements)) {
          const text = element.textContent || '';
          const stockText = text.replace(/[^\d]/g, "");
          if (stockText) {
            const stockNum = parseInt(stockText);
            if (stockNum > 0) {
              return stockNum;
            }
          }
        }
      }
      return 100; // Default stock
    });

    // Extract variants
    const variants = await page.evaluate(() => {
      const variantList: Array<{ name: string; price: number }> = [];

      // Try to get from window data
      try {
        const nextData = (window as any).__NEXT_DATA__;
        const models = nextData?.props?.pageProps?.initialData?.productInfo?.models || [];
        if (models.length > 0) {
          models.forEach((model: any) => {
            if (model.name && model.price) {
              variantList.push({
                name: model.name,
                price: parseFloat(model.price) || 0
              });
            }
          });
        }
      } catch (e) {}

      // If no variants from data, try DOM selectors
      if (variantList.length === 0) {
        const variantSelectors = [
          '[class*="variant"]',
          '[class*="model"]',
          '.sku-variant-row',
          '[data-testid="variant"]',
          '.variant-option',
          'button[class*="variant"]'
        ];

        for (const selector of variantSelectors) {
          const variantElements = document.querySelectorAll(selector);
          if (variantElements.length > 0) {
            variantElements.forEach((element) => {
              const name = element.textContent?.trim() || element.getAttribute("data-variant-name") || "";
              const priceAttr = element.getAttribute("data-price");
              
              if (name && name !== "Default" && name.length > 0) {
                const price = priceAttr ? parseFloat(priceAttr) : 0;
                variantList.push({ name, price });
              }
            });
            if (variantList.length > 0) break;
          }
        }
      }

      // If no variants found, return default
      if (variantList.length === 0) {
        variantList.push({ name: "Default", price: 0 });
      }

      return variantList;
    });

    await browser.close();

    // Update default variant with actual price
    if (variants.length === 1 && variants[0].name === "Default") {
      variants[0].price = price || 0;
    }

    return {
      name: productName || "Product Name Not Found",
      shopName: shopName || "Unknown Shop",
      price: price || variants[0]?.price || 0,
      stock: stock || 100,
      variants: variants,
    };
  } catch (error) {
    console.error("Shopee scraping error:", error);
    await browser.close();
    throw error;
  }
}
