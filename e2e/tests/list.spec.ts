import { test, expect } from "@playwright/test";

test.describe("List view", () => {
  test("displays a table of records", async ({ page }) => {
    await page.goto("/new-admin/post");

    const table = page.locator("table.table");
    await expect(table).toBeVisible();

    // Should have table headers
    const headers = table.locator("thead th");
    await expect(headers.first()).toBeVisible();

    // Should have data rows
    const rows = table.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("shows pagination when there are many records", async ({ page }) => {
    await page.goto("/new-admin/post");

    // 30 posts were seeded, default page size is 20
    // Pagination buttons should be visible
    const pagination = page.locator("text=Showing 1 to 20");
    await expect(pagination).toBeVisible();
  });

  test("sorting works via column headers", async ({ page }) => {
    await page.goto("/new-admin/category");

    // Click on the name column header to sort
    const nameHeader = page.locator("th.name_field");
    await nameHeader.click();

    await expect(page).toHaveURL(/sort=name/);
  });

  test("shows correct record count info", async ({ page }) => {
    await page.goto("/new-admin/user");

    // Should display record count
    const count = page.locator("text=/\\d+ records?/");
    await expect(count).toBeVisible();

    // Should have table rows
    await expect(page.locator("table.table tbody tr").first()).toBeVisible();
  });
});
