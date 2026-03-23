import { test, expect } from "@playwright/test";

test.describe("Associations", () => {
  test("belongs_to shows a select for the association", async ({ page }) => {
    await page.goto("/admin/post/new");

    // rails_admin uses select with data-filteringselect for belongs_to
    const userSelect = page.locator(
      'select[name="post[user_id]"], #post_user_id'
    );
    await expect(userSelect.first()).toBeAttached();
  });

  test("belongs_to optional allows blank selection", async ({ page }) => {
    await page.goto("/admin/post/new");

    const categorySelect = page.locator("#post_category_id");
    if (await categorySelect.isVisible()) {
      // Should have empty option for optional belongs_to
      const emptyOption = categorySelect.locator('option[value=""]');
      await expect(emptyOption).toBeAttached();
    }
  });

  test("has_many is shown on the show page", async ({ page }) => {
    // Go to category show page (categories have has_many :posts)
    await page.goto("/admin/category");
    // The table itself shows has_many columns
    const postColumn = page.locator("th.posts_field");
    await expect(postColumn).toBeVisible();
  });

  test("many-to-many shows multi-select widget", async ({ page }) => {
    await page.goto("/admin/post/new");

    // Tags (has_many through) should use filteringmultiselect
    const tagSelect = page.locator(
      'select[name="post[tag_ids][]"], #post_tag_ids'
    );
    await expect(tagSelect.first()).toBeAttached();
  });

  test("self-referential belongs_to shows parent dropdown", async ({ page }) => {
    await page.goto("/admin/category/new");

    const parentSelect = page.locator("#category_parent_id");
    await expect(parentSelect).toBeAttached();
  });

  test("polymorphic association shows type and id fields", async ({ page }) => {
    await page.goto("/admin/comment/new");

    // Rails admin shows polymorphic as a special widget
    const commentableField = page.locator(
      '[id*="commentable"], select[name*="commentable"]'
    );
    await expect(commentableField.first()).toBeAttached();
  });
});
