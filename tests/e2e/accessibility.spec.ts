import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('MCP Analytics Dashboard - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to fully load including data
    await page.waitForLoadState('networkidle');
  });

  test('should not have any accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check main heading exists and is h1
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/MCP Registry Analytics/i);
    
    // Check for proper heading hierarchy
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible form controls', async ({ page }) => {
    // Check that all form controls have proper labels
    const serverTypeSelect = page.getByRole('combobox').first();
    await expect(serverTypeSelect).toHaveAttribute('aria-label');
    
    const timeGranularitySelect = page.getByRole('combobox').last();
    await expect(timeGranularitySelect).toHaveAttribute('aria-label');
    
    // Check date inputs have labels
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs.first()).toBeVisible();
    await expect(dateInputs.last()).toBeVisible();
    
    // Run accessibility scan on form controls
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.filter-controls')
      .withTags(['wcag2a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible buttons', async ({ page }) => {
    // Check reset button is accessible
    const resetButton = page.getByRole('button', { name: /reset/i });
    await expect(resetButton).toBeVisible();
    await expect(resetButton).toBeEnabled();
    
    // Verify button has proper accessible name
    const buttonText = await resetButton.textContent();
    expect(buttonText?.trim()).toBeTruthy();
    
    // Run accessibility scan on buttons
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('button')
      .withTags(['wcag2a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible charts and data visualization', async ({ page }) => {
    // Check chart container is accessible
    const chartContainer = page.locator('.recharts-responsive-container');
    await expect(chartContainer).toBeVisible();
    
    // Chart should have proper ARIA labels or descriptions
    // Note: Recharts may need additional accessibility configuration
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.recharts-responsive-container')
      .withTags(['wcag2a', 'wcag21aa'])
      .disableRules(['color-contrast']) // Charts may have dynamic colors
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should maintain focus management', async ({ page }) => {
    // Test that all interactive elements are focusable
    const firstSelect = page.getByRole('combobox').first();
    await firstSelect.focus();
    await expect(firstSelect).toBeFocused();
    
    const secondSelect = page.getByRole('combobox').last();
    await secondSelect.focus();
    await expect(secondSelect).toBeFocused();
    
    // Test date inputs are focusable
    const dateInputs = page.locator('input[type="date"]');
    const firstDateInput = dateInputs.first();
    await firstDateInput.focus();
    await expect(firstDateInput).toBeFocused();
    
    const secondDateInput = dateInputs.last();
    await secondDateInput.focus();
    await expect(secondDateInput).toBeFocused();
    
    // Test reset button is focusable
    const resetButton = page.getByRole('button', { name: /reset/i });
    await resetButton.focus();
    await expect(resetButton).toBeFocused();
  });

  test('should have proper color contrast', async ({ page }) => {
    // Test color contrast compliance
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toEqual([]);
  });

  test('should be screen reader friendly', async ({ page }) => {
    // Check for proper semantic structure
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    
    // Check that content is properly structured
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21aa'])
      .analyze();
    
    // Check for landmark violations
    const landmarkViolations = accessibilityScanResults.violations.filter(
      violation => violation.tags.includes('landmark')
    );
    
    expect(landmarkViolations).toEqual([]);
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Reload page with reduced motion
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Chart should still be visible and functional
    await expect(page.locator('.recharts-responsive-container')).toBeVisible();
    
    // No accessibility violations with reduced motion
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be accessible on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for responsive layout to adjust
    await page.waitForTimeout(1000);
    
    // Run accessibility scan on mobile layout
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible error states', async ({ page }) => {
    // Mock data loading error
    await page.route('**/data/analytics.csv', route => {
      route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'Not found'
      });
    });
    
    await page.reload();
    
    // Should still be accessible even with errors
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for required ARIA attributes
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-required-attr', 'aria-valid-attr-value', 'aria-valid-attr'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard-only navigation', async ({ page }) => {
    // Test complete keyboard navigation workflow
    
    // Start at first interactive element
    await page.keyboard.press('Tab');
    const firstSelect = page.getByRole('combobox').first();
    await expect(firstSelect).toBeFocused();
    
    // Use keyboard to change server type
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Navigate to next control
    await page.keyboard.press('Tab');
    const secondSelect = page.getByRole('combobox').last();
    await expect(secondSelect).toBeFocused();
    
    // Use keyboard to change time granularity
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Navigate to reset button and activate
    const resetButton = page.getByRole('button', { name: /reset/i });
    await resetButton.focus();
    await expect(resetButton).toBeFocused();
    
    await page.keyboard.press('Enter');
    
    // Verify reset worked
    await expect(firstSelect).toHaveValue('all');
  });
});