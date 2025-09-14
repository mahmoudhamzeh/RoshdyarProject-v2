from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the local index.html file
    path = os.path.abspath('client/build/index.html')
    page.goto(f"file://{path}")

    # === Mobile View Verification ===
    page.set_viewport_size({"width": 375, "height": 667})
    expect(page.get_by_text("رشدیار 👶")).to_be_visible(timeout=10000)
    page.screenshot(path="jules-scratch/verification/mobile_view.png")

    # Click toggler
    toggler = page.locator(".navbar-toggler")
    expect(toggler).to_be_visible()
    toggler.click()
    expect(page.locator(".navbar-links.active")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/mobile_menu_open.png")

    # === Desktop View Verification ===
    page.set_viewport_size({"width": 1280, "height": 720})
    page.screenshot(path="jules-scratch/verification/desktop_view.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
