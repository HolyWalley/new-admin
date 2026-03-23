import { test, expect } from "@playwright/test";

test.describe("Nested forms", () => {
  test("order edit shows nested order items", async ({ page }) => {
    await page.goto("/new-admin/order");

    await page.locator('a[href*="/edit"]').first().click();
    await expect(page).toHaveURL(/\/edit$/);

    // Should show nested order_items section
    const nestedSection = page.locator(
      '.order_items_field, [id*="order_item"], .tab-pane'
    );
    await expect(nestedSection.first()).toBeVisible();
  });

  test("order edit shows nested address", async ({ page }) => {
    await page.goto("/new-admin/order");

    await page.locator('a[href*="/edit"]').first().click();

    // Should show nested address fields
    const addressField = page.locator('[id*="address"], .address_field');
    await expect(addressField.first()).toBeAttached();
  });
});
