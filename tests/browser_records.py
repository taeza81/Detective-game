"""Record readability, long histories, keyboard controls, CSV and deletion."""
import csv
import io
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('DETECTIVE_BASE_URL', 'http://127.0.0.1:5173')
OUT = ROOT / 'test-results'
OUT.mkdir(exist_ok=True)
fixtures = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', '''
import {createSession,recordAttempt,defaultSettings,cases} from %s;
const complete=createSession(defaultSettings,'gift');
complete.id='complete'; complete.startedAt='2026-10-18T11:36:00Z'; complete.status='completed';
complete.rounds=complete.rounds.map((round,i)=>{
  const answer=cases.find(c=>c.id===round.caseId).answer;
  if(i===0) for(let n=0;n<12;n++) round=recordAttempt(round,round.candidates.find(id=>id!==answer),answer);
  if(i===1) round.helpLevel=3;
  return recordAttempt(round,answer,answer);
});
const partial=createSession(defaultSettings,'gift');
partial.id='partial'; partial.startedAt='2025-09-20T08:10:00Z'; partial.status='stopped';
partial.rounds[0]=recordAttempt(partial.rounds[0],partial.rounds[0].candidates.find(id=>id!=='doyun'),'doyun');
partial.rounds[1].helpLevel=2;
delete partial.settings.feedbackVoice;
const empty=createSession(defaultSettings,'cup');
empty.id='empty'; empty.startedAt='2026-06-10T10:00:00Z'; empty.status='stopped';
console.log(JSON.stringify([complete,partial,empty]));
''' % json.dumps((ROOT / 'src/data.js').as_uri())], text=True))


def no_clipping(page):
    failures = page.evaluate('''() => {
      const errors=[];
      if(document.documentElement.scrollWidth>innerWidth+1) errors.push('document scrolls horizontally');
      const selectors=['#main','.records-page','.record-actions .button','.record-stat','.session-record','.round-record','.round-record dd','.attempt-list li'];
      for(const selector of selectors) for(const el of document.querySelectorAll(selector)) {
        if(!el.getClientRects().length) continue;
        if(el.scrollWidth>el.clientWidth+1) errors.push(selector+' clips text');
      }
      for(const span of document.querySelectorAll('.record-actions .button > span')) {
        const style=getComputedStyle(span);
        const lineHeight=parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.6;
        if(span.getBoundingClientRect().height>lineHeight*1.5) errors.push('action text wraps');
      }
      return errors;
    }''')
    assert not failures, failures


with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    errors=[]
    for width,height in [(1920,1080),(1280,720),(1024,576),(768,1024),(390,844),(320,740)]:
        context=browser.new_context(viewport={'width':width,'height':height},has_touch=True,reduced_motion='reduce',accept_downloads=True)
        page=context.new_page()
        page.on('pageerror',lambda error: errors.append(str(error)))
        page.goto(BASE,wait_until='networkidle')
        page.evaluate('records=>localStorage.setItem("detective.records.v1",JSON.stringify(records))',fixtures)
        page.reload(wait_until='networkidle')
        page.get_by_role('button',name='학습 기록',exact=True).tap()
        expect(page.locator('.records-header h1')).to_have_text('학습 기록')
        expect(page.locator('.record-stat-value')).to_have_text(['3회','1문제','1문제','1문제'])
        expect(page.locator('.session-record')).to_have_count(3)
        expect(page.locator('.session-record time').first).to_contain_text('2026년 10월 18일')
        expect(page.locator('.record-score').first).to_contain_text('맞힌 문제')
        no_clipping(page)
        if width in [1920,390]:
            page.screenshot(path=str(OUT/f'records-overview-{width}.png'))

        # Native summaries remain operable by keyboard, including nested history.
        first=page.locator('.session-record').first
        first.locator(':scope > summary').focus()
        page.keyboard.press('Enter')
        expect(first.locator('.record-detail')).to_be_visible()
        expect(first.locator('.outcome')).to_have_text(['다시 선택해 성공','도움받아 성공','첫 선택 성공'])
        expect(first.locator('.record-response-count')).to_have_text('응답한 문제 3 / 3')
        history=first.locator('.attempt-history').first
        history.locator('summary').focus()
        page.keyboard.press('Enter')
        expect(history.locator('li')).to_have_count(13)
        expect(history.locator('li').last).to_contain_text('맞음')
        expect(history.locator('li').last).to_contain_text('도움 없음')
        no_clipping(page)
        if width in [1920,390]:
            first.locator('.round-record').first.scroll_into_view_if_needed()
            page.screenshot(path=str(OUT/f'records-detail-{width}.png'))

        empty=page.locator('.session-record').nth(1)
        empty.locator(':scope > summary').tap()
        expect(empty.locator('.unanswered-note')).to_have_count(3)
        expect(empty.locator('.record-response-count')).to_have_text('응답한 문제 0 / 3')
        partial=page.locator('.session-record').nth(2)
        partial.locator(':scope > summary').tap()
        expect(partial.locator('.unanswered-note')).to_have_count(2)
        expect(partial.locator('.unanswered-note').first).to_contain_text('사용한 도움: 2단계 · 볼 곳 안내')

        no_clipping(page)
        with page.expect_download() as download:
            page.locator('[data-action="export"]').tap()
        path=OUT/f'records-{width}.csv'
        download.value.save_as(path)
        rows=list(csv.reader(io.StringIO(path.read_text(encoding='utf-8-sig'))))
        assert len(rows)==10 and rows[0][0]=='수업 시작'
        assert rows[1][-2]=='다시 살펴본 뒤 성공'

        page.locator('[data-action="clear-records"]').tap()
        page.keyboard.press('Escape')
        expect(page.locator('[data-action="clear-records"]')).to_be_focused()
        expect(page.locator('.session-record')).to_have_count(3)
        page.locator('[data-action="clear-records"]').tap()
        page.locator('[data-action="confirm-modal"]').tap()
        expect(page.locator('.empty-state')).to_be_visible()
        expect(page.locator('[data-action="export"]')).to_be_disabled()
        expect(page.locator('[data-action="clear-records"]')).to_be_disabled()
        no_clipping(page)
        assert page.evaluate('JSON.parse(localStorage.getItem("detective.records.v1"))')==[]
        print(f'PASS: records at {width}x{height}; mixed/unfinished/legacy records, 13 responses, keyboard, CSV and guarded deletion; no clipped text',flush=True)
        context.close()
    assert not errors,json.dumps(errors)
    browser.close()
