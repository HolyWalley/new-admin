import { test, expect } from "@playwright/test";

test.describe("STI (Single Table Inheritance)", () => {
  test("product list shows STI type column", async ({ page }) => {
    await page.goto("/new-admin/product");

    const table = page.locator("table.table");
    await expect(table).toBeVisible();

    const body = await page.locator("table.table").textContent();
    expect(body).toMatch(/DigitalProduct|PhysicalProduct/);
  });

  test("can navigate to DigitalProduct model", async ({ page }) => {
    await page.goto("/new-admin/digital_product");

    await expect(page.locator("table.table")).toBeVisible();
  });

  test("can navigate to PhysicalProduct model", async ({ page }) => {
    await page.goto("/new-admin/physical_product");

    await expect(page.locator("table.table")).toBeVisible();
  });

  test("digital product form shows download_url field", async ({ page }) => {
    await page.goto("/new-admin/digital_product/new");

    await expect(page.locator("#digital_product_download_url")).toBeVisible();
  });

  test("physical product form shows weight field", async ({ page }) => {
    await page.goto("/new-admin/physical_product/new");

    await expect(page.locator("#physical_product_weight_kg")).toBeVisible();
  });
});
