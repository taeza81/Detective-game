import "@fontsource-variable/noto-sans-kr";
import "./style.css";
import "./classroom.css";
import "./ui-refinements.css";
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
import { icon, logo, scene, avatar, avatarCrop, clueArt } from "./art.js";

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
let storyPage = 0;
let settingsReturn = "home";
let modal = null;
let returnFocus = null;
let pendingNewId = undefined;
let toastTimer;

function isFullscreen() {
  return Boolean(
    document.fullscreenElement || document.webkitFullscreenElement,
  );
}

function updateFullscreenButton() {
  const control = document.querySelector('[data-action="fullscreen"]');
  if (!control) return;
  const active = isFullscreen();
  control.innerHTML = `${icon(active ? "window" : "fullscreen", 21)}<span>${active ? "창모드" : "전체화면"}</span>`;
  control.setAttribute(
    "aria-label",
    active ? "창모드로 전환" : "전체화면으로 전환",
  );
  control.setAttribute("aria-pressed", String(active));
}

async function toggleFullscreen() {
  try {
    if (isFullscreen()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (!exit) throw new Error("unsupported");
      await exit.call(document);
    } else {
      const request =
        document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen;
      if (!request) throw new Error("unsupported");
      await request.call(document.documentElement);
    }
    updateFullscreenButton();
  } catch {
    toast(
      "이 브라우저에서는 전체화면을 열 수 없어요. Chrome이나 Edge에서 직접 열어 주세요.",
    );
  }
}

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
  return `<a class="brand" href="#home" aria-label="꼬마 탐정단 교실 홈">${logo()}<span>꼬마 탐정단<small>그림카드 탐정 교실</small></span></a><nav class="header-nav" aria-label="주 메뉴">${[
    { id: "home", label: "탐정 교실", icon: "home" },
    { id: "records", label: "학습 기록", icon: "chart" },
  ]
    .map(
      (n) =>
        `<button class="nav-item ${page === n.id ? "active" : ""}" data-action="nav" data-page="${n.id}" ${page === n.id ? 'aria-current="page"' : ""}>${icon(n.icon, 20)}<span>${n.label}</span></button>`,
    )
    .join("")}</nav>`;
}

function shell(content) {
  return `<div class="workspace"><header class="topbar"><div class="app-navigation">${navigation()}</div><div class="topbar-actions">${button("전체화면", "fullscreen", "button fullscreen-button", "fullscreen", 'aria-label="전체화면으로 전환" aria-pressed="false"')}${button('<span class="sr-only">선생님 설정</span>', "nav", "teacher-button", "settings", 'data-page="settings" aria-label="선생님 설정" title="선생님 설정"')}</div></header><main id="main" tabindex="-1">${!storageWorks ? '<div class="storage-warning">이 브라우저에는 기록을 저장할 수 없어요. 기록은 내려받아 보관해 주세요.</div>' : ""}${content}</main></div><div id="live" class="sr-only" role="status" aria-live="polite"></div><div id="toast" role="status" class="toast"></div>${modal ? renderModal() : ""}`;
}

function home() {
  const solved = new Set(
    records.flatMap((s) =>
      s.rounds.filter((r) => r.solved).map((r) => r.caseId),
    ),
  );
  const list = cases.filter((c) => filter === "all" || c.category === filter);
  const size = window.innerWidth < 650 ? 4 : 6;
  const pageCount = Math.ceil(list.length / size);
  storyPage = Math.max(0, Math.min(storyPage, pageCount - 1));
  const visible = list.slice(storyPage * size, (storyPage + 1) * size);
  const activeSession = session && !session.status;
  return `<section class="page-intro"><div><div class="eyebrow">관찰하고, 생각하고, 발견해요</div><h1>오늘은 어떤 사람을 찾을까요?</h1></div><span class="discovery-count">${icon("book", 20)} 살펴본 이야기 <strong>${solved.size} / 12</strong></span></section><section class="session-strip"><span class="session-strip-icon">${icon("search", 30)}</span><div><h2>작은 단서 그림을 확인하며, 찾아보아요!</h2><p>${settings.choices}명 중 찾기 · 단서 ${settings.clueCount}개 · 한 수업 ${settings.sessionLength}개 이야기</p></div>${button(activeSession ? "이어서 탐정 수업" : "탐정 수업 시작하기", activeSession ? "resume" : "start", "button primary large", "arrow")}</section><section class="story-section" aria-label="탐정 이야기"><div class="story-toolbar"><div class="filters" role="group" aria-label="이야기 종류">${categories.map((c) => `<button class="filter ${filter === c.id ? "selected" : ""}" data-action="filter" data-filter="${c.id}" aria-pressed="${filter === c.id}">${c.name}${c.id === "all" ? " <span>12</span>" : ""}</button>`).join("")}</div><span class="small-label">궁금한 그림을 눌러 시작해요</span></div><div class="story-grid">${visible.map((item) => `<button class="story-card" data-action="case" data-case="${item.id}" aria-label="${item.title}, ${item.place} 이야기 시작"><div class="story-image">${scene(item, true)}<span class="place-pill">${item.place}</span>${solved.has(item.id) ? `<span class="solved-badge" aria-label="찾아본 이야기">${icon("check", 16)}</span>` : ""}</div><div class="story-copy"><h3>${item.title}</h3>${icon("arrow", 20)}</div></button>`).join("")}</div><div class="story-pagination">${button("이전 이야기", "story-page", "button secondary", "back", `data-direction="-1" ${storyPage === 0 ? "disabled" : ""}`)}<span role="status">${storyPage + 1} / ${pageCount}<small>총 ${list.length}개 이야기</small></span>${button("다음 이야기", "story-page", "button secondary", "arrow", `data-direction="1" ${storyPage >= pageCount - 1 ? "disabled" : ""}`)}</div></section>`;
}

function clueCard(tag, index, active, large = false) {
  const clue = clues[tag];
  return `<button class="clue-card ${active ? "clue-active" : ""} ${large ? "large-clue" : ""}" data-action="clue" data-index="${index}" aria-label="단서 ${index + 1}, ${clue.text} 듣기" aria-pressed="${active}"><span class="clue-drawing">${clueArt(clue.icon, clue.color, currentCase().answer)}</span><span class="clue-description">${clue.label}</span><span class="clue-sound" aria-hidden="true">${icon("sound", 18)}</span></button>`;
}

function helpPanel(round, tags) {
  if (!round.helpLevel || round.solved) return "";
  const focusTag = tags[round.focusClue];
  const clue = clues[focusTag];
  const instructions = [
    "",
    "이 단서를 다시 봐요.",
    `친구들의 ${clue.part} 부분을 봐요.`,
    "같은 부분끼리 비교해요.",
    "남은 친구를 살펴봐요.",
  ];
  return `<section class="help-panel" aria-label="${round.helpLevel}단계 도움"><div class="help-panel-title">${icon("search", 19)}<strong>${helpNames[round.helpLevel]}</strong><span>${round.helpLevel}단계</span>${button("상황 그림", "show-scene", "text-button", "eye")}</div><p>${instructions[round.helpLevel]}</p><div class="help-compare"><div class="help-object">${clueArt(clue.icon, clue.color, currentCase().answer)}<strong>${clue.label}</strong></div>${
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
  const showHelp =
    round.helpLevel > 0 && round.helpVisible !== false && !round.solved;
  return `<div class="game-top">${button("교실로", "exit", "button secondary back-button", "back")}<section class="game-question"><h1>${item.question}</h1></section><div class="lesson-status"><div class="lesson-progress" aria-label="${config.sessionLength}문제 중 ${session.index + 1}번째">${session.rounds.map((r, i) => `<span class="progress-step ${r.solved ? "done" : i === session.index ? "current" : ""}">${r.solved ? icon("check", 14) : i + 1}</span>`).join("")}</div>${button("다시 듣기", "read-question", "button secondary compact", "sound")}</div></div><div class="lesson-board"><div class="lesson-evidence"><div class="scene-slot">${showHelp ? helpPanel(round, tags) : `<section class="scene-panel"><div class="scene-label">${icon("eye", 22)}<span>${item.situation}</span></div>${scene(item)}</section>`}</div><section class="clues-panel" aria-label="그림 단서"><div class="clues-heading"><h2>${icon("search", 22)} 단서</h2>${button("모두 듣기", "read-clues", "text-button", "sound")}</div><div class="clues-list">${tags.map((tag, i) => clueCard(tag, i, round.focusClue === i && round.helpLevel > 0)).join("")}</div></section></div><section class="people-section" aria-labelledby="people-title"><div class="people-heading"><h2 id="people-title">친구를 골라요</h2></div><div class="candidate-grid choices-${config.choices}">${round.candidates
    .map((id) => {
      const person = characters.find((p) => p.id === id);
      const faded =
        round.helpLevel >= 4 &&
        !person.tags.includes(tags[round.focusClue]) &&
        !round.solved;
      const wrong =
        !round.solved &&
        round.attempts.some((a) => a.personId === id && !a.correct);
      return `<button class="person-card ${round.selected === id ? "person-selected" : ""} ${round.solved && id === item.answer ? "person-correct" : ""} ${faded ? "person-faded" : ""}" data-action="person" data-person="${id}" aria-label="${person.name}. ${person.description}${faded ? ". 지금 단서와 달라요" : ""}" aria-pressed="${round.selected === id}" ${round.solved ? "disabled" : ""}>${round.selected === id && !wrong ? `<span class="person-check" aria-hidden="true">${icon("check", 22)}</span>` : ""}<div class="person-portrait" style="--portrait:${person.color}">${avatar(person, round.helpLevel >= 2 && !round.solved ? focus.part : "")}</div><span class="person-name">${person.name}</span><span class="person-status">${faded ? "단서와 달라요" : wrong ? "다시 비교해요" : config.confirmAnswer && round.selected === id && !round.solved ? "선택했어요" : ""}</span></button>`;
    })
    .join(
      "",
    )}</div></section></div>${round.solved ? `<section class="answer-feedback" aria-label="정답 확인"><span class="feedback-star">${icon("star", 26)}</span><div><h3>맞아요! ${winner.name} 친구를 찾았어요.</h3></div>${button(session.index === session.rounds.length - 1 ? "오늘의 발견 보기" : "다음 이야기", "next", "button primary", "arrow")}</section>` : `<div class="game-bottom">${incorrect ? `<div class="encouragement retry-message" role="status">${icon("search", 22)}<span>단서를 다시 볼까요?</span></div>` : ""}<div class="game-bottom-actions">${config.maxHelp > 0 ? button(round.helpLevel ? (round.helpLevel >= config.maxHelp ? "도움 다시 듣기" : "도움 더 받기") : "도와주세요", "help", "button help-button", "search") : ""}${config.confirmAnswer ? button("이 사람이에요", "submit", "button primary", "check", round.selected ? "" : "disabled") : ""}</div></div>`}`;
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
  return `<fieldset class="setting-row" aria-describedby="${key}-description"><legend>${title}</legend><p class="sr-only" id="${key}-description">${description}</p><div class="setting-options" style="--option-count:${options.length}">${options.map((o) => `<label class="option-pill"><input type="radio" name="${key}" value="${o.value}" ${draft[key] === o.value ? "checked" : ""}><span>${o.label}</span></label>`).join("")}</div></fieldset>`;
}
function toggleSetting(key, title, description) {
  return `<div class="toggle-row"><div><label for="${key}">${title}</label><p id="${key}-description">${description}</p></div><label class="switch"><input type="checkbox" id="${key}" name="${key}" aria-describedby="${key}-description" ${draft[key] ? "checked" : ""}><span aria-hidden="true"></span></label></div>`;
}
function settingsDirty() {
  return Object.keys(defaultSettings).some(
    (key) => draft[key] !== settings[key],
  );
}
function settingsPreview(config) {
  return `<h2>다음 수업</h2><div class="preview-people" aria-hidden="true">${characters
    .slice(0, config.choices)
    .map((person) => `<span>${avatar(person)}</span>`)
    .join(
      "",
    )}</div><dl class="preview-values"><div><dt>선택 인물</dt><dd>${config.choices}<small>명</small></dd></div><div><dt>그림 단서</dt><dd>${config.clueCount}<small>개</small></dd></div><div><dt>수업 분량</dt><dd>${config.sessionLength}<small>문제</small></dd></div><div><dt>도움 단계</dt><dd>${config.maxHelp ? `<small>최대</small> ${config.maxHelp}<small>단계</small>` : "없음"}</dd></div></dl><div class="preview-flags"><span>${icon("sound", 18)} 자동 읽기 <strong>${config.autoVoice ? "켜짐" : "꺼짐"}</strong></span><span>${icon("check", 18)} 답 한 번 더 확인 <strong>${config.confirmAnswer ? "켜짐" : "꺼짐"}</strong></span></div>`;
}
function settingsPage() {
  const dirty = settingsDirty();
  return `<section class="page-intro settings-toolbar"><h1>${icon("settings", 26)} 수업 설정</h1><div class="settings-toolbar-actions">${button("설정 안내", "settings-help", "button secondary", "info")}${button(settingsReturn === "game" ? "수업으로 돌아가기" : "교실로 돌아가기", "nav", "button secondary", "back", `data-page="${settingsReturn === "game" ? "game" : "home"}"`)}</div></section><div class="settings-layout"><form id="settings-form" class="settings-card"><div class="settings-options-grid">${choiceSetting(
    "choices",
    "선택 인물",
    "차이가 뚜렷한 2명으로 시작해 조금씩 늘려 주세요.",
    [2, 3, 4].map((n) => ({ value: n, label: `${n}명` })),
  )}${choiceSetting(
    "clueCount",
    "그림 단서",
    "문제마다 보여 줄 단서 수예요. 1개여도 정답은 한 명이에요.",
    [1, 2, 3].map((n) => ({ value: n, label: `${n}개` })),
  )}${choiceSetting(
    "sessionLength",
    "수업 분량",
    "한 수업에서 풀 이야기 수예요.",
    [3, 4, 5].map((n) => ({ value: n, label: `${n}문제` })),
  )}${choiceSetting(
    "maxHelp",
    "도움 단계",
    "도와주세요 버튼으로 받을 수 있는 최대 도움 단계예요.",
    [0, 1, 2, 3, 4].map((n) => ({
      value: n,
      label: n === 0 ? "없음" : `${n}단계`,
    })),
  )}</div><div class="settings-toggles">${toggleSetting("autoVoice", "자동 읽기", "문제와 단서를 소리로 읽어요.")}${toggleSetting("confirmAnswer", "답 한 번 더 확인", "친구를 고른 뒤 확인 버튼을 눌러요.")}</div><div class="settings-save-area"><div class="settings-save-status"><span class="save-state ${dirty ? "is-dirty" : ""}" data-save-state role="status">${icon(dirty ? "info" : "check", 17)} ${dirty ? "저장되지 않음" : "저장됨"}</span><p>다음에 시작하는 수업부터 적용돼요.</p></div><div class="settings-actions">${button("기본값", "reset-settings", "button secondary")}<button type="submit" class="button primary">${icon("check", 22)} 설정 저장하기</button></div></div></form><aside class="settings-preview-panel" aria-label="설정 미리보기" aria-live="polite" aria-atomic="true">${settingsPreview(draft)}</aside></div>`;
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
  if (modal === "settings-help") {
    return `<div class="modal-overlay"><section class="modal settings-help-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description"><h2 id="modal-title">설정 안내</h2><p id="modal-description">학생이 필요한 만큼 도움을 받을 수 있도록 조절해 주세요.</p><ol class="settings-help-steps">${helpNames
      .slice(1)
      .map(
        (name, i) =>
          `<li><strong>${i + 1}단계 · ${name}</strong><p>${["단서를 크게 보고 소리로 다시 들어요.", "모든 친구의 같은 부분에 테두리를 표시해요.", "단서와 친구들의 같은 부분을 나란히 비교해요.", "단서에 맞지 않는 친구를 흐리게 표시해요."][i]}</p></li>`,
      )
      .join(
        "",
      )}</ol><p class="settings-help-note">자동 읽기를 꺼도 듣기 버튼으로 다시 들을 수 있어요. 음성은 기기에 설치된 한국어 음성을 사용해요.</p><p class="settings-help-note">설정과 학습 기록은 이 브라우저에만 저장돼요. 공용 기기에서는 학습 기록을 내려받거나 삭제해 관리해 주세요.</p><div class="modal-actions">${button("닫기", "close-modal", "button primary")}</div></section></div>`;
  }
  const clear = modal === "clear";
  const replace = modal === "replace";
  return `<div class="modal-overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description"><span class="modal-icon">${icon(clear ? "trash" : "book", 30)}</span><h2 id="modal-title">${clear ? "학습 기록을 모두 지울까요?" : replace ? "새로운 수업을 시작할까요?" : "이번 수업을 여기서 마칠까요?"}</h2><p id="modal-description">${clear ? "저장된 수업 기록이 삭제돼요. 필요한 기록은 먼저 내려받아 주세요. 진행 중인 수업과 설정은 유지돼요." : replace ? "진행 중인 수업은 중간 마침으로 기록하고 새로운 수업을 시작해요." : "지금까지 선택한 답과 도움 단계를 학습 기록에 저장해요."}</p><div class="modal-actions">${button(clear ? "취소" : "계속할래요", "close-modal", "button secondary")}${button(clear ? "모두 삭제하기" : replace ? "새 수업 시작" : "기록하고 마치기", "confirm-modal", `button ${clear ? "destructive" : "primary"}`)}</div></section></div>`;
}

function render(focusMain = false) {
  document.body.dataset.page = page;
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
  updateFullscreenButton();
  document.querySelectorAll(".workspace").forEach((el) => {
    el.inert = Boolean(modal);
  });
  if (modal) document.querySelector(".modal button")?.focus();
  else if (focusMain)
    document.querySelector("#main")?.focus({ preventScroll: true });
}
function navigate(next) {
  stopSpeech();
  if (next === "settings") {
    settingsReturn = page === "settings" ? settingsReturn : page;
    draft = { ...settings };
  }
  if (next === "game" && !session) next = "home";
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
        ? `맞아요! ${name} 친구를 찾았어요. ${item.clues
            .slice(0, session.settings.clueCount)
            .map((t) => clues[t].text)
            .join(" ")}`
        : "괜찮아요. 그림 단서와 다시 비교해 볼까요?",
    );
  else
    announce(
      correct
        ? `맞아요! ${name} 친구를 찾았어요. 단서와 같아요.`
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
  if (action === "fullscreen") toggleFullscreen();
  else if (action === "nav") navigate(el.dataset.page);
  else if (action === "filter") {
    filter = el.dataset.filter;
    storyPage = 0;
    render();
    document
      .querySelector(`[data-filter="${filter}"]`)
      ?.focus({ preventScroll: true });
  } else if (action === "story-page") {
    storyPage += Number(el.dataset.direction);
    render();
  } else if (action === "show-scene") {
    currentRound().helpVisible = false;
    persistActive();
    render();
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
    if (currentRound().helpLevel) currentRound().helpVisible = true;
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
    r.helpVisible = true;
    persistActive();
    render();
    const clue = clues[currentCase().clues[r.focusClue]];
    speak(
      `${helpNames[r.helpLevel]}. ${clue.text} ${r.helpLevel >= 2 ? `친구들의 ${clue.part} 부분을 살펴봐요.` : ""}`,
    );
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
  } else if (action === "settings-help") openModal("settings-help");
  else if (action === "clear-records") openModal("clear");
  else if (action === "export") exportRecords();
});

app.addEventListener("change", (event) => {
  if (event.target.closest("#settings-form")) {
    const el = event.target;
    draft[el.name] = el.type === "checkbox" ? el.checked : Number(el.value);
    const preview = document.querySelector(".settings-preview-panel");
    if (preview) preview.innerHTML = settingsPreview(draft);
    const status = document.querySelector("[data-save-state]");
    if (status) {
      const dirty = settingsDirty();
      status.classList.toggle("is-dirty", dirty);
      status.innerHTML = `${icon(dirty ? "info" : "check", 17)} ${dirty ? "저장되지 않음" : "저장됨"}`;
    }
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
document.addEventListener("fullscreenchange", updateFullscreenButton);
document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (page === "home" && !modal) render();
  }, 120);
});
render();
