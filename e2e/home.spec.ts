import { test, expect } from "@playwright/test";

test.describe("home", () => {
  test("redirects unauthenticated users or shows app shell", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/GENEX/i);
  });
});
