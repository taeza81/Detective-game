"""Touch classroom, image loading, and native fullscreen regression checks."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('DETECTIVE_BASE_URL', 'http://127.0.0.1:5173')
ANSWERS = {'gift':'doyun','cup':'nara','can':'jun','books':'miso','bag':'onyu','plant':'daon','ball':'jun','library':'doyun','photo':'miso','scarf':'nara','basket':'onyu','letter':'daon'}
SETTINGS = {'choices':4,'clueCount':3,'sessionLength':5,'autoVoice':False,'maxHelp':4,'confirmAnswer':True}
SIZES = [(1024,576),(1280,720),(1366,768),(1920,1080),(2560,1440),(1280,800),(1024,768)]
OUT = Path(__file__).resolve().parents[1] / 'test-results'
OUT.mkdir(exist_ok=True)


def fits(page, selectors, label):
    failures = page.evaluate('''selectors => {
      const problems=[];
      const root=document.documentElement;
      if(root.scrollHeight>innerHeight+1 || root.scrollWidth>innerWidth+1) problems.push('document scrolls');
      const main=document.querySelector('#main');
      if(main.scrollHeight>main.clientHeight+1) problems.push('main content clipped');
      for(const selector of selectors) for(const el of document.querySelectorAll(selector)) {
        if(!el.getClientRects().length) continue;
        const r=el.getBoundingClientRect();
        if(r.left<-.5 || r.top<-.5 || r.right>innerWidth+.5 || r.bottom>innerHeight+.5) problems.push(selector+' outside viewport: '+JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height}));
        if(el.scrollWidth>el.clientWidth+1) problems.push(selector+' internal content too wide: '+el.scrollWidth+'/'+el.clientWidth);
        if(['.help-panel','.clues-panel','.candidate-grid','.settings-card','.setting-row','.settings-preview-panel'].includes(selector) && el.scrollHeight>el.clientHeight+1) problems.push(selector+' internal content clipped: '+el.scrollHeight+'/'+el.clientHeight);
      }
      return problems;
    }''', selectors)
    assert not failures, f'{label}: {failures}'


def correct(page):
    session=page.evaluate("JSON.parse(localStorage.getItem('detective.active.v1'))")
    return page.locator(f'[data-person="{ANSWERS[session["rounds"][session["index"]]["caseId"]]}"]')


with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    errors=[]
    for width,height in SIZES:
        context=browser.new_context(viewport={'width':width,'height':height},screen={'width':width,'height':height},has_touch=True,reduced_motion='reduce')
        context.add_init_script("localStorage.setItem('detective.settings.v1',"+json.dumps(json.dumps(SETTINGS))+"); if('speechSynthesis' in window){speechSynthesis.speak=()=>{};speechSynthesis.cancel=()=>{};}")
        page=context.new_page()
        page.on('pageerror',lambda error: errors.append(str(error)))
        page.goto(BASE,wait_until='networkidle')
        fits(page,['.story-card','.story-pagination','.teacher-button','.fullscreen-button'],'home '+str((width,height)))
        first=page.locator('.story-card').evaluate_all('(cards)=>cards.map(el=>el.dataset.case)')
        page.locator('[data-action="story-page"][data-direction="1"]').tap()
        second=page.locator('.story-card').evaluate_all('(cards)=>cards.map(el=>el.dataset.case)')
        assert len(set(first+second))==12
        fits(page,['.story-card','.story-pagination'],'home page 2')
        page.locator('[data-action="story-page"][data-direction="-1"]').tap()
        page.locator('[data-case="gift"]').tap()
        page.wait_for_load_state('networkidle')
        targets=['.game-top','.scene-slot','.clues-panel','.clue-card','.candidate-grid','.person-card','.game-bottom','[data-action="help"]','[data-action="submit"]','.teacher-button','.fullscreen-button']
        fits(page,targets,'game '+str((width,height)))
        assert page.locator('.game-question h1').evaluate('el=>parseFloat(getComputedStyle(el).fontSize)') >= 26
        assert page.locator('.clue-description').first.evaluate('el=>parseFloat(getComputedStyle(el).fontSize)') >= 19
        # Verify images decode, beyond merely observing HTTP 200 or SVG elements.
        decoded=page.evaluate('''async()=>{
          const urls=[...new Set([...document.querySelectorAll('svg image')].map(el=>el.getAttribute('href')))];
          return Promise.all(urls.map(async src=>{const img=new Image();img.src=src;await img.decode();return img.naturalWidth>0;}));
        }''')
        assert all(decoded) and len(decoded)>=3
        if width==1280 and height==720:
            page.locator('[data-action="fullscreen"]').tap()
            expect(page.locator('[data-action="fullscreen"]')).to_have_text('창모드')
            assert page.evaluate('Boolean(document.fullscreenElement)')
        for level in range(1,5):
            page.locator('[data-action="help"]').tap()
            expect(page.locator('.help-panel-title')).to_contain_text(f'{level}단계')
            fits(page,targets+['.help-panel','.comparison-person'],f'help {level} '+str((width,height)))
        if width==1280 and height==720:
            expect(page.locator('[data-action="fullscreen"]')).to_have_text('창모드')
            page.locator('[data-action="fullscreen"]').tap()
            expect(page.locator('[data-action="fullscreen"]')).to_have_text('전체화면')
            assert not page.evaluate('Boolean(document.fullscreenElement)')
            page.locator('[data-action="fullscreen"]').tap()
            page.evaluate('document.exitFullscreen()')
            expect(page.locator('[data-action="fullscreen"]')).to_have_text('전체화면')
        if width in [1024,1280,1920] and height in [576,720,1080]:
            page.screenshot(path=str(OUT/f'classroom-help-{width}.png'))
        page.locator('[data-action="show-scene"]').tap()
        expect(page.locator('.scene-panel')).to_be_visible()
        assert page.evaluate("JSON.parse(localStorage.getItem('detective.active.v1')).rounds[0].helpLevel")==4
        page.locator('.teacher-button').tap()
        fits(page,['.settings-card','.setting-row','.option-pill > span','.settings-preview-panel','.settings-actions','button[type="submit"]','.page-intro'], 'settings '+str((width,height)))
        if width in [1024,1920] and height in [576,1080]:
            page.screenshot(path=str(OUT/f'classroom-settings-{width}.png'))
        gear=page.locator('.teacher-button').bounding_box()
        assert gear['x']+gear['width']>=width-50 and gear['y']<30
        page.locator('.page-intro [data-page="game"]').tap()
        answer_id=correct(page).get_attribute('data-person')
        page.locator(f'.person-card:not([data-person="{answer_id}"])').first.tap()
        page.locator('[data-action="submit"]').tap()
        expect(page.locator('.retry-message')).to_be_visible()
        fits(page,['.person-card','.game-bottom','.retry-message','.person-retry-mark','[data-action="help"]','[data-action="submit"]'],'retry '+str((width,height)))
        correct(page).tap()
        page.locator('[data-action="submit"]').tap()
        fits(page,['.person-card','.answer-feedback','[data-action="next"]'],'answer '+str((width,height)))
        page.locator('[data-action="next"]').tap()
        for _ in range(4):
            correct(page).tap()
            page.locator('[data-action="submit"]').tap()
            page.locator('[data-action="next"]').tap()
        expect(page.locator('.summary-page')).to_be_visible()
        fits(page,['.summary-page','.summary-actions','.summary-stories'],'summary '+str((width,height)))
        print(f'PASS: {width}x{height}, touch pagination, 4 choices, all help levels, settings, answers, 5-story summary, decoded art; no scroll',flush=True)
        context.close()
    assert not errors,json.dumps(errors)
    print('PASS: native fullscreen/window controls and external fullscreen exit stay synchronized; no JS errors',flush=True)
    browser.close()
