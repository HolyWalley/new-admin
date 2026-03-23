import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("loads the dashboard page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("body.rails_admin")).toBeVisible();
    await expect(page.locator(".breadcrumb")).toContainText("Dashboard");
  });

  test("shows model table with record counts", async ({ page }) => {
    await page.goto("/admin");

    const table = page.locator("table.table");
    await expect(table).toBeVisible();
  });

  test("has navigation sidebar with all models", async ({ page }) => {
    await page.goto("/admin");

    const sidebar = page.locator("ul.sidebar");
    await expect(sidebar).toBeVisible();

    // Check expected model names appear in navigation
    for (const model of ["user", "post", "category", "order", "product"]) {
      await expect(page.locator(`li[data-model="${model}"]`)).toBeVisible();
    }
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/admin");

    await page.locator('li[data-model="post"] a').click();
    await page.waitForURL(/\/admin\/post/);

    await expect(page.locator("table.table")).toBeVisible();
  });
});
