from playwright.sync_api import sync_playwright, expect
import os
import time

def run(playwright):
    # Ensure the verification directory exists
    os.makedirs('jules-scratch/verification', exist_ok=True)

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    try:
        # 1. Login and verify UI layout
        page.goto('http://localhost:3000/login')
        page.get_by_placeholder('ایمیل یا شماره موبایل').fill('admin')
        page.get_by_placeholder('رمز عبور').fill('admin')
        page.get_by_role('button', name='ورود').click()
        expect(page).to_have_url('http://localhost:3000/dashboard')
        page.goto('http://localhost:3000/my-children')

        # Take screenshot to verify UI layout
        page.screenshot(path='jules-scratch/verification/layout_fix.png')
        assert os.path.exists('jules-scratch/verification/layout_fix.png'), "Layout screenshot was not created!"
        print('Phase 1: Layout verification screenshot taken.')

        # 2. Add a new child and verify it appears
        unique_id = int(time.time())
        child_first_name = f"TestChild{unique_id}"
        child_last_name = "Last"
        child_full_name = f"{child_first_name} {child_last_name}"

        page.get_by_role('button', name='+ افزودن کودک جدید').click()
        expect(page).to_have_url('http://localhost:3000/add-child')

        page.locator('input[name="firstName"]').fill(child_first_name)
        page.locator('input[name="lastName"]').fill(child_last_name)
        page.get_by_role('button', name='ذخیره').click()

        page.on("dialog", lambda dialog: dialog.accept())

        expect(page).to_have_url("http://localhost:3000/my-children", timeout=10000)
        expect(page.get_by_text(child_full_name, exact=True)).to_be_visible()
        print('Phase 2: Add child functionality verified.')

        # 3. Edit the new child and verify form population
        page.locator('.child-card-final').filter(has_text=child_full_name).get_by_role('button', name='ویرایش').click()

        expect(page).to_have_url(lambda url: '/edit-child/' in url)
        expect(page.locator('input[name="firstName"]')).to_have_value(child_first_name)
        expect(page.locator('input[name="lastName"]')).to_have_value(child_last_name)

        # Take screenshot to verify populated form
        page.screenshot(path='jules-scratch/verification/edit_form_fix.png')
        assert os.path.exists('jules-scratch/verification/edit_form_fix.png'), "Edit form screenshot was not created!"
        print('Phase 3: Edit form population verified.')

        print('All verifications successful!')

    except Exception as e:
        print(f'An error occurred: {e}')
        print("Page content on failure:")
        print(page.content())
        page.screenshot(path='jules-scratch/verification/error.png')
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
