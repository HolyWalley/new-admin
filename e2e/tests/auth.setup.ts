import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../.auth/admin.json");

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/users/sign_in");

  await page.fill("#user_email", "admin@example.com");
  await page.fill("#user_password", "password");
  await page.locator('input[name="commit"]').click();

  // Wait for redirect to admin dashboard
  await page.waitForURL(/\/admin/, { timeout: 10000 });
  await expect(page.locator("body.rails_admin")).toBeVisible();

  await page.context().storageState({ path: authFile });
});
