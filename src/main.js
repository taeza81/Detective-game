import "@fontsource-variable/noto-sans-kr";
import "./style.css";
import {
  characters,
  cases,
  clues,
  categories,
  defaultSettings,
  helpNames,
  createSession,
  recordAttempt,
  getOutcome,
  sanitizeSettings,
  isValidSession,
} from "./data.js";
import {
  icon,
  logo,
  scene,
  avatar,
  avatarCrop,
  clueArt,
  heroArt,
} from "./art.js";

const KEYS = {
  settings: "detective.settings.v1",
  records: "detective.records.v1",
  active: "detective.active.v1",
};
const app = document.querySelector("#app");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
let storageWorks = true;
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    storageWorks = false;
    return false;
  }
}
let settings = sanitizeSettings(read(KEYS.settings, defaultSettings));
let draft = { ...settings };
let records = read(KEYS.records, []);
records = Array.isArray(records) ? records.filter(isValidSession) : [];
let session = read(KEYS.active, null);
if (!isValidSession(session) || session.status) session = null;
let page = "home";
let filter = "all";
let modal = null;
let returnFocus = null;
let pendingNewId = undefined;
let toastTimer;

function button(
  text,
  action,
  classes = "button secondary",
  iconName = "",
  attrs = "",
) {
  return `<button type="button" class="${classes}" data-action="${action}" ${attrs}>${iconName ? icon(iconName, 20) : ""}<span>${text}</span></button>`;
}
function currentCase() {
  return cases.find((c) => c.id === session.rounds[session.index].caseId);
}
function currentRound() {
  return session.rounds[session.index];
}
function persistActive() {
  write(KEYS.active, session);
}
function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
function announce(message) {
  const el = document.querySelector("#live");
  if (el) {
    el.textContent = "";
    setTimeout(() => {
      el.textContent = message;
    }, 40);
  }
}
function toast(message) {
  clearTimeout(toastTimer);
  const el = document.querySelector("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("visible");
  toastTimer = setTimeout(() => el.classList.remove("visible"), 4500);
}
function speak(text) {
  stopSpeech();
  if (!("speechSynthesis" in window)) {
    toast("이 기기에서는 음성을 지원하지 않아요. 그림과 글을 함께 봐 주세요.");
    announce(text);
    return;
  }
  const voices = window.speechSynthesis.getVoices();
  const korean = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith("ko"),
  );
  if (voices.length && !korean)
    toast(
      "한국어 음성이 설치되어 있지 않아요. 기기의 음성 설정을 확인해 주세요.",
    );
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.82;
  if (korean) utterance.voice = korean;
  utterance.onerror = (event) => {
    if (!["canceled", "interrupted"].includes(event.error))
      toast(
        "음성을 재생하지 못했어요. 기기의 한국어 음성 설정을 확인해 주세요.",
      );
  };
  window.speechSynthesis.speak(utterance);
  announce(text);
}

function navigation() {
  const nav = [
    { id: "home", label: "탐정 교실", icon: "home" },
    { id: "records", label: "학습 기록", icon: "chart" },
    { id: "settings", label: "선생님 설정", icon: "settings" },
  ];
  return `<aside class="sidebar">
    <a class="brand" href="#home" aria-label="꼬마 탐정단 교실 홈">${logo()}<span>꼬마 탐정단<small>LITTLE DETECTIVES</small></span></a>
    <div class="nav-label">우리의 작은 발견</div>
    <nav aria-label="주 메뉴">${nav.map((n) => `<button class="nav-item ${page === n.id || (n.id === "home" && ["game", "summary"].includes(page)) ? "active" : ""}" data-action="nav" data-page="${n.id}" ${page === n.id ? 'aria-current="page"' : ""}>${icon(n.icon)}<span>${n.label}</span>${n.id === "home" ? '<span class="nav-dot"></span>' : ""}</button>`).join("")}</nav>
    <div class="sidebar-bottom"><div class="little-note"><span class="note-icon">${icon("leaf", 24)}</span><strong>천천히, 함께 찾아요.</strong><p>정답보다 중요한 건<br>단서를 살펴보는 과정이에요.</p></div><div class="sidebar-footer">그림으로 배우는 즐거운 교실<span>Made for little discoveries</span></div></div>
  </aside>`;
}

function shell(content) {
  const names = {
    home: "탐정 교실",
    game: "탐정 교실",
    summary: "오늘의 발견",
    records: "학습 기록",
    settings: "선생님 설정",
  };
  return `${navigation()}<div class="workspace"><header class="topbar"><div class="breadcrumb">우리 동네 꼬마 탐정단<span>/</span><strong>${names[page]}</strong></div><div class="topbar-actions"><span class="safe-note">${icon("heart", 15)} 나의 속도로, 즐겁게</span>${button("선생님 설정", "nav", "teacher-button", "settings", 'data-page="settings"')}</div></header><main id="main" tabindex="-1">${!storageWorks ? '<div class="storage-warning">이 브라우저에 저장할 수 없어요. 창을 닫기 전에 학습 기록을 내려받아 주세요.</div>' : ""}${content}</main><footer class="page-footer"><span>${icon("leaf", 14)} 모든 아이의 작은 발견을 응원해요.</span><span>그림카드 탐정 교실</span></footer></div><div id="live" class="sr-only" role="status" aria-live="polite"></div><div id="toast" role="status" class="toast"></div>${modal ? renderModal() : ""}`;
}

function home() {
  const solved = new Set(
    records.flatMap((s) =>
      s.rounds.filter((r) => r.solved).map((r) => r.caseId),
    ),
  );
  const list = cases.filter((c) => filter === "all" || c.category === filter);
  const activeSession = session && !session.status;
  return `<section class="page-intro"><div><div class="eyebrow"><span class="green-dot"></span> 관찰하고, 생각하고, 발견해요</div><h1>오늘은 어떤 친구를 찾을까요?</h1><p>작은 단서를 하나씩 모아, 우리 동네 이야기를 풀어 봐요.</p></div><span class="classroom-pill">${icon("book", 17)} 그림카드 탐정 교실</span></section>
    <section class="welcome-card"><div class="welcome-copy"><div class="welcome-label">HELLO, LITTLE DETECTIVE!</div><h2>작은 단서로,<br>큰 발견을 해요<span class="period">.</span></h2><p>눈으로 살펴보고, 귀로 들어 봐요.<br>친구를 찾는 멋진 탐정이 되어 볼까요?</p>${button(activeSession ? "이어서 탐정 수업" : "탐정 수업 시작하기", activeSession ? "resume" : "start", "button primary large", "search")}<span class="hero-caption">${icon("people", 15)} ${settings.choices}명 중 찾기 <i></i> 단서 ${settings.clueCount}개 <i></i> ${settings.sessionLength}개 이야기</span></div><div class="hero-art">${heroArt()}<span class="art-sticker">${icon("spark", 15)} 차근차근 찾으면 돼요!</span></div></section>
    <div class="home-columns"><section class="story-section"><div class="section-heading"><div><h2>오늘의 탐정 이야기 <span class="count">12</span></h2><p>궁금한 이야기를 골라 시작해도 좋아요.</p></div><span class="small-label">그림 + 음성 단서</span></div>
    <div class="filters" role="group" aria-label="이야기 종류">${categories.map((c) => `<button class="filter ${filter === c.id ? "selected" : ""}" data-action="filter" data-filter="${c.id}" aria-pressed="${filter === c.id}">${c.name}${c.id === "all" ? " <span>12</span>" : ""}</button>`).join("")}</div>
    <div class="story-grid">${list.map((item) => `<button class="story-card" data-action="case" data-case="${item.id}" aria-label="${item.title}, ${item.place} 이야기 시작"><div class="story-image">${scene(item, true)}<span class="place-pill">${item.place}</span>${solved.has(item.id) ? `<span class="solved-badge" aria-label="찾아본 이야기">${icon("check", 14)}</span>` : ""}</div><div class="story-copy"><span class="story-number">이야기 ${String(cases.indexOf(item) + 1).padStart(2, "0")}</span><h3>${item.title}</h3><span class="story-link">단서 ${settings.clueCount}개 살펴보기 ${icon("arrow", 17)}</span></div></button>`).join("")}</div></section>
    <aside class="home-aside"><section class="notebook"><div class="notebook-label">MY DETECTIVE NOTE</div><h2>나의 탐정 수첩 ${icon("book", 21)}</h2><div class="notebook-stat"><strong>${solved.size}<span> / 12</span></strong><p>살펴본 이야기</p></div><div class="mini-progress" role="progressbar" aria-valuemin="0" aria-valuemax="12" aria-valuenow="${solved.size}" aria-label="살펴본 이야기"><span style="width:${(solved.size / 12) * 100}%"></span></div><p class="notebook-message">${solved.size ? "차곡차곡, 발견이 쌓이고 있어요." : "첫 번째 발견을 기다리고 있어요."}</p><div class="notebook-divider"></div><div class="session-info"><span>이번 수업</span><strong>${settings.sessionLength}개 이야기</strong></div><div class="session-info"><span>도움받기</span><strong>${settings.maxHelp ? `${settings.maxHelp}단계까지` : "사용 안 함"}</strong></div>${button("학습 기록 살펴보기", "nav", "text-button", "arrow", 'data-page="records"')}</section>
    <section class="how-to"><h3>이렇게 찾아봐요</h3>${[
      {
        n: "01",
        title: "그림을 살펴봐요",
        text: "어떤 일이 있었을까요?",
        icon: "eye",
      },
      {
        n: "02",
        title: "단서를 모아요",
        text: "옷과 모자를 잘 봐요.",
        icon: "search",
      },
      {
        n: "03",
        title: "친구를 찾아요",
        text: "단서와 같은 친구를 골라요.",
        icon: "people",
      },
    ]
      .map(
        (s) =>
          `<div class="how-step"><span class="how-icon">${icon(s.icon, 20)}</span><div><strong>${s.title}</strong><p>${s.text}</p></div><span class="step-no">${s.n}</span></div>`,
      )
      .join("")}</section>
    <div class="gentle-note">${icon("heart", 19)}<p>서두르지 않아도 괜찮아요.<br><strong>필요할 때 도움을 받아요.</strong></p></div></aside></div>`;
}

function clueCard(tag, index, active, large = false) {
  const clue = clues[tag];
  return `<button class="clue-card ${active ? "clue-active" : ""} ${large ? "large-clue" : ""}" data-action="clue" data-index="${index}" aria-label="단서 ${index + 1}, ${clue.text} 듣기" aria-pressed="${active}"><span class="clue-index">${index + 1}</span><span class="clue-drawing">${clueArt(clue.icon, clue.color)}</span><span class="clue-description">${clue.text}</span><span class="clue-sound">${icon("sound", 16)}</span></button>`;
}

function helpPanel(round, tags) {
  if (!round.helpLevel || round.solved) return "";
  const focusTag = tags[round.focusClue];
  const clue = clues[focusTag];
  const instructions = [
    "",
    "단서를 크게 보고, 다시 들어 봐요.",
    `친구들의 ${clue.part} 부분을 살펴봐요.`,
    "그림 단서와 친구의 모습을 나란히 비교해요.",
    "이 단서에 맞지 않는 친구를 흐리게 했어요. 남은 친구를 살펴봐요.",
  ];
  return `<section class="help-panel" aria-label="${round.helpLevel}단계 도움"><div class="help-panel-title">${icon("search", 19)}<strong>${helpNames[round.helpLevel]}</strong><span>${round.helpLevel}단계</span></div><p>${instructions[round.helpLevel]}</p>${round.helpLevel >= 3 ? '<p class="small-help">단서 그림과 친구들의 같은 부분을 비교해요. 아래에서 친구를 골라요.</p>' : ""}<div class="help-compare"><div class="help-object">${clueArt(clue.icon, clue.color)}<strong>${clue.label}</strong></div>${
    round.helpLevel >= 3
      ? `<span class="compare-arrow">${icon("arrow", 28)}</span><div class="comparison-people">${round.candidates
          .map((id) => {
            const person = characters.find((p) => p.id === id);
            const faded =
              round.helpLevel >= 4 && !person.tags.includes(focusTag);
            return `<figure class="comparison-person ${faded ? "comparison-faded" : ""}"><div>${avatarCrop(person, clue.part)}</div><figcaption>${person.name}${faded ? "<span>단서와 달라요</span>" : ""}</figcaption></figure>`;
          })
          .join("")}</div>`
      : ""
  }</div></section>`;
}

function game() {
  const round = currentRound();
  const item = currentCase();
  const config = session.settings;
  const tags = item.clues.slice(0, config.clueCount);
  const focus = clues[tags[round.focusClue]];
  const incorrect = round.attempts.length > 0 && !round.solved;
  const winner = characters.find((p) => p.id === item.answer);
  return `<div class="game-top">${button("교실로", "exit", "text-button back-button", "back")}<div class="lesson-progress" aria-label="${config.sessionLength}문제 중 ${session.index + 1}번째">${session.rounds.map((r, i) => `<span class="progress-step ${r.solved ? "done" : i === session.index ? "current" : ""}">${r.solved ? icon("check", 14) : i + 1}</span>${i < session.rounds.length - 1 ? '<span class="progress-line"></span>' : ""}`).join("")}<span class="progress-caption">${session.index + 1} / ${config.sessionLength} 이야기</span></div>${button("다시 듣기", "read-question", "button secondary compact", "sound")}</div>
    <section class="game-question"><span class="eyebrow">이야기 ${String(cases.indexOf(item) + 1).padStart(2, "0")} · ${item.place}</span><h1>${item.question}</h1><p>${item.situation}</p></section>
    <div class="investigation-grid"><section class="scene-panel"><div class="scene-label">${icon("eye", 17)} 어떤 일이 있었을까요?</div>${scene(item)}<div class="scene-caption">${icon("search", 17)} 그림 속 사람을 단서로 찾아요.</div></section><section class="clues-panel" aria-label="그림 단서"><div class="clues-heading"><h2>단서를 살펴봐요 <span>${tags.length}</span></h2>${button("모두 듣기", "read-clues", "text-button", "sound")}</div><p>그림을 누르면 단서를 들을 수 있어요.</p><div class="clues-list">${tags.map((tag, i) => clueCard(tag, i, round.focusClue === i && round.helpLevel > 0)).join("")}</div>${config.maxHelp > 0 && !round.solved ? button(round.helpLevel ? (round.helpLevel >= config.maxHelp ? "도움 다시 듣기" : "도움 더 받기") : "도와주세요", "help-top", "button help-button clue-help", "search") : ""}</section></div>
    ${helpPanel(round, tags)}
    <section class="people-section" aria-labelledby="people-title"><div class="people-heading"><div><h2 id="people-title">${round.solved ? "단서와 같은 친구를 찾았어요!" : "누구일까요? 친구를 골라요."}</h2><p>${round.solved ? `${winner.name}의 모습과 단서를 함께 확인해요.` : config.confirmAnswer ? "친구를 고른 뒤 ‘이 사람이에요’를 눌러요." : "단서와 같은 모습을 찾아 눌러 주세요."}</p></div><span class="choice-count">${icon("people", 17)} ${config.choices}명 중 찾기</span></div><div class="candidate-grid choices-${config.choices}">${round.candidates
      .map((id) => {
        const person = characters.find((p) => p.id === id);
        const faded =
          round.helpLevel >= 4 &&
          !person.tags.includes(tags[round.focusClue]) &&
          !round.solved;
        const isWrong = round.attempts.some(
          (a) => a.personId === id && !a.correct,
        );
        return `<button class="person-card ${round.selected === id ? "person-selected" : ""} ${round.solved && id === item.answer ? "person-correct" : ""} ${faded ? "person-faded" : ""}" data-action="person" data-person="${id}" aria-label="${person.name}. ${person.description}${faded ? ". 지금 단서와 달라요" : ""}" aria-pressed="${round.selected === id}" ${round.solved ? "disabled" : ""}><span class="person-number">${round.candidates.indexOf(id) + 1}</span>${round.solved && id === item.answer ? `<span class="person-check">${icon("check", 19)}</span>` : ""}<div class="person-portrait" style="--portrait:${person.color}">${avatar(person, round.helpLevel >= 2 && !round.solved ? focus.part : "")}</div><span class="person-name">${person.name}</span><span class="person-status">${round.solved && id === item.answer ? "단서와 같아요" : faded ? "이 단서와 달라요" : isWrong ? "단서를 다시 비교해요" : "이 친구일까요?"}</span></button>`;
      })
      .join("")}</div></section>
    ${round.solved ? `<section class="answer-feedback" aria-label="정답 확인"><span class="feedback-star">${icon("star", 28)}</span><div><h3>맞아요! ${winner.name}예요.</h3><p>${tags.map((t) => clues[t].label).join(", ")}가 단서와 같아요.</p><div class="match-tags">${tags.map((t) => `<span>${icon("check", 14)} ${clues[t].label}</span>`).join("")}</div></div>${button(session.index === session.rounds.length - 1 ? "오늘의 발견 보기" : "다음 이야기", "next", "button primary", "arrow")}</section>` : `<div class="game-bottom"><div class="encouragement ${incorrect ? "retry-message" : ""}">${icon(incorrect ? "search" : "heart", 22)}<span>${incorrect ? "괜찮아요. 그림 단서와 다시 비교해 볼까요?" : "천천히 살펴봐요. 도움이 필요하면 눌러 주세요."}</span></div><div class="game-bottom-actions">${config.maxHelp > 0 ? button(round.helpLevel ? (round.helpLevel >= config.maxHelp ? "도움 다시 듣기" : "도움 더 받기") : "도와주세요", "help", "button help-button", "search") : ""}${config.confirmAnswer ? button("이 사람이에요", "submit", "button primary", "check", round.selected ? "" : "disabled") : ""}</div></div>`}`;
}

function totals(list) {
  const rounds = list.flatMap((s) => s.rounds);
  return {
    solved: rounds.filter((r) => r.solved).length,
    independent: rounds.filter(
      (r) => r.solved && r.attempts.length === 1 && r.helpLevel === 0,
    ).length,
    helped: rounds.filter((r) => r.solved && r.helpLevel > 0).length,
    retried: rounds.filter(
      (r) => r.solved && r.helpLevel === 0 && r.attempts.length > 1,
    ).length,
  };
}
function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
function summary() {
  const stats = totals([session]);
  return `<section class="summary-page"><div class="summary-medal">${icon("star", 53)}</div><span class="eyebrow">TODAY’S LITTLE DISCOVERIES</span><h1>오늘도 멋진 발견을 했어요!</h1><p>단서를 하나씩 살펴보며 ${stats.solved}명의 친구를 찾았어요.<br>내 속도로 끝까지 함께했어요.</p><div class="summary-stats"><div><strong>${stats.solved}</strong><span>찾아본 이야기</span></div><div><strong>${stats.independent}</strong><span>혼자 첫 선택 성공</span></div><div><strong>${stats.helped}</strong><span>도움받고 성공</span></div></div><div class="summary-stories">${session.rounds
    .map((r) => {
      const item = cases.find((c) => c.id === r.caseId);
      return `<div>${icon("check", 19)}<strong>${item.title}</strong><span>${getOutcome(r)}</span></div>`;
    })
    .join(
      "",
    )}</div><div class="summary-actions">${button("교실로 돌아가기", "nav", "button secondary", "home", 'data-page="home"')}${button("새로운 수업 시작", "start", "button primary", "arrow")}</div><p class="local-save">${icon("check", 15)} ${storageWorks ? "학습 기록을 이 브라우저에 저장했어요." : "브라우저에 저장하지 못했어요. 학습 기록을 내려받아 주세요."}</p></section>`;
}

function choiceSetting(key, title, description, options) {
  return `<fieldset class="setting-row"><legend>${title}</legend><p>${description}</p><div class="setting-options">${options.map((o) => `<label class="option-pill"><input type="radio" name="${key}" value="${o.value}" ${draft[key] === o.value ? "checked" : ""}><span>${o.label}</span></label>`).join("")}</div></fieldset>`;
}
function toggleSetting(key, title, description) {
  return `<div class="toggle-row"><div><label for="${key}">${title}</label><p id="${key}-description">${description}</p></div><label class="switch"><input type="checkbox" id="${key}" name="${key}" aria-describedby="${key}-description" ${draft[key] ? "checked" : ""}><span aria-hidden="true"></span></label></div>`;
}
function settingsPage() {
  return `<section class="page-intro"><div><div class="eyebrow">TEACHER’S DESK</div><h1>아이의 속도에 맞춰요</h1><p>선택지와 단서, 도움 수준을 조절해 수업을 준비해 주세요.</p></div><span class="classroom-pill">${icon("settings", 17)} 선생님 설정</span></section><div class="settings-layout"><form id="settings-form" class="settings-card"><div class="card-title">${icon("book", 22)}<h2>수업 구성</h2></div>${choiceSetting(
    "choices",
    "선택할 인물 수",
    "차이가 뚜렷한 2명으로 시작해 조금씩 늘려 주세요.",
    [2, 3, 4].map((n) => ({ value: n, label: `${n}명` })),
  )}${choiceSetting(
    "clueCount",
    "문제마다 보여 줄 단서 수",
    "단서가 1개여도 정답은 한 명만 나오도록 구성해요.",
    [1, 2, 3].map((n) => ({ value: n, label: `${n}개` })),
  )}${choiceSetting(
    "sessionLength",
    "한 수업의 이야기 수",
    "짧은 수업으로 시작해 집중하는 시간에 맞춰 주세요.",
    [3, 4, 5].map((n) => ({ value: n, label: `${n}개 이야기` })),
  )}${choiceSetting(
    "maxHelp",
    "제공할 도움의 최대 단계",
    "도움은 학생이나 선생님이 버튼을 눌러 제공해요.",
    [0, 1, 2, 3, 4].map((n) => ({
      value: n,
      label: n === 0 ? "도움 없음" : `${n}단계`,
    })),
  )}<div class="settings-divider"></div>${toggleSetting("autoVoice", "문제와 단서 자동 읽기", "꺼 두어도 듣기 버튼으로 언제든 다시 들을 수 있어요.")}${toggleSetting("confirmAnswer", "선택한 뒤 한 번 더 확인", "친구를 고른 뒤 ‘이 사람이에요’ 버튼으로 답을 제출해요.")}<div class="settings-actions">${button("기본 설정으로", "reset-settings", "text-button")}<button type="submit" class="button primary">${icon("check", 20)} 설정 저장하기</button></div><p class="settings-footnote">저장한 설정은 다음에 시작하는 수업부터 적용돼요.</p></form><aside class="settings-aside"><div class="support-guide"><span class="eyebrow">함께하는 방법</span><h2>필요한 만큼만<br>도움을 주세요.</h2>${helpNames
    .slice(1)
    .map(
      (name, i) =>
        `<div class="guide-step"><span>${i + 1}</span><div><strong>${name}</strong><p>${["그림을 확대하고 소리로 다시 들어요.", "모든 친구의 같은 부분에 테두리를 표시해요.", "단서 그림과 친구들의 모습을 비교해요.", "고른 단서에 맞지 않는 친구를 흐리게 해요."][i]}</p></div></div>`,
    )
    .join(
      "",
    )}</div><div class="privacy-note">${icon("info", 20)}<p>이름이나 개인정보를 입력하지 않아요. 설정과 학습 기록은 <strong>이 브라우저에만 저장</strong>돼요. 공용 기기에서는 기록 관리에 유의해 주세요.</p></div><div class="privacy-note">${icon("sound", 20)}<p>음성은 기기에 설치된 한국어 음성을 사용해요. 음성이 없으면 기기 설정에서 한국어 음성을 추가해 주세요.</p></div></aside></div>`;
}

function recordsPage() {
  const stats = totals(records);
  return `<section class="page-intro"><div><div class="eyebrow">LITTLE STEPS, BIG DISCOVERIES</div><h1>차곡차곡, 우리의 발견</h1><p>정답뿐 아니라 단서를 살펴본 과정도 함께 기록해요.</p></div><div class="record-actions">${button("기록 내려받기", "export", "button secondary compact", "download", records.length ? "" : "disabled")}${button("기록 삭제", "clear-records", "icon-button danger", "trash", `aria-label="모든 학습 기록 삭제" ${records.length ? "" : "disabled"}`)}</div></section><div class="record-stats">${[
    { value: records.length, name: "진행한 수업", icon: "book", color: "sage" },
    {
      value: stats.independent,
      name: "독립 첫 선택 성공",
      icon: "star",
      color: "yellow",
    },
    { value: stats.helped, name: "도움 후 성공", icon: "hand", color: "blue" },
    {
      value: stats.retried,
      name: "다시 살펴본 뒤 성공",
      icon: "search",
      color: "pink",
    },
  ]
    .map(
      (s) =>
        `<div class="record-stat"><span class="stat-icon ${s.color}">${icon(s.icon, 25)}</span><div><strong>${s.value}<small>${s.name === "진행한 수업" ? "회" : "문제"}</small></strong><p>${s.name}</p></div></div>`,
    )
    .join(
      "",
    )}</div><div class="records-notice">${icon("info", 18)} ‘독립 첫 선택 성공’은 도움 없이 첫 응답에서 맞힌 경우예요. 다시 선택한 경우와 도움받은 경우는 따로 기록해요.</div>${
    records.length
      ? `<section class="records-list"><h2>수업 기록 <span class="count">${records.length}</span></h2>${[
          ...records,
        ]
          .reverse()
          .map(
            (s) =>
              `<details class="session-record"><summary><span class="record-book">${icon("book", 22)}</span><div><strong>${escape(formatDate(s.startedAt))}</strong><p>${s.settings.choices}명 중 찾기 · 단서 ${s.settings.clueCount}개 · ${s.rounds.length}개 이야기</p></div><span class="session-status ${s.status === "stopped" ? "stopped" : ""}">${s.status === "stopped" ? "중간 마침" : "수업 완료"}</span><span class="record-score">${s.rounds.filter((r) => r.solved).length} / ${s.rounds.length}</span><span class="details-chevron">⌄</span></summary><div class="record-detail">${s.rounds
                .map((r, i) => {
                  const item = cases.find((c) => c.id === r.caseId);
                  const first = r.attempts[0];
                  const last = r.attempts.at(-1);
                  return `<article class="round-record"><div class="round-record-heading"><span>${i + 1}</span><h3>${item.title}</h3><span class="outcome ${r.helpLevel ? "supported" : ""}">${getOutcome(r)}</span></div><dl><div><dt>첫 선택</dt><dd>${first ? characters.find((p) => p.id === first.personId).name + (first.correct ? " · 맞음" : " · 다시 비교") : "선택 전"}</dd></div><div><dt>사용한 도움</dt><dd>${helpNames[r.helpLevel]}${r.helpLevel ? ` (${r.helpLevel}단계)` : ""}</dd></div><div><dt>최종 응답</dt><dd>${last ? characters.find((p) => p.id === last.personId).name + (r.solved ? " · 성공" : " · 미완료") : "응답 없음"}</dd></div></dl>${r.attempts.length ? `<p class="attempt-trail">응답 순서: ${r.attempts.map((a) => `${characters.find((p) => p.id === a.personId).name}${a.correct ? " ✓" : ""} (도움 ${a.helpLevel}단계)`).join(" → ")}</p>` : ""}</article>`;
                })
                .join("")}</div></details>`,
          )
          .join("")}</section>`
      : `<section class="empty-state"><span>${icon("book", 45)}</span><h2>아직 탐정 수첩이 비어 있어요</h2><p>첫 수업을 마치면 발견한 이야기와<br>도움받은 과정이 여기에 쌓여요.</p>${button("첫 탐정 수업 시작하기", "start", "button primary", "arrow")}</section>`
  }<p class="local-record-note">${icon("info", 15)} 기록은 이 브라우저에 저장돼요. 브라우저 데이터를 지우면 기록도 삭제돼요. 진행 중인 수업은 마친 뒤 목록에 표시돼요.</p>`;
}

function renderModal() {
  const clear = modal === "clear";
  const replace = modal === "replace";
  return `<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description"><span class="modal-icon">${icon(clear ? "trash" : "book", 30)}</span><h2 id="modal-title">${clear ? "학습 기록을 모두 지울까요?" : replace ? "새로운 수업을 시작할까요?" : "이번 수업을 여기서 마칠까요?"}</h2><p id="modal-description">${clear ? "저장된 수업 기록이 삭제돼요. 필요한 기록은 먼저 내려받아 주세요. 진행 중인 수업과 설정은 유지돼요." : replace ? "진행 중인 수업은 중간 마침으로 기록하고 새로운 수업을 시작해요." : "지금까지 선택한 답과 도움 단계를 학습 기록에 저장해요."}</p><div class="modal-actions">${button(clear ? "취소" : "계속할래요", "close-modal", "button secondary")}${button(clear ? "모두 삭제하기" : replace ? "새 수업 시작" : "기록하고 마치기", "confirm-modal", `button ${clear ? "destructive" : "primary"}`)}</div></section></div>`;
}

function render(focusMain = false) {
  app.innerHTML = shell(
    page === "home"
      ? home()
      : page === "game" && session
        ? game()
        : page === "summary" && session
          ? summary()
          : page === "settings"
            ? settingsPage()
            : recordsPage(),
  );
  document.querySelectorAll(".sidebar, .workspace").forEach((el) => {
    el.inert = Boolean(modal);
  });
  if (modal) document.querySelector(".modal button")?.focus();
  else if (focusMain)
    document.querySelector("#main")?.focus({ preventScroll: true });
}
function navigate(next) {
  stopSpeech();
  if (next === "settings") draft = { ...settings };
  page = next;
  modal = null;
  render(true);
  window.scrollTo({ top: 0 });
}
function begin(firstId) {
  if (session && !session.status) {
    pendingNewId = firstId;
    openModal("replace");
    return;
  }
  stopSpeech();
  session = createSession(settings, firstId);
  persistActive();
  page = "game";
  render(true);
  window.scrollTo({ top: 0 });
  autoRead();
}
function autoRead() {
  if (session?.settings.autoVoice && page === "game") {
    const item = currentCase();
    speak(
      `${item.situation} ${item.question} ${item.clues
        .slice(0, session.settings.clueCount)
        .map((t) => clues[t].text)
        .join(" ")}`,
    );
  }
}
function saveSession(status) {
  session.status = status;
  const record = structuredClone({
    ...session,
    status,
    endedAt: new Date().toISOString(),
  });
  records = [...records.filter((s) => s.id !== record.id), record];
  write(KEYS.records, records);
  write(KEYS.active, null);
}
function answer(personId) {
  stopSpeech();
  const round = currentRound();
  const item = currentCase();
  if (round.solved) return;
  session.rounds[session.index] = recordAttempt(round, personId, item.answer);
  persistActive();
  render();
  const name = characters.find((p) => p.id === item.answer).name;
  const correct = currentRound().solved;
  if (session.settings.autoVoice)
    speak(
      correct
        ? `맞아요! ${name}예요. ${item.clues
            .slice(0, session.settings.clueCount)
            .map((t) => clues[t].text)
            .join(" ")}`
        : "괜찮아요. 그림 단서와 다시 비교해 볼까요?",
    );
  else
    announce(
      correct
        ? `맞아요! ${name}예요. 단서와 같아요.`
        : "괜찮아요. 그림 단서와 다시 비교해 볼까요?",
    );
  if (correct)
    document
      .querySelector('[data-action="next"]')
      ?.focus({ preventScroll: true });
  else
    document
      .querySelector(`[data-person="${personId}"]`)
      ?.focus({ preventScroll: true });
}
function openModal(type) {
  returnFocus = document.activeElement;
  modal = type;
  render();
}
function closeModal() {
  modal = null;
  render();
  const action = returnFocus?.dataset.action;
  document.querySelector(`[data-action="${action}"]`)?.focus();
}

function exportRecords() {
  const header = [
    "수업 시작",
    "수업 상태",
    "인물 수",
    "단서 수",
    "이야기",
    "첫 선택",
    "첫 선택 정답",
    "첫 선택 도움 단계",
    "최대 도움 단계",
    "최종 응답",
    "결과",
    "응답 순서",
  ];
  const rows = records.flatMap((s) =>
    s.rounds.map((r) => {
      const first = r.attempts[0];
      const last = r.attempts.at(-1);
      return [
        formatDate(s.startedAt),
        s.status === "stopped" ? "중간 마침" : "수업 완료",
        s.settings.choices,
        s.settings.clueCount,
        cases.find((c) => c.id === r.caseId).title,
        first ? characters.find((p) => p.id === first.personId).name : "",
        first ? (first.correct ? "맞음" : "다시 비교") : "",
        first?.helpLevel ?? "",
        r.helpLevel,
        last ? characters.find((p) => p.id === last.personId).name : "",
        getOutcome(r),
        r.attempts
          .map(
            (a) =>
              `${characters.find((p) => p.id === a.personId).name}/${a.correct ? "정답" : "오답"}/도움${a.helpLevel}`,
          )
          .join(" → "),
      ];
    }),
  );
  const csv =
    "\uFEFF" +
    [header, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `꼬마탐정단_학습기록_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("학습 기록을 CSV 파일로 내려받았어요.");
}

app.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el || el.disabled) return;
  const action = el.dataset.action;
  if (action === "nav") navigate(el.dataset.page);
  else if (action === "filter") {
    filter = el.dataset.filter;
    render();
    document
      .querySelector(`[data-filter="${filter}"]`)
      ?.focus({ preventScroll: true });
  } else if (action === "start") begin();
  else if (action === "case") begin(el.dataset.case);
  else if (action === "resume") {
    page = "game";
    render(true);
    autoRead();
    window.scrollTo({ top: 0 });
  } else if (action === "exit") openModal("exit");
  else if (action === "close-modal") closeModal();
  else if (action === "confirm-modal") {
    const type = modal;
    modal = null;
    if (type === "clear") {
      records = [];
      write(KEYS.records, records);
      render(true);
      toast("학습 기록을 삭제했어요.");
    } else {
      stopSpeech();
      saveSession("stopped");
      session = null;
      if (type === "replace") begin(pendingNewId);
      else navigate("home");
    }
  } else if (action === "read-question")
    speak(`${currentCase().situation} ${currentCase().question}`);
  else if (action === "read-clues")
    speak(
      currentCase()
        .clues.slice(0, session.settings.clueCount)
        .map((t) => clues[t].text)
        .join(" "),
    );
  else if (action === "clue") {
    currentRound().focusClue = Number(el.dataset.index);
    persistActive();
    const tag = currentCase().clues[currentRound().focusClue];
    render();
    document
      .querySelector(`[data-action="clue"][data-index="${el.dataset.index}"]`)
      ?.focus({ preventScroll: true });
    speak(clues[tag].text);
  } else if (action === "help" || action === "help-top") {
    const r = currentRound();
    if (r.solved || session.settings.maxHelp === 0) return;
    r.helpLevel = Math.min(session.settings.maxHelp, r.helpLevel + 1);
    persistActive();
    render();
    const clue = clues[currentCase().clues[r.focusClue]];
    speak(
      `${helpNames[r.helpLevel]}. ${clue.text} ${r.helpLevel >= 2 ? `친구들의 ${clue.part} 부분을 살펴봐요.` : ""}`,
    );
    document.querySelector(".help-panel")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "nearest",
    });
    document
      .querySelector(`[data-action="${action}"]`)
      ?.focus({ preventScroll: true });
  } else if (action === "person") {
    if (currentRound().solved) return;
    if (session.settings.confirmAnswer) {
      currentRound().selected = el.dataset.person;
      persistActive();
      render();
      document
        .querySelector(`[data-person="${el.dataset.person}"]`)
        ?.focus({ preventScroll: true });
      announce(
        `${characters.find((p) => p.id === el.dataset.person).name}을 골랐어요. 이 사람이에요 버튼으로 확인해요.`,
      );
    } else answer(el.dataset.person);
  } else if (action === "submit" && currentRound().selected)
    answer(currentRound().selected);
  else if (action === "next" && currentRound().solved) {
    stopSpeech();
    if (session.index === session.rounds.length - 1) {
      saveSession("completed");
      page = "summary";
      render(true);
    } else {
      session.index++;
      persistActive();
      render(true);
      autoRead();
    }
    window.scrollTo({ top: 0 });
  } else if (action === "reset-settings") {
    draft = { ...defaultSettings };
    render();
    toast("기본값으로 바꿨어요. 설정 저장하기를 눌러 적용해 주세요.");
  } else if (action === "clear-records") openModal("clear");
  else if (action === "export") exportRecords();
});

app.addEventListener("change", (event) => {
  if (event.target.closest("#settings-form")) {
    const el = event.target;
    draft[el.name] = el.type === "checkbox" ? el.checked : Number(el.value);
  }
});
app.addEventListener("submit", (event) => {
  if (event.target.id !== "settings-form") return;
  event.preventDefault();
  settings = sanitizeSettings(draft);
  write(KEYS.settings, settings);
  render();
  document
    .querySelector('#settings-form button[type="submit"]')
    ?.focus({ preventScroll: true });
  toast(
    storageWorks
      ? "설정을 저장했어요. 다음 수업부터 적용돼요."
      : "설정을 브라우저에 저장하지 못했어요. 현재 창에서는 적용돼요.",
  );
});
document.addEventListener("keydown", (event) => {
  if (!modal) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeModal();
  }
  if (event.key === "Tab") {
    const buttons = [...document.querySelectorAll(".modal button")];
    const first = buttons[0],
      last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href="#home"]');
  if (link) {
    event.preventDefault();
    navigate("home");
  }
});
window.addEventListener("pagehide", stopSpeech);
render();
