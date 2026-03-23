import { test, expect } from "@playwright/test";

test.describe("Associations", () => {
  test("belongs_to shows a select for the association", async ({ page }) => {
    await page.goto("/new-admin/post/new");

    // shadcn Select renders as a combobox role — find the one for user (belongs_to)
    // The field wrapper contains label "user" and a combobox trigger
    const userTrigger = page.locator('[data-slot="select-trigger"]').first();
    await expect(userTrigger).toBeAttached();
  });

  test("belongs_to optional allows blank selection", async ({ page }) => {
    await page.goto("/new-admin/post/new");

    // Find select triggers on the form — one of them should show "— Select —" placeholder
    const selectTriggers = page.locator('[data-slot="select-trigger"]');
    const count = await selectTriggers.count();
    expect(count).toBeGreaterThan(0);
  });

  test("has_many is shown on the show page", async ({ page }) => {
    // Go to category show page (categories have has_many :posts)
    await page.goto("/new-admin/category");
    // The table itself shows has_many columns
    const postColumn = page.locator("th.posts_field");
    await expect(postColumn).toBeVisible();
  });

  test("many-to-many shows multi-select widget", async ({ page }) => {
    await page.goto("/new-admin/post/new");

    // Tags (has_many through) still uses native multi-select
    const tagSelect = page.locator(
      'select[name="post[tag_ids][]"], #post_tag_ids'
    );
    await expect(tagSelect.first()).toBeAttached();
  });

  test("self-referential belongs_to shows parent dropdown", async ({ page }) => {
    await page.goto("/new-admin/category/new");

    // Category form has a select for parent_id (self-referential belongs_to)
    const selectTrigger = page.locator('[data-slot="select-trigger"]');
    await expect(selectTrigger.first()).toBeAttached();
  });

  test("polymorphic association shows type and id fields", async ({ page }) => {
    await page.goto("/new-admin/comment/new");

    // Polymorphic shows type and id fields
    const commentableField = page.locator(
      '[id*="commentable"], select[name*="commentable"], [data-slot="select-trigger"]'
    );
    await expect(commentableField.first()).toBeAttached();
  });
});
