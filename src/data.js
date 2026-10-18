export const characters = [
  {
    id: "jun",
    name: "준이",
    color: "#e7f2e9",
    tags: ["blue-cap", "gray-top", "yellow-shorts", "sneakers"],
    description: "파란 모자, 회색 윗옷, 노란 반바지, 운동화",
  },
  {
    id: "doyun",
    name: "도윤",
    color: "#eaf0f8",
    tags: ["glasses", "striped-top", "blue-pants", "sneakers"],
    description: "안경, 줄무늬 윗옷, 파란 긴바지, 운동화",
  },
  {
    id: "miso",
    name: "미소",
    color: "#fff0e6",
    tags: ["blue-top", "skirt", "green-sandals"],
    description: "파란 윗옷, 하늘색 치마, 초록 샌들",
  },
  {
    id: "nara",
    name: "나래",
    color: "#f8edee",
    tags: ["yellow-hat", "glasses", "pink-dress", "black-shoes"],
    description: "노란 모자, 안경, 분홍 원피스, 검은 구두",
  },
  {
    id: "onyu",
    name: "온유",
    color: "#f4efdF",
    tags: ["red-top", "red-pants", "green-bag", "blue-sneakers", "sneakers"],
    description: "빨간 운동복, 초록 가방, 파란 운동화",
  },
  {
    id: "daon",
    name: "다온",
    color: "#eeeaf6",
    tags: ["glasses", "brown-top", "beige-pants", "brown-shoes"],
    description: "안경, 갈색 윗옷, 베이지색 긴바지, 갈색 구두",
  },
];

export const clues = {
  "blue-cap": {
    text: "파란 모자를 썼어요.",
    label: "파란 모자",
    part: "머리",
    icon: "cap",
    color: "#5f9fcd",
  },
  "gray-top": {
    text: "회색 윗옷을 입었어요.",
    label: "회색 윗옷",
    part: "옷",
    icon: "shirt",
    color: "#aeb6b5",
  },
  "yellow-shorts": {
    text: "노란 반바지를 입었어요.",
    label: "노란 반바지",
    part: "옷",
    icon: "shorts",
    color: "#f4cb65",
  },
  sneakers: {
    text: "운동화를 신었어요.",
    label: "운동화",
    part: "신발",
    icon: "sneakers",
    color: "#92b788",
  },
  glasses: {
    text: "안경을 썼어요.",
    label: "안경",
    part: "얼굴",
    icon: "glasses",
    color: "#a67d60",
  },
  "striped-top": {
    text: "줄무늬 옷을 입었어요.",
    label: "줄무늬 옷",
    part: "옷",
    icon: "stripes",
    color: "#9b8b80",
  },
  "blue-pants": {
    text: "파란 긴바지를 입었어요.",
    label: "파란 긴바지",
    part: "옷",
    icon: "pants",
    color: "#81a7c3",
  },
  "blue-top": {
    text: "파란 윗옷을 입었어요.",
    label: "파란 윗옷",
    part: "옷",
    icon: "shirt",
    color: "#5c9fc3",
  },
  skirt: {
    text: "하늘색 치마를 입었어요.",
    label: "하늘색 치마",
    part: "옷",
    icon: "skirt",
    color: "#a8cede",
  },
  "green-sandals": {
    text: "초록 샌들을 신었어요.",
    label: "초록 샌들",
    part: "신발",
    icon: "sandals",
    color: "#83a273",
  },
  "yellow-hat": {
    text: "노란 모자를 썼어요.",
    label: "노란 모자",
    part: "머리",
    icon: "hat",
    color: "#f1cd71",
  },
  "pink-dress": {
    text: "분홍 원피스를 입었어요.",
    label: "분홍 원피스",
    part: "옷",
    icon: "dress",
    color: "#df9ba6",
  },
  "black-shoes": {
    text: "검은 구두를 신었어요.",
    label: "검은 구두",
    part: "신발",
    icon: "shoes",
    color: "#414849",
  },
  "red-top": {
    text: "빨간 윗옷을 입었어요.",
    label: "빨간 윗옷",
    part: "옷",
    icon: "shirt",
    color: "#d77368",
  },
  "red-pants": {
    text: "빨간 바지를 입었어요.",
    label: "빨간 바지",
    part: "옷",
    icon: "pants",
    color: "#d77368",
  },
  "green-bag": {
    text: "초록 가방을 메었어요.",
    label: "초록 가방",
    part: "가방",
    icon: "bag",
    color: "#91ac7e",
  },
  "blue-sneakers": {
    text: "파란 운동화를 신었어요.",
    label: "파란 운동화",
    part: "신발",
    icon: "sneakers",
    color: "#7eabc9",
  },
  "brown-top": {
    text: "갈색 윗옷을 입었어요.",
    label: "갈색 윗옷",
    part: "옷",
    icon: "shirt",
    color: "#ab8269",
  },
  "beige-pants": {
    text: "베이지색 긴바지를 입었어요.",
    label: "베이지색 바지",
    part: "옷",
    icon: "pants",
    color: "#bcb594",
  },
  "brown-shoes": {
    text: "갈색 구두를 신었어요.",
    label: "갈색 구두",
    part: "신발",
    icon: "shoes",
    color: "#93705b",
  },
};

export const cases = [
  {
    id: "gift",
    title: "고마운 선물",
    situation: "문 앞에 선물을 두고 갔어요.",
    question: "선물을 준 사람은 누구일까요?",
    answer: "doyun",
    clues: ["glasses", "striped-top", "sneakers"],
    category: "kind",
    place: "우리 집",
    color: "#e8f1e8",
    object: "gift",
  },
  {
    id: "cup",
    title: "컵 옆에 있던 친구",
    situation: "컵이 깨진 곳에 사람이 있었어요.",
    question: "그때 있던 사람은 누구일까요?",
    answer: "nara",
    clues: ["yellow-hat", "pink-dress", "black-shoes"],
    category: "daily",
    place: "주방",
    color: "#fcf0e0",
    object: "cup",
  },
  {
    id: "can",
    title: "데굴데굴 빈 캔",
    situation: "길에 빈 캔을 떨어뜨렸어요.",
    question: "캔을 떨어뜨린 사람은 누구일까요?",
    answer: "jun",
    clues: ["blue-cap", "yellow-shorts", "sneakers"],
    category: "daily",
    place: "동네 길",
    color: "#e9f0f7",
    object: "can",
  },
  {
    id: "books",
    title: "책을 주워 준 친구",
    situation: "떨어진 책을 주워 주었어요.",
    question: "도와준 사람은 누구일까요?",
    answer: "miso",
    clues: ["blue-top", "skirt", "green-sandals"],
    category: "kind",
    place: "교실",
    color: "#f5eee4",
    object: "books",
  },
  {
    id: "bag",
    title: "가방의 주인을 찾아요",
    situation: "놀이터 의자에 가방을 두고 갔어요.",
    question: "가방 주인은 누구일까요?",
    answer: "onyu",
    clues: ["red-top", "red-pants", "blue-sneakers"],
    category: "owner",
    place: "놀이터",
    color: "#edf1df",
    object: "bag",
  },
  {
    id: "plant",
    title: "쑥쑥 자라는 화분",
    situation: "화분에 물을 주었어요.",
    question: "물을 준 사람은 누구일까요?",
    answer: "daon",
    clues: ["brown-top", "beige-pants", "brown-shoes"],
    category: "kind",
    place: "정원",
    color: "#e6f0e9",
    object: "plant",
  },
  {
    id: "ball",
    title: "통통, 돌아온 공",
    situation: "공을 주워 친구에게 돌려주었어요.",
    question: "공을 돌려준 사람은 누구일까요?",
    answer: "jun",
    clues: ["blue-cap", "gray-top", "yellow-shorts"],
    category: "kind",
    place: "운동장",
    color: "#f9ecdf",
    object: "ball",
  },
  {
    id: "library",
    title: "어떤 책을 빌렸을까?",
    situation: "도서관에서 책을 빌렸어요.",
    question: "책을 빌린 사람은 누구일까요?",
    answer: "doyun",
    clues: ["glasses", "striped-top", "blue-pants"],
    category: "daily",
    place: "도서관",
    color: "#eceaf5",
    object: "library",
  },
  {
    id: "photo",
    title: "찰칵! 꽃밭에서",
    situation: "꽃밭 앞에서 사진을 찍었어요.",
    question: "사진을 찍은 사람은 누구일까요?",
    answer: "miso",
    clues: ["blue-top", "skirt", "green-sandals"],
    category: "daily",
    place: "꽃밭",
    color: "#f6e8ed",
    object: "camera",
  },
  {
    id: "scarf",
    title: "손수건을 찾아요",
    situation: "떨어진 손수건을 찾아 주었어요.",
    question: "손수건을 찾아 준 사람은 누구일까요?",
    answer: "nara",
    clues: ["yellow-hat", "glasses", "pink-dress"],
    category: "owner",
    place: "공원",
    color: "#edf0e0",
    object: "scarf",
  },
  {
    id: "basket",
    title: "공 바구니가 왔어요",
    situation: "운동장에 공 바구니를 가져왔어요.",
    question: "바구니를 가져온 사람은 누구일까요?",
    answer: "onyu",
    clues: ["green-bag", "red-top", "sneakers"],
    category: "owner",
    place: "운동장",
    color: "#e8eff7",
    object: "basket",
  },
  {
    id: "letter",
    title: "마음을 담은 편지",
    situation: "우체통에 편지를 넣었어요.",
    question: "편지를 넣은 사람은 누구일까요?",
    answer: "daon",
    clues: ["brown-top", "beige-pants", "brown-shoes"],
    category: "owner",
    place: "우체통 앞",
    color: "#f7ece4",
    object: "letter",
  },
];

export const categories = [
  { id: "all", name: "모든 이야기" },
  { id: "kind", name: "도와준 친구" },
  { id: "owner", name: "물건과 주인" },
  { id: "daily", name: "일상 속 발견" },
];
export const defaultSettings = {
  choices: 3,
  clueCount: 3,
  sessionLength: 3,
  autoVoice: false,
  maxHelp: 4,
  confirmAnswer: false,
};
export const helpNames = [
  "도움 없음",
  "단서 다시 보기",
  "볼 곳 안내",
  "나란히 비교",
  "선택지 줄이기",
];

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function makeRound(item, settings, random = Math.random) {
  const activeClues = item.clues.slice(0, settings.clueCount);
  // Even with one clue, exactly one displayed character must match all clues.
  const others = characters.filter(
    (person) =>
      person.id !== item.answer &&
      !activeClues.every((tag) => person.tags.includes(tag)),
  );
  const candidates = shuffle(
    [
      characters.find((p) => p.id === item.answer),
      ...shuffle(others, random).slice(0, settings.choices - 1),
    ],
    random,
  ).map((p) => p.id);
  return {
    caseId: item.id,
    candidates,
    selected: null,
    attempts: [],
    helpLevel: 0,
    focusClue: 0,
    solved: false,
    startedAt: Date.now(),
  };
}

export function createSession(settings, firstId, random = Math.random) {
  const first = cases.find((c) => c.id === firstId);
  const queue = first
    ? [
        first,
        ...shuffle(
          cases.filter((c) => c.id !== firstId),
          random,
        ),
      ]
    : shuffle(cases, random);
  return {
    id: globalThis.crypto?.randomUUID?.() || `session-${Date.now()}`,
    startedAt: new Date().toISOString(),
    settings: { ...settings },
    rounds: queue
      .slice(0, settings.sessionLength)
      .map((c) => makeRound(c, settings, random)),
    index: 0,
  };
}

export function recordAttempt(round, personId, answerId) {
  if (round.solved || !round.candidates.includes(personId)) return round;
  const correct = personId === answerId;
  return {
    ...round,
    selected: personId,
    solved: correct,
    attempts: [
      ...round.attempts,
      {
        personId,
        correct,
        helpLevel: round.helpLevel,
        at: new Date().toISOString(),
      },
    ],
    ...(correct ? { completedAt: Date.now() } : {}),
  };
}

export function getOutcome(round) {
  if (!round.solved) return "미완료";
  if (round.helpLevel > 0) return "도움 후 성공";
  return round.attempts.length === 1
    ? "독립 첫 선택 성공"
    : "다시 살펴본 뒤 성공";
}

export function sanitizeSettings(value) {
  const clean = { ...defaultSettings };
  if (!value || typeof value !== "object") return clean;
  for (const [key, options] of Object.entries({
    choices: [2, 3, 4],
    clueCount: [1, 2, 3],
    sessionLength: [3, 4, 5],
    maxHelp: [0, 1, 2, 3, 4],
  })) {
    if (options.includes(value[key])) clean[key] = value[key];
  }
  for (const key of ["autoVoice", "confirmAnswer"])
    if (typeof value[key] === "boolean") clean[key] = value[key];
  return clean;
}

// Browser storage can contain incomplete records from an interrupted or older
// lesson. Validate every nested value before the UI reads it.
export function isValidSession(value) {
  if (
    !value ||
    typeof value !== "object" ||
    typeof value.id !== "string" ||
    typeof value.startedAt !== "string" ||
    Number.isNaN(Date.parse(value.startedAt)) ||
    !Number.isInteger(value.index) ||
    !value.settings ||
    typeof value.settings !== "object" ||
    Array.isArray(value.settings) ||
    !Array.isArray(value.rounds)
  )
    return false;

  const settings = sanitizeSettings(value.settings);
  if (
    !Object.entries(settings).every(
      ([key, expected]) => value.settings[key] === expected,
    ) ||
    value.rounds.length !== settings.sessionLength ||
    value.index < 0 ||
    value.index >= value.rounds.length
  )
    return false;

  return value.rounds.every((round) => {
    if (!round || typeof round !== "object") return false;
    const item = cases.find((entry) => entry.id === round.caseId);
    if (
      !item ||
      !Array.isArray(round.candidates) ||
      round.candidates.length !== settings.choices ||
      new Set(round.candidates).size !== settings.choices ||
      !round.candidates.every((id) =>
        characters.some((person) => person.id === id),
      ) ||
      !round.candidates.includes(item.answer) ||
      (round.selected !== null && !round.candidates.includes(round.selected)) ||
      !Number.isInteger(round.helpLevel) ||
      round.helpLevel < 0 ||
      round.helpLevel > settings.maxHelp ||
      !Number.isInteger(round.focusClue) ||
      round.focusClue < 0 ||
      round.focusClue >= settings.clueCount ||
      typeof round.solved !== "boolean" ||
      !Array.isArray(round.attempts)
    )
      return false;

    return (
      round.solved === Boolean(round.attempts.at(-1)?.correct) &&
      round.attempts.every(
        (attempt) =>
          attempt &&
          typeof attempt === "object" &&
          round.candidates.includes(attempt.personId) &&
          typeof attempt.correct === "boolean" &&
          attempt.correct === (attempt.personId === item.answer) &&
          Number.isInteger(attempt.helpLevel) &&
          attempt.helpLevel >= 0 &&
          attempt.helpLevel <= round.helpLevel,
      )
    );
  });
}
