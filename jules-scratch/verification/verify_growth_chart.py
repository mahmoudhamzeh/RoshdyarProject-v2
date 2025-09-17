import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            await page.goto("http://localhost:3000/")

            # Sign up
            await page.get_by_placeholder("ایمیل یا شماره موبایل").fill("testuser")
            await page.get_by_placeholder("رمز عبور").fill("password")
            await page.get_by_role("button", name="ثبت‌نام").click()
            await expect(page.locator("p")).to_contain_text("ثبت‌نام موفقیت‌آمیز بود")

            # Log in
            await page.get_by_role("button", name="ورود").click()
            await expect(page).to_have_url("http://localhost:3000/dashboard")

            # Go to growth chart
            await page.get_by_role("link", name="نمودار رشد").click()
            await expect(page).to_have_url("http://localhost:3000/my-children/1/growth-chart")

            # Wait for chart to render
            await page.wait_for_selector(".recharts-surface")

            await page.screenshot(path="jules-scratch/verification/verification.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            await browser.close()

asyncio.run(main())
