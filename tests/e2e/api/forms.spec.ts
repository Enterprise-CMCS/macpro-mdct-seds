import { test, expect } from "@playwright/test";

test.describe("Forms Endpoint", () => {
  test("should return a client error for an unauthenticated request to a secure resource", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const API_URL = await page.evaluate(() => (window as any)._env_.API_URL);
    const response = await request.get(`${API_URL}/forms/AL/2026/1`);
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThanOrEqual(499);
  });
});
