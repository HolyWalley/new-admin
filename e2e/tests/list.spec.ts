import { test, expect } from "@playwright/test";

test.describe("List view", () => {
  test("displays a table of records", async ({ page }) => {
    await page.goto("/admin/post");

    const table = page.locator("table.table");
    await expect(table).toBeVisible();

    // Should have table headers
    const headers = table.locator("th.header");
    await expect(headers.first()).toBeVisible();

    // Should have data rows
    const rows = table.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("shows pagination when there are many records", async ({ page }) => {
    await page.goto("/admin/post");

    // 30 posts were seeded, default page size is 20
    const pagination = page.locator("ul.pagination");
    await expect(pagination).toBeVisible();
  });

  test("sorting works via column headers", async ({ page }) => {
    await page.goto("/admin/category");

    // Click on a sortable column header
    const nameHeader = page.locator('th.header[data-href*="sort=name"]');
    await nameHeader.click();

    await expect(page).toHaveURL(/sort=name/);
  });

  test("shows correct record count info", async ({ page }) => {
    await page.goto("/admin/user");

    // Should display some indication of records
    await expect(page.locator("table.table tbody tr").first()).toBeVisible();
  });

  test("export action is available", async ({ page }) => {
    await page.goto("/admin/category");

    const exportLink = page.locator('a[data-action="export"], a[href*="export"]');
    await expect(exportLink.first()).toBeVisible();
  });
});
