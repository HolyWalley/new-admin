import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("sidebar shows all expected models", async ({ page }) => {
    await page.goto("/admin");

    const expectedModels = [
      "user",
      "category",
      "post",
      "comment",
      "tag",
      "product",
      "order",
      "page",
    ];

    for (const model of expectedModels) {
      await expect(page.locator(`li[data-model="${model}"]`)).toBeVisible();
    }
  });

  test("clicking a model in nav navigates to its list", async ({ page }) => {
    await page.goto("/admin");

    await page.locator('li[data-model="order"] a').click();
    await expect(page).toHaveURL(/\/admin\/order/);

    await expect(page.locator("table.table")).toBeVisible();
  });

  test("breadcrumbs show correct hierarchy", async ({ page }) => {
    await page.goto("/admin/post");

    const breadcrumbs = page.locator("nav[aria-label='breadcrumb']");
    await expect(breadcrumbs).toBeVisible();
    await expect(breadcrumbs).toContainText("Dashboard");
  });

  test("can navigate back to dashboard", async ({ page }) => {
    await page.goto("/admin/post");

    await page.locator('.breadcrumb a:has-text("Dashboard")').click();

    await expect(page).toHaveURL(/\/admin\/?$/);
  });

  test("STI subtypes are shown nested in sidebar", async ({ page }) => {
    await page.goto("/admin");

    // DigitalProduct and PhysicalProduct should appear as sub-items under Product
    await expect(page.locator('li[data-model="digital_product"]')).toBeVisible();
    await expect(page.locator('li[data-model="physical_product"]')).toBeVisible();
  });
});
