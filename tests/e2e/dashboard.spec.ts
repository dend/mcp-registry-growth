import { test, expect } from '@playwright/test';

test.describe('MCP Analytics Dashboard - Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load dashboard with analytics data', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/MCP Registry Growth Analytics/);
    
    // Check main content heading (not header)
    await expect(page.getByRole('main').getByRole('heading', { name: /MCP Registry Analytics/i })).toBeVisible();
    
    // Check subtitle
    await expect(page.getByText(/Model Context Protocol server growth tracking/i)).toBeVisible();
  });

  test('should display summary statistics cards', async ({ page }) => {
    // Check for summary cards by their card titles
    await expect(page.getByText('Current Total')).toBeVisible();
    await expect(page.getByText('Growth Rate')).toBeVisible();
    await expect(page.getByText('Data Points')).toBeVisible();
    
    // Verify we have card structure
    const summaryCards = page.locator('[class*="rounded-lg"][class*="border"]');
    const cardCount = await summaryCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);
  });

  test('should display filter controls', async ({ page }) => {
    // Check that FilterControls component is rendered
    const comboboxes = page.getByRole('combobox');
    await expect(comboboxes.first()).toBeVisible(); // Server type
    await expect(comboboxes.nth(1)).toBeVisible(); // Time granularity
    
    // Check date inputs
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs.first()).toBeVisible(); // Start date
    await expect(dateInputs.last()).toBeVisible(); // End date
    
    // Check reset button
    await expect(page.getByRole('button', { name: /Reset/i })).toBeVisible();
  });

  test('should display analytics chart', async ({ page }) => {
    // Wait for chart to load
    await page.waitForTimeout(2000);
    
    // Check chart container
    await expect(page.locator('.recharts-responsive-container')).toBeVisible();
    
    // Check chart title - it's in a CardTitle in the chart card
    await expect(page.getByRole('heading', { name: 'Server Growth Over Time' })).toBeVisible();
  });

  test('should handle filter interactions', async ({ page }) => {
    // Test server type filter change
    const serverTypeSelect = page.getByRole('combobox').first();
    await serverTypeSelect.selectOption('local');
    
    // Wait for chart to update
    await page.waitForTimeout(1000);
    
    // Test time granularity change
    const timeSelect = page.getByRole('combobox').last();
    await timeSelect.selectOption('weekly');
    
    // Wait for chart to update
    await page.waitForTimeout(1000);
    
    // Test reset button
    await page.getByRole('button', { name: /Reset/i }).click();
    
    // Verify filters are reset
    await expect(serverTypeSelect).toHaveValue('all');
    await expect(timeSelect).toHaveValue('daily');
  });

  test('should display footer information', async ({ page }) => {
    // Scroll to footer to ensure it's visible
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Check footer links using exact link selectors
    await expect(page.getByRole('link', { name: 'MCP Servers Repository' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Model Context Protocol' })).toBeVisible();
    
    // Check copyright text
    await expect(page.getByText(/© \d{4} MCP Registry Analytics/)).toBeVisible();
  });

  test('should display about section', async ({ page }) => {
    // Check about this data section
    await expect(page.getByText(/About This Data/i)).toBeVisible();
    await expect(page.getByText(/Local servers:/i)).toBeVisible();
    await expect(page.getByText(/Remote servers:/i)).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test with empty data by intercepting API calls
    await page.route('**/data/analytics.csv', route => {
      route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'Not found'
      });
    });
    
    await page.reload();
    
    // Should show mock data instead
    await expect(page.getByText(/Current Total/i)).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for the filter controls to be visible
    await expect(page.getByRole('combobox').first()).toBeVisible();
    
    // Start from the beginning of the page
    await page.keyboard.press('Tab');
    
    // Find the first focusable element (might need to skip some elements)
    let attempts = 0;
    let focusedElement = '';
    while (attempts < 10) {
      focusedElement = await page.evaluate(() => document.activeElement?.tagName || '');
      if (focusedElement === 'SELECT') {
        break;
      }
      await page.keyboard.press('Tab');
      attempts++;
    }
    
    // Verify we found a SELECT element
    expect(focusedElement).toBe('SELECT');
    
    // Get the currently focused select element
    const focusedSelect = page.locator(':focus');
    await expect(focusedSelect).toBeFocused();
    
    // Test keyboard interaction with select
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  });

  test('should load and display data correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Check that chart shows data points
    const chartContainer = page.locator('.recharts-responsive-container');
    await expect(chartContainer).toBeVisible();
    
    // Verify no "No data available" message is shown
    await expect(page.getByText(/No data available/i)).not.toBeVisible();
    
    // Verify statistics show some content (even if it's mock data)
    const statsCards = page.locator('[class*="rounded-lg"][class*="border"]');
    await expect(statsCards.first()).toBeVisible();
    
    // Check that we have some numeric data displayed
    const hasNumbers = await page.locator('text=/\\d+/').count();
    expect(hasNumbers).toBeGreaterThan(0);
  });
});