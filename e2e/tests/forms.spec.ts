import { test, expect } from "@playwright/test";

test.describe("Form field types", () => {
  test("string fields render as text inputs", async ({ page }) => {
    await page.goto("/admin/page/new");

    const titleInput = page.locator("#page_title");
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveAttribute("type", "text");
  });

  test("text fields render as textareas", async ({ page }) => {
    await page.goto("/admin/order/new");

    const notesField = page.locator("#order_notes");
    await expect(notesField).toBeVisible();
    expect(await notesField.evaluate((el) => el.tagName.toLowerCase())).toBe(
      "textarea"
    );
  });

  test("boolean fields render as radio buttons", async ({ page }) => {
    await page.goto("/admin/page/new");

    // RA renders booleans as radio button pairs (true/false)
    const trueRadio = page.locator("#page_published_1");
    const falseRadio = page.locator("#page_published_0");
    await expect(trueRadio).toBeAttached();
    await expect(falseRadio).toBeAttached();
  });

  test("enum fields render with enumeration widget", async ({ page }) => {
    await page.goto("/admin/post/new");

    // RA uses select[data-enumeration] for enum fields
    const statusSelect = page.locator('select[data-enumeration="true"][name="post[status]"]');
    await expect(statusSelect).toBeAttached();
  });

  test("datetime fields have flatpickr widget", async ({ page }) => {
    await page.goto("/admin/post/new");

    // Flatpickr replaces the input with a hidden one + visible altInput
    const dateField = page.locator('[data-datetimepicker="true"]');
    await expect(dateField.first()).toBeAttached();
  });

  test("decimal fields accept numeric input", async ({ page }) => {
    await page.goto("/admin/product/new");

    const priceInput = page.locator("#product_price");
    await expect(priceInput).toBeVisible();
    await priceInput.fill("29.99");
    await expect(priceInput).toHaveValue("29.99");
  });

  test("rich text fields (ActionText) have trix editor", async ({ page }) => {
    await page.goto("/admin/post/new");

    const richText = page.locator("trix-editor");
    await expect(richText.first()).toBeVisible();
  });
});
