import { test, expect } from "@playwright/test";

test.describe("Search & Filtering", () => {
  test("global search filters records by text", async ({ page }) => {
    await page.goto("/new-admin/category");

    const searchInput = page.locator('input[name="q"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill("Technology");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/q=Technology/);

    // Should show filtered results (fewer than all categories)
    const rows = page.locator("table.table tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
    expect(await rows.count()).toBeLessThan(11);
  });

  test("enum filter via filter panel narrows results", async ({ page }) => {
    await page.goto("/new-admin/post");

    // Open "Add filter" dropdown and select status field
    await page.locator('[data-action="add-filter"]').click();
    await page.locator('[data-filter-field="status"]').click();

    // Select operator "is" and value "draft"
    const filterRow = page.locator('[name="f[status][o]"]').first().locator("..");
    // The operator should default to "is" for enum
    await page.locator('select[name="f[status][v]"]').selectOption("draft");

    // Wait for filtered results
    await page.waitForURL(/f/);

    const rows = page.locator("table.table tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("boolean filter via filter panel works", async ({ page }) => {
    await page.goto("/new-admin/post");

    // Add filter for "featured"
    await page.locator('[data-action="add-filter"]').click();
    await page.locator('[data-filter-field="featured"]').click();

    // Boolean default operator is "true" (unary) — should filter immediately
    await page.waitForURL(/f/);

    const rows = page.locator("table.table tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("search preserves through sorting", async ({ page }) => {
    await page.goto("/new-admin/category");

    const searchInput = page.locator('input[name="q"]');
    await searchInput.fill("e");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/q=e/);

    // Click a sortable column header to trigger sort
    const header = page.locator("table.table thead tr").first().locator("th").nth(1);
    await header.click();

    // Search param should survive sort navigation
    await expect(page).toHaveURL(/q=e/);
    await expect(page).toHaveURL(/sort=/);
  });

  test("clearing search shows all records", async ({ page }) => {
    // Start with a filtered view
    await page.goto("/new-admin/category?q=Technology");
    await page.waitForSelector("table.table");

    const filteredCount = await page.locator("table.table tbody tr").count();

    // Clear search via the X button
    await page.locator('[data-action="clear-search"]').click();

    await expect(page).not.toHaveURL(/q=Technology/);
    await page.waitForSelector("table.table");

    const allCount = await page.locator("table.table tbody tr").count();
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test("removing a filter restores results", async ({ page }) => {
    await page.goto("/new-admin/post");

    // Add a filter
    await page.locator('[data-action="add-filter"]').click();
    await page.locator('[data-filter-field="featured"]').click();
    await page.waitForURL(/f/);

    const filteredCount = await page.locator("table.table tbody tr").count();

    // Remove the filter
    await page.locator('[data-action="remove-filter"]').first().click();

    await page.waitForSelector("table.table");
    const allCount = await page.locator("table.table tbody tr").count();
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });
});
