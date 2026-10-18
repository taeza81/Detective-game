"""Regression checks for blank startup screens, run with the Vite dev server."""
import json
import os
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('DETECTIVE_BASE_URL', 'http://127.0.0.1:5173')

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    context = browser.new_context(reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE, wait_until='networkidle')
    page.locator('[data-case="gift"]').click()
    page.locator('[data-person="doyun"]').click()
    page.locator('[data-action="exit"]').click()
    page.locator('[data-action="confirm-modal"]').click()
    page.evaluate("""() => {
      const saved = JSON.parse(localStorage.getItem('detective.records.v1'))[0];
      const brokenRound = structuredClone(saved);
      brokenRound.rounds[0] = null;
      const brokenAttempt = structuredClone(saved);
      brokenAttempt.rounds[0].attempts = [null];
      localStorage.setItem('detective.records.v1', JSON.stringify([null, brokenRound, saved, brokenAttempt]));
      localStorage.setItem('detective.active.v1', JSON.stringify(brokenRound));
    }""")
    page.reload(wait_until='networkidle')
    expect(page.locator('.story-card')).to_have_count(12)
    page.locator('.nav-item[data-page="records"]').click()
    expect(page.locator('.session-record')).to_have_count(1)
    assert len(page.evaluate("JSON.parse(localStorage.getItem('detective.records.v1'))")) == 4, 'do not delete saved data on load'
    assert not errors, json.dumps(errors)
    print('PASS: malformed saved rounds and attempts do not blank the UI; valid history is preserved')
    context.close()

    # Reproduce a source HTML preview that cannot fetch the app entry.
    context = browser.new_context(reduced_motion='reduce')
    page = context.new_page()
    page.route('**/src/main.js*', lambda route: route.abort())
    page.goto(BASE, wait_until='networkidle')
    expect(page.locator('#startup-title')).to_have_text('교실을 불러오지 못했어요')
    expect(page.locator('#startup-retry')).to_be_visible()
    expect(page.locator('#startup-standalone')).to_be_visible()
    page.unroute('**/src/main.js*')
    page.locator('#startup-retry').click()
    expect(page.locator('.story-card')).to_have_count(12)
    print('PASS: blocked application entry displays recovery controls; retry recovers')
    context.close()

    # A standalone preview needs only its HTML response, even at a nested path.
    context = browser.new_context(reduced_motion='reduce')
    page = context.new_page()
    requests = []
    from pathlib import Path
    html = (Path(__file__).resolve().parents[1] / 'preview.html').read_text()
    def intercept(route):
        if route.request.url == 'http://detective.test/nested/preview.html':
            route.fulfill(status=200, content_type='text/html; charset=utf-8', body=html)
        else:
            requests.append(route.request.url)
            route.abort()
    context.route('**/*', intercept)
    page.goto('http://detective.test/nested/preview.html', wait_until='networkidle')
    expect(page.locator('.story-card')).to_have_count(12)
    page.locator('[data-case="gift"]').click()
    page.locator('[data-person="doyun"]').click()
    expect(page.locator('.answer-feedback')).to_be_visible()
    assert not requests, requests
    print('PASS: single-file preview starts and plays without external requests or module resolution')
    browser.close()
