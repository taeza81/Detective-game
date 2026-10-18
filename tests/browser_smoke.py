"""Functional UI checks. Run against `npm run dev` with Python Playwright installed.

DETECTIVE_BASE_URL defaults to http://127.0.0.1:5173.
CHROMIUM_PATH defaults to /usr/bin/chromium.
Screenshots and downloads go to test-results/ (ignored by Git).
"""
import csv
import io
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('DETECTIVE_BASE_URL', 'http://127.0.0.1:5173')
OUT = Path(__file__).resolve().parents[1] / 'test-results'
OUT.mkdir(exist_ok=True)
ANSWERS = {'gift': 'doyun', 'cup': 'nara', 'can': 'jun', 'books': 'miso', 'bag': 'onyu', 'plant': 'daon', 'ball': 'jun', 'library': 'doyun', 'photo': 'miso', 'scarf': 'nara', 'basket': 'onyu', 'letter': 'daon'}


def active(page):
    return page.evaluate("JSON.parse(localStorage.getItem('detective.active.v1'))")


def correct_choice(page):
    session = active(page)
    answer = ANSWERS[session['rounds'][session['index']]['caseId']]
    return page.locator(f'[data-person="{answer}"]')


def navigate(page, target):
    (page.locator('.teacher-button') if target == 'settings' else page.locator(f'.nav-item[data-page="{target}"]')).click()


def no_overflow(page, label):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), label


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    # Test that the UI sends the intended Korean text to the browser speech API.
    # Actual audible output depends on the device's installed Korean voice.
    page.add_init_script("window.__spoken = []; if ('speechSynthesis' in window) { speechSynthesis.speak = u => window.__spoken.push(u.text); speechSynthesis.cancel = () => {}; }")
    assert page.goto(BASE, wait_until='networkidle').status == 200
    page.keyboard.press('Tab')
    expect(page.locator('.skip-link')).to_be_focused()
    page.keyboard.press('Enter')
    expect(page.locator('#main')).to_be_focused()
    expect(page.locator('.story-card')).to_have_count(6)
    page.locator('[data-filter="kind"]').click()
    expect(page.locator('.story-card')).to_have_count(4)
    page.locator('[data-filter="all"]').click()
    page.screenshot(path=str(OUT / 'desktop-home.png'), full_page=True)
    page.locator('[data-case="gift"]').click()
    expect(page.locator('.person-card')).to_have_count(3)
    expect(page.locator('.clue-card')).to_have_count(3)
    # Short picture labels keep the original full-sentence audio.
    expect(page.locator('.clue-description').first).to_have_text('안경')
    expect(page.locator('.game-question p, .scene-caption')).to_have_count(0)
    expect(page.get_by_text('문 앞에 선물을 두고 갔어요.', exact=True)).to_have_count(1)
    page.locator('[data-action="clue"][data-index="0"]').click()
    assert '안경을 썼어요.' in page.evaluate('window.__spoken')
    page.locator('[data-action="read-question"]').click()
    assert any('선물을 준 사람' in text for text in page.evaluate('window.__spoken'))
    assert not page.locator('[data-action="next"]').count()

    # Retry without help must not count as first-choice independent success.
    answer = ANSWERS[active(page)['rounds'][0]['caseId']]
    page.locator(f'.person-card:not([data-person="{answer}"])').first.click()
    expect(page.locator('.retry-message')).to_be_visible()
    expect(page.locator('.person-retry-mark')).to_be_visible()
    assert page.evaluate('window.__spoken.at(-1)') == '괜찮아요. 단서를 다시 볼까요?'
    assert not active(page)['rounds'][0]['solved']
    correct_choice(page).click()
    expect(page.locator('.answer-feedback')).to_contain_text('맞아요!')
    expect(page.locator('.person-correct .person-check')).to_be_visible()
    assert page.evaluate('window.__spoken.at(-1)') == '맞아요! 잘 찾았어요.'
    assert page.locator('.person-correct').evaluate('el=>getComputedStyle(el).animationName') == 'none'
    page.locator('[data-action="next"]').click()

    # All four support levels, including a comparison crop for every candidate.
    page.locator('[data-action="clue"][data-index="1"]').click()
    clue_sentence = page.evaluate('window.__spoken.at(-1)')
    for level in range(1, 5):
        page.locator('[data-action="help"]').click()
        expect(page.locator('.help-panel-title')).to_contain_text(f'{level}단계')
        spoken = page.evaluate('window.__spoken.at(-1)')
        assert spoken.startswith(clue_sentence)
        assert page.locator('.help-panel-title strong').inner_text() not in spoken
        assert f'{level}단계' not in spoken
        if level >= 3:
            expect(page.locator('.comparison-person')).to_have_count(3)
    page.locator('[data-action="help"]').click()
    assert page.evaluate('window.__spoken.at(-1)') == spoken
    assert page.locator('.person-faded').count() >= 1
    page.screenshot(path=str(OUT / 'desktop-help.png'), full_page=True)
    correct_choice(page).click()
    page.locator('[data-action="next"]').click()

    # An independent first choice completes the session.
    correct_choice(page).click()
    page.locator('[data-action="next"]').click()
    expect(page.locator('.summary-page')).to_contain_text('오늘도 멋진 발견을 했어요!')
    assert page.evaluate("localStorage.getItem('detective.active.v1')") is None
    saved = page.evaluate("JSON.parse(localStorage.getItem('detective.records.v1'))")
    assert len(saved) == 1
    rounds = saved[0]['rounds']
    assert len(rounds[0]['attempts']) == 2 and rounds[0]['helpLevel'] == 0
    assert rounds[1]['helpLevel'] == 4 and rounds[1]['attempts'][0]['helpLevel'] == 4
    assert len(rounds[2]['attempts']) == 1 and rounds[2]['helpLevel'] == 0
    page.screenshot(path=str(OUT / 'desktop-summary.png'), full_page=True)

    navigate(page, 'home')
    expect(page.locator('.session-strip [data-action="start"]')).to_be_visible()
    assert not page.locator('[data-action="resume"]').count()
    navigate(page, 'records')
    page.locator('.session-record summary').click()
    expect(page.locator('.round-record')).to_have_count(3)
    for label in ['다시 살펴본 뒤 성공', '도움 후 성공', '독립 첫 선택 성공']:
        expect(page.locator('.record-detail')).to_contain_text(label)
    with page.expect_download() as info:
        page.locator('[data-action="export"]').click()
    csv_path = OUT / 'records.csv'
    info.value.save_as(csv_path)
    csv_rows = list(csv.reader(io.StringIO(csv_path.read_text(encoding='utf-8-sig'))))
    assert len(csv_rows) == 4 and csv_rows[0][0] == '수업 시작'
    page.screenshot(path=str(OUT / 'desktop-records.png'), full_page=True)
    page.reload(wait_until='networkidle')
    navigate(page, 'records')
    expect(page.locator('.session-record')).to_have_count(1)

    # Save all settings, reload, and verify the new game uses them.
    navigate(page, 'settings')
    for removed in ['TEACHER’S DESK', '아이의 속도에 맞춰요', '선택지와 단서, 도움 수준을 조절해 수업을 준비해 주세요.']:
        expect(page.get_by_text(removed, exact=True)).to_have_count(0)
    expect(page.locator('[data-save-state]')).to_have_text('저장됨')
    original_settings = page.evaluate("localStorage.getItem('detective.settings.v1')")
    for name, value in [('choices', 4), ('clueCount', 1), ('sessionLength', 5), ('maxHelp', 2)]:
        page.locator(f'input[name="{name}"][value="{value}"]').check()
    page.locator('#confirmAnswer').check()
    page.locator('#autoVoice').check()
    page.locator('#feedbackVoice').uncheck()
    expect(page.locator('[data-save-state]')).to_have_text('저장되지 않음')
    expect(page.locator('.preview-values dd')).to_have_text(['4명', '1개', '5문제', '최대 2단계'])
    assert page.evaluate("localStorage.getItem('detective.settings.v1')") == original_settings
    # Help does not discard unsaved changes, and focus returns to its opener.
    page.locator('[data-action="settings-help"]').click()
    expect(page.get_by_role('dialog')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.locator('[data-action="settings-help"]')).to_be_focused()
    expect(page.locator('input[name="choices"][value="4"]')).to_be_checked()
    expect(page.locator('[data-save-state]')).to_have_text('저장되지 않음')
    page.locator('button[type="submit"]').click()
    expect(page.locator('[data-save-state]')).to_have_text('저장됨')
    page.reload(wait_until='networkidle')
    navigate(page, 'settings')
    expect(page.locator('input[name="choices"][value="4"]')).to_be_checked()
    expect(page.locator('#confirmAnswer')).to_be_checked()
    expect(page.locator('#feedbackVoice')).not_to_be_checked()
    page.screenshot(path=str(OUT / 'desktop-settings.png'), full_page=True)
    navigate(page, 'home')
    page.locator('.session-strip [data-action="start"]').click()
    expect(page.locator('.person-card')).to_have_count(4)
    expect(page.locator('.clue-card')).to_have_count(1)
    expect(page.locator('.progress-step')).to_have_count(5)
    expect(page.locator('[data-action="submit"]')).to_be_disabled()
    correct_choice(page).click()
    assert not page.locator('.answer-feedback').count()
    spoken_before_submit = page.evaluate('window.__spoken.length')
    page.locator('[data-action="submit"]').click()
    expect(page.locator('.answer-feedback')).to_be_visible()
    assert page.evaluate('window.__spoken.length') == spoken_before_submit, 'muting feedback preserves visual feedback while automatic question reading stays enabled'
    page.locator('[data-action="next"]').click()
    page.locator('[data-action="help"]').click()
    page.locator('[data-action="help"]').click()
    page.locator('[data-action="help"]').click()
    assert active(page)['rounds'][1]['helpLevel'] == 2

    # Reload can resume the unfinished session; stop retains partial results.
    page.reload(wait_until='networkidle')
    page.locator('[data-action="resume"]').click()
    expect(page.locator('.help-panel-title')).to_contain_text('2단계')
    page.locator('[data-action="exit"]').click()
    expect(page.get_by_role('dialog')).to_be_visible()
    assert page.locator('.workspace').evaluate('(el) => el.inert')
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog')).to_have_count(0)
    page.locator('[data-action="exit"]').click()
    page.locator('[data-action="confirm-modal"]').click()
    navigate(page, 'records')
    expect(page.locator('.session-record')).to_have_count(2)
    expect(page.locator('.session-status.stopped')).to_have_count(1)

    # Destructive action has an explicit cancel and confirm path.
    page.locator('[data-action="clear-records"]').click()
    page.locator('[data-action="close-modal"]').click()
    expect(page.locator('.session-record')).to_have_count(2)
    page.locator('[data-action="clear-records"]').click()
    page.locator('[data-action="confirm-modal"]').click()
    expect(page.locator('.empty-state')).to_be_visible()
    assert page.evaluate("JSON.parse(localStorage.getItem('detective.records.v1'))") == []

    # The two-choice/no-help mode and settings frozen for an ongoing lesson.
    navigate(page, 'settings')
    for name, value in [('choices', 2), ('clueCount', 2), ('sessionLength', 3), ('maxHelp', 0)]:
        page.locator(f'input[name="{name}"][value="{value}"]').check()
    page.locator('#confirmAnswer').uncheck()
    page.locator('#autoVoice').uncheck()
    page.locator('button[type="submit"]').click()
    navigate(page, 'home')
    page.locator('.session-strip [data-action="start"]').click()
    expect(page.locator('.person-card')).to_have_count(2)
    expect(page.locator('.clue-card')).to_have_count(2)
    assert not page.locator('[data-action="help"], [data-action="help-top"]').count()
    navigate(page, 'settings')
    page.locator('input[name="choices"][value="4"]').check()
    page.locator('button[type="submit"]').click()
    navigate(page, 'home')
    page.locator('[data-action="resume"]').click()
    expect(page.locator('.person-card')).to_have_count(2)
    correct_choice(page).click()
    expect(page.locator('.answer-feedback')).to_be_visible()
    print('PASS: desktop gameplay, four help levels, outcomes, CSV, settings, resume, partial save, deletion')

    # Every authored story can be selected and solved through the real UI.
    authored = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    story_page = authored.new_page()
    story_page.goto(BASE, wait_until='networkidle')
    for case_id, answer_id in ANSWERS.items():
        if not story_page.locator(f'[data-case="{case_id}"]').count():
            story_page.locator('[data-action="story-page"][data-direction="1"]').click()
        story_page.locator(f'[data-case="{case_id}"]').click()
        story_page.locator(f'[data-person="{answer_id}"]').click()
        expect(story_page.locator('.answer-feedback')).to_be_visible()
        story_page.locator('[data-action="exit"]').click()
        story_page.locator('[data-action="confirm-modal"]').click()
    authored.close()
    print('PASS: all 12 authored stories are selectable and solvable')

    # Small phone and tablet layouts. Visit settings and help comparison, too.
    for width, height in [(390, 844), (768, 1024), (320, 740)]:
        mobile = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
        mobile.add_init_script("if ('speechSynthesis' in window) { speechSynthesis.speak = () => {}; speechSynthesis.cancel = () => {}; }")
        tab = mobile.new_page()
        tab.on('pageerror', lambda error: errors.append(str(error)))
        tab.goto(BASE, wait_until='networkidle')
        no_overflow(tab, f'home at {width}')
        if width == 390:
            tab.screenshot(path=str(OUT / 'mobile-home.png'), full_page=True)
        tab.locator('[data-case="gift"]').click()
        for _ in range(4):
            tab.locator('[data-action="help"]').click()
        no_overflow(tab, f'game/help at {width}')
        if width == 390:
            tab.screenshot(path=str(OUT / 'mobile-game.png'), full_page=True)
        tab.locator('.teacher-button').click()
        no_overflow(tab, f'settings at {width}')
        mobile.close()
    print('PASS: 320px, 390px, and 768px responsive home, gameplay/help, and settings')
    assert not errors, json.dumps(errors, ensure_ascii=False)
    print('PASS: no browser JavaScript errors')
    browser.close()
