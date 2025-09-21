import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Log in
        page.goto("http://localhost:3000/login")
        page.get_by_label("نام کاربری").fill("testuser")
        page.get_by_label("رمز عبور").fill("password123")
        page.get_by_role("button", name="ورود").click()
        expect(page).to_have_url("http://localhost:3000/dashboard")
        print("Login successful.")

        # Navigate to My Children page
        page.get_by_role("link", name="مدیریت کودکان").click()
        expect(page.get_by_role("heading", name="کودکان من")).to_be_visible()
        print("Navigated to My Children page.")

        # --- Test Mobile Viewport ---
        print("Testing mobile viewport (375x812)...")
        page.set_viewport_size({"width": 375, "height": 812})
        # Take screenshot of the header area
        header_element_mobile = page.locator(".page-nav-final")
        expect(header_element_mobile).to_be_visible()
        header_element_mobile.screenshot(path="jules-scratch/verification/header_fix_mobile.png")
        print("Mobile screenshot captured: header_fix_mobile.png")

        # --- Test Desktop Viewport ---
        print("Testing desktop viewport (1280x720)...")
        page.set_viewport_size({"width": 1280, "height": 720})
        # Take screenshot of the header area
        header_element_desktop = page.locator(".page-nav-final")
        expect(header_element_desktop).to_be_visible()
        header_element_desktop.screenshot(path="jules-scratch/verification/header_fix_desktop.png")
        print("Desktop screenshot captured: header_fix_desktop.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
