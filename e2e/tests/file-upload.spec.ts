import { test, expect } from "@playwright/test";

test.describe("File uploads (ActiveStorage)", () => {
  test("post edit form shows cover_image upload field", async ({ page }) => {
    await page.goto("/admin/post");

    await page.locator(".edit_member_link a").first().click();
    await expect(page).toHaveURL(/\/edit$/);

    // ActiveStorage file upload field
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput.first()).toBeAttached();
  });

  test("new post form has file upload for cover_image", async ({ page }) => {
    await page.goto("/admin/post/new");

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput.first()).toBeAttached();
  });
});
