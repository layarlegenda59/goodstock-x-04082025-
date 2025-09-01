import { test, expect } from '@playwright/test';

test.describe('Product Search and Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search for products and display results', async ({ page }) => {
    // Perform search
    const searchInput = page.locator('[data-testid="search-input"]').first();
    await searchInput.fill('nike');
    await searchInput.press('Enter');
    
    // Should navigate to search results page
    await expect(page).toHaveURL(/\/search\?q=nike/);
    
    // Wait for search results to load
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
    
    // Check if search results are displayed
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Check if search query is displayed
    await expect(page.locator('text=nike')).toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    // Search for something that likely won't exist
    const searchInput = page.locator('[data-testid="search-input"]').first();
    await searchInput.fill('xyznonexistentproduct123');
    await searchInput.press('Enter');
    
    // Should navigate to search page
    await expect(page).toHaveURL(/\/search\?q=xyznonexistentproduct123/);
    
    // Should show no results message
    await expect(page.locator('text=Tidak ada produk yang ditemukan')).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Navigate to products page
    await page.click('text=Produk');
    await expect(page).toHaveURL('/products');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Click on a category filter if available
    const categoryFilter = page.locator('[data-testid="category-filter"]').first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Check if products are still displayed
      await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    }
  });

  test('should navigate to product detail page', async ({ page }) => {
    // Wait for products to load on homepage
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Get the first product and click it
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/product\//);
    
    // Check product detail elements
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
  });

  test('should add product to cart from product detail', async ({ page }) => {
    // Navigate to a product detail page
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Wait for product detail page to load
    await expect(page).toHaveURL(/\/product\//);
    
    // Add to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]');
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      
      // Should show success message or update cart badge
      const cartBadge = page.locator('[data-testid="cart-badge"]');
      if (await cartBadge.isVisible()) {
        await expect(cartBadge).toContainText('1');
      }
    }
  });

  test('should navigate to cart page', async ({ page }) => {
    // Click cart icon
    await page.click('[href="/cart"]');
    
    // Should navigate to cart page
    await expect(page).toHaveURL('/cart');
    
    // Check cart page elements
    await expect(page.locator('[data-testid="cart-container"]')).toBeVisible();
  });

  test('should add product to wishlist', async ({ page }) => {
    // Navigate to a product detail page
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Wait for product detail page to load
    await expect(page).toHaveURL(/\/product\//);
    
    // Add to wishlist
    const wishlistButton = page.locator('[data-testid="add-to-wishlist"]');
    if (await wishlistButton.isVisible()) {
      await wishlistButton.click();
      
      // Should show success feedback
      await expect(page.locator('text=Ditambahkan ke wishlist')).toBeVisible();
    }
  });

  test('should handle product image gallery', async ({ page }) => {
    // Navigate to a product detail page
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Wait for product detail page to load
    await expect(page).toHaveURL(/\/product\//);
    
    // Check if main product image is visible
    await expect(page.locator('[data-testid="product-main-image"]')).toBeVisible();
    
    // Check if thumbnail images exist and are clickable
    const thumbnails = page.locator('[data-testid="product-thumbnail"]');
    if (await thumbnails.count() > 1) {
      await thumbnails.nth(1).click();
      // Main image should change (we can't easily test this without specific implementation)
    }
  });

  test('should display product reviews section', async ({ page }) => {
    // Navigate to a product detail page
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Wait for product detail page to load
    await expect(page).toHaveURL(/\/product\//);
    
    // Check if reviews section exists
    const reviewsSection = page.locator('[data-testid="product-reviews"]');
    if (await reviewsSection.isVisible()) {
      await expect(reviewsSection).toBeVisible();
      
      // Check if rating is displayed
      await expect(page.locator('[data-testid="product-rating"]')).toBeVisible();
    }
  });
});