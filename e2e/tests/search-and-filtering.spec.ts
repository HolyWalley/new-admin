import { test, expect } from "@playwright/test";

test.describe("Search & Filtering", () => {
  test("global search filters records by text", async ({ page }) => {
    await page.goto("/new-admin/category");

    const searchInput = page.locator('input[name="q"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill("Technology");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/q=Technology/);

    // Should show filtered results (fewer than all 11 categories)
    const rows = page.locator("table.table tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
    expect(await rows.count()).toBeLessThan(11);
  });

  test("enum filter narrows results", async ({ page }) => {
    await page.goto("/new-admin/post");

    // Toggle filter row visible
    await page.locator('[data-action="toggle-filters"]').click();

    // Select status = draft
    const statusFilter = page.locator('select[name="f[status]"]');
    await expect(statusFilter).toBeVisible();
    await statusFilter.selectOption("draft");

    // Wait for navigation with filter param
    await page.waitForURL(/f/);

    const rows = page.locator("table.table tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  test("boolean filter works", async ({ page }) => {
    await page.goto("/new-admin/post");

    await page.locator('[data-action="toggle-filters"]').click();

    const featuredFilter = page.locator('select[name="f[featured]"]');
    await expect(featuredFilter).toBeVisible();
    await featuredFilter.selectOption("true");

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
});
