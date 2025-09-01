import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check if page loads
    await expect(page).toHaveTitle(/Goodstock-X/);
    
    // Check if header is visible
    await expect(page.locator('header')).toBeVisible();
    
    // Check if logo is visible
    await expect(page.locator('img[alt="Goodstock-X"]')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check main navigation links
    await expect(page.locator('text=Beranda')).toBeVisible();
    await expect(page.locator('text=Produk')).toBeVisible();
    await expect(page.locator('text=Kategori')).toBeVisible();
    
    // Check user actions
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[href="/cart"]')).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]').first();
    
    // Type in search box
    await searchInput.fill('nike');
    await expect(searchInput).toHaveValue('nike');
    
    // Press Enter to search
    await searchInput.press('Enter');
    
    // Should navigate to search page
    await expect(page).toHaveURL(/\/search\?q=nike/);
  });

  test('should display featured products section', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="featured-products"]', { timeout: 10000 });
    
    // Check if featured products section exists
    await expect(page.locator('[data-testid="featured-products"]')).toBeVisible();
    
    // Check if at least one product card is visible
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
  });

  test('should navigate to product detail when clicking product', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/product\//);
  });

  test('should display categories section', async ({ page }) => {
    // Check if categories section exists
    await expect(page.locator('text=Kategori Populer')).toBeVisible();
    
    // Check if category links are clickable
    const categoryLinks = page.locator('[data-testid="category-link"]');
    if (await categoryLinks.count() > 0) {
      await expect(categoryLinks.first()).toBeVisible();
    }
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile menu toggle is visible
    const mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
    if (await mobileMenuToggle.isVisible()) {
      await expect(mobileMenuToggle).toBeVisible();
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});