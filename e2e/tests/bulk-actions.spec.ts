import { test, expect } from "@playwright/test";

test.describe("Bulk actions", () => {
  test("checkboxes appear on list view for bulk selection", async ({ page }) => {
    await page.goto("/admin/tag");

    // Row checkboxes
    const checkboxes = page.locator('input[name="bulk_ids[]"]');
    await expect(checkboxes.first()).toBeVisible();
  });

  test("select all checkbox toggles all rows", async ({ page }) => {
    await page.goto("/admin/tag");

    const selectAll = page.locator("input.toggle");
    await selectAll.check();

    const rowCheckboxes = page.locator('input[name="bulk_ids[]"]');
    const count = await rowCheckboxes.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked();
    }
  });

  test("bulk delete action is available", async ({ page }) => {
    await page.goto("/admin/tag");

    // Check a row
    await page.locator('input[name="bulk_ids[]"]').first().check();

    // Bulk actions dropdown
    const bulkDelete = page.locator('.bulk-link[data-action="bulk_delete"]');
    await expect(bulkDelete).toBeAttached();
  });
});
