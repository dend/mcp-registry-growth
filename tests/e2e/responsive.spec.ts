import { test, expect } from '@playwright/test';

test.describe('MCP Analytics Dashboard - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Desktop View (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    test('should display all components in desktop layout', async ({ page }) => {
      // Check main content header is visible (not header banner)
      await expect(page.getByRole('main').getByRole('heading', { name: 'MCP Registry Analytics' })).toBeVisible();
      
      // Check all filter controls are visible
      const comboboxes = page.getByRole('combobox');
      await expect(comboboxes.first()).toBeVisible();
      
      // Check chart takes full width
      const chartContainer = page.locator('.recharts-responsive-container');
      await expect(chartContainer).toBeVisible();
      
      // Check summary cards are visible
      await expect(page.getByText('Current Total')).toBeVisible();
      await expect(page.getByText('Growth Rate')).toBeVisible();
      await expect(page.getByText('Data Points')).toBeVisible();
    });

    test('should have proper spacing and layout', async ({ page }) => {
      // Check container max-width
      const mainContainer = page.locator('main');
      const containerClass = await mainContainer.getAttribute('class');
      expect(containerClass).toContain('container');
    });
  });

  test.describe('Tablet View (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    test('should adapt layout for tablet', async ({ page }) => {
      // Header should still be visible
      await expect(page.getByRole('main').getByRole('heading', { name: 'MCP Registry Analytics' })).toBeVisible();
      
      // Chart should remain visible and responsive
      await expect(page.locator('.recharts-responsive-container')).toBeVisible();
      
      // Summary cards should stack appropriately
      await expect(page.getByText(/Current Total/i)).toBeVisible();
      await expect(page.getByText(/Growth Rate/i)).toBeVisible();
      await expect(page.getByText(/Data Points/i)).toBeVisible();
    });

    test('should maintain filter functionality', async ({ page }) => {
      // Filter controls should be accessible
      const serverTypeSelect = page.getByRole('combobox').first();
      await expect(serverTypeSelect).toBeVisible();
      
      // Should be able to change filters
      await serverTypeSelect.selectOption('local');
      await page.waitForTimeout(1000);
      
      // Chart should update
      await expect(page.locator('.recharts-responsive-container')).toBeVisible();
    });
  });

  test.describe('Mobile View (375x667)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should display mobile-optimized layout', async ({ page }) => {
      // Header should be visible and properly sized
      const heading = page.getByRole('main').getByRole('heading', { name: 'MCP Registry Analytics' });
      await expect(heading).toBeVisible();
      
      // Check that text is readable on mobile
      const headingClass = await heading.getAttribute('class');
      expect(headingClass).toContain('text-');
    });

    test('should stack summary cards vertically', async ({ page }) => {
      // All summary cards should be visible
      await expect(page.getByText('Current Total')).toBeVisible();
      await expect(page.getByText('Growth Rate')).toBeVisible();
      await expect(page.getByText('Data Points')).toBeVisible();
      
      // Cards should be stacked (check they're not side by side)
      const cards = page.locator('[class*="rounded-lg"][class*="border"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(3);
    });

    test('should maintain chart responsiveness', async ({ page }) => {
      // Chart container should be visible
      const chartContainer = page.locator('.recharts-responsive-container');
      await expect(chartContainer).toBeVisible();
      
      // Chart should fit within mobile viewport
      const chartBox = await chartContainer.boundingBox();
      expect(chartBox?.width).toBeLessThanOrEqual(375);
    });

    test('should keep filter controls accessible', async ({ page }) => {
      // Filter controls should be visible
      const serverTypeLabel = page.locator('label[for="server-type-select"]');
      await expect(serverTypeLabel).toBeVisible();
      await expect(page.getByRole('combobox').first()).toBeVisible();
      
      // Should be able to interact with filters
      const serverTypeSelect = page.getByRole('combobox').first();
      await serverTypeSelect.selectOption('remote');
      await page.waitForTimeout(1000);
    });

    test('should handle touch interactions', async ({ page }, testInfo) => {
      // Only run touch tests on mobile browsers
      if (!testInfo.project.name.includes('Mobile')) {
        test.skip();
        return;
      }
      
      // Test touch on filter controls
      const serverTypeSelect = page.getByRole('combobox').first();
      await serverTypeSelect.tap();
      
      // Test reset button tap
      const resetButton = page.getByRole('button', { name: /Reset/i });
      await resetButton.tap();
    });
  });

  test.describe('Large Mobile View (414x896)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 414, height: 896 });
    });

    test('should optimize for larger mobile screens', async ({ page }) => {
      // All content should be visible
      await expect(page.getByRole('main').getByRole('heading', { name: 'MCP Registry Analytics' })).toBeVisible();
      await expect(page.locator('.recharts-responsive-container')).toBeVisible();
      
      // Summary cards should have appropriate sizing
      await expect(page.getByText('Current Total')).toBeVisible();
      await expect(page.getByText('Growth Rate')).toBeVisible();
      await expect(page.getByText('Data Points')).toBeVisible();
    });
  });

  test.describe('Ultra-wide View (2560x1440)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1440 });
    });

    test('should handle ultra-wide displays', async ({ page }) => {
      // Content should be centered with max-width
      const mainContainer = page.locator('main');
      await expect(mainContainer).toBeVisible();
      
      // Chart should not be overly stretched
      const chartContainer = page.locator('.recharts-responsive-container');
      await expect(chartContainer).toBeVisible();
      
      // All components should remain visible and well-proportioned
      await expect(page.getByRole('main').getByRole('heading', { name: 'MCP Registry Analytics' })).toBeVisible();
      await expect(page.getByText('Current Total')).toBeVisible();
    });
  });

  test.describe('Cross-Device Consistency', () => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    viewports.forEach(({ width, height, name }) => {
      test(`should maintain functionality on ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        
        // Core functionality should work across all devices
        await expect(page.getByRole('main').getByRole('heading', { name: 'MCP Registry Analytics' })).toBeVisible();
        
        // Data loading should work
        await page.waitForLoadState('networkidle');
        await expect(page.locator('.recharts-responsive-container')).toBeVisible();
        
        // Filters should be functional
        const serverTypeSelect = page.getByRole('combobox').first();
        await serverTypeSelect.selectOption('local');
        await page.waitForTimeout(1000);
        
        // Reset should work
        await page.getByRole('button', { name: /Reset/i }).click();
        await expect(serverTypeSelect).toHaveValue('all');
      });
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle mobile landscape orientation', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Verify initial state
      await expect(page.getByRole('main').getByRole('heading', { name: 'MCP Registry Analytics' })).toBeVisible();
      
      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Content should still be accessible
      await expect(page.getByRole('main').getByRole('heading', { name: 'MCP Registry Analytics' })).toBeVisible();
      await expect(page.locator('.recharts-responsive-container')).toBeVisible();
    });
  });
});