import { test, expect } from "@playwright/test";

test.describe("Forms Page", () => {
  test("should redirect an unauthenticated user to the Login Page", async ({
    page,
  }) => {
    await page.goto("forms/AL/2026/1");
    await expect(page).toHaveURL("/login");
  });
});
