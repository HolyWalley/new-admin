import { test, expect } from "@playwright/test";

test.describe("CRUD operations", () => {
  test("can create a new category", async ({ page }) => {
    await page.goto("/admin/category/new");

    const uniqueName = `Test Category ${Date.now()}`;
    await page.fill("#category_name", uniqueName);
    await page.fill("#category_description", "A test description");
    await page.fill("#category_position", "99");

    await page.locator('button[name="_save"]').click();
    await page.waitForLoadState("networkidle");

    // After successful create, RA redirects to list with flash message
    await expect(page.locator(".alert")).toContainText(/successfully created/i);
  });

  test("can view a category (show page)", async ({ page }) => {
    await page.goto("/admin/category");

    await page.locator(".show_member_link a").first().click();

    await expect(page).toHaveURL(/\/admin\/category\/\d+$/);
    await expect(page.locator(".breadcrumb")).toContainText("Category");
  });

  test("can edit a category", async ({ page }) => {
    await page.goto("/admin/category");

    await page.locator(".edit_member_link a").first().click();
    await expect(page).toHaveURL(/\/admin\/category\/\d+\/edit/);

    const nameInput = page.locator("#category_name");
    await nameInput.clear();
    const uniqueName = `Updated Category ${Date.now()}`;
    await nameInput.fill(uniqueName);

    await page.locator('button[name="_save"]').click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".alert")).toContainText(/successfully updated/i);
  });

  test("can delete a category", async ({ page }) => {
    // First create one to delete
    const uniqueName = `To Delete ${Date.now()}`;
    await page.goto("/admin/category/new");
    await page.fill("#category_name", uniqueName);
    await page.locator('button[name="_save"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator(".alert")).toContainText(/successfully created/i);

    // Go to list and find it
    await page.goto("/admin/category");
    const row = page.locator("tr").filter({ hasText: uniqueName });
    await row.locator(".delete_member_link a").click();

    // Confirm deletion page
    await expect(page).toHaveURL(/\/delete$/);
    await page.locator('button[type="submit"], input[type="submit"]').first().click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".alert")).toContainText(/successfully deleted/i);
  });

  test("validation errors are shown", async ({ page }) => {
    await page.goto("/admin/category/new");

    // Remove HTML5 required to bypass browser validation
    await page.locator("#category_name").evaluate((el) =>
      el.removeAttribute("required")
    );
    await page.locator('button[name="_save"]').click();

    await expect(page.locator("body")).toContainText(/blank|error/i);
  });
});
