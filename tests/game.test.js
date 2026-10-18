import test from "node:test";
import assert from "node:assert/strict";
import {
  cases,
  characters,
  clues,
  defaultSettings,
  makeRound,
  createSession,
  recordAttempt,
  getOutcome,
  sanitizeSettings,
  isValidSession,
} from "../src/data.js";

test("Incomplete saved lessons are rejected without throwing during startup", () => {
  const valid = createSession(defaultSettings, "gift");
  assert.equal(isValidSession(valid), true);
  const malformed = [
    null,
    [],
    {},
    { ...valid, rounds: [null, ...valid.rounds.slice(1)] },
    { ...valid, index: -1 },
    { ...valid, index: 99 },
    { ...valid, settings: null },
    { ...valid, startedAt: "invalid date" },
    {
      ...valid,
      rounds: [
        { ...valid.rounds[0], attempts: [null] },
        ...valid.rounds.slice(1),
      ],
    },
    {
      ...valid,
      rounds: [
        { ...valid.rounds[0], candidates: ["unknown", "jun", "miso"] },
        ...valid.rounds.slice(1),
      ],
    },
  ];
  for (const value of malformed) {
    assert.equal(isValidSession(value), false);
  }
  const reordered = {
    ...valid,
    settings: Object.fromEntries(Object.entries(valid.settings).reverse()),
  };
  assert.equal(
    isValidSession(reordered),
    true,
    "settings property order is irrelevant",
  );
  const answered = structuredClone(valid);
  answered.rounds[0] = recordAttempt(answered.rounds[0], "doyun", "doyun");
  assert.equal(
    isValidSession(answered),
    true,
    "existing valid progress is retained",
  );
  const legacy = structuredClone(answered);
  delete legacy.settings.feedbackVoice;
  assert.equal(isValidSession(legacy), true, "older progress remains valid");
  assert.equal(
    sanitizeSettings(legacy.settings).feedbackVoice,
    true,
    "older lessons receive the default answer voice",
  );
  legacy.settings.feedbackVoice = "false";
  assert.equal(
    isValidSession(legacy),
    false,
    "invalid voice settings are rejected",
  );
});

test("Every case and difficulty has exactly one matching candidate", () => {
  for (const item of cases) {
    assert.equal(item.clues.length, 3);
    const answer = characters.find((p) => p.id === item.answer);
    for (const tag of item.clues) {
      assert.ok(clues[tag], `${item.id}: clue exists`);
      assert.ok(
        answer.tags.includes(tag),
        `${item.id}: answer matches clue ${tag}`,
      );
    }
    for (const choices of [2, 3, 4])
      for (const clueCount of [1, 2, 3]) {
        for (let run = 0; run < 30; run++) {
          const round = makeRound(item, {
            ...defaultSettings,
            choices,
            clueCount,
          });
          const activeClues = item.clues.slice(0, clueCount);
          const matching = round.candidates.filter((id) =>
            activeClues.every((tag) =>
              characters.find((p) => p.id === id).tags.includes(tag),
            ),
          );
          assert.equal(round.candidates.length, choices);
          assert.equal(new Set(round.candidates).size, choices);
          assert.deepEqual(
            matching,
            [item.answer],
            `${item.id}: ${choices} choices / ${clueCount} clues`,
          );
        }
      }
  }
});

test("A session respects its settings and selected first story without repeats", () => {
  for (const sessionLength of [3, 4, 5])
    for (const item of cases) {
      const session = createSession(
        { ...defaultSettings, sessionLength },
        item.id,
      );
      assert.equal(session.rounds.length, sessionLength);
      assert.equal(session.rounds[0].caseId, item.id);
      assert.equal(
        new Set(session.rounds.map((r) => r.caseId)).size,
        sessionLength,
      );
      assert.notEqual(session.settings, defaultSettings);
    }
});

test("First response, retries, and assisted answers stay distinct", () => {
  const item = cases[0];
  const round = makeRound(item, defaultSettings);
  const wrong = round.candidates.find((id) => id !== item.answer);
  const independent = recordAttempt(round, item.answer, item.answer);
  assert.equal(getOutcome(independent), "독립 첫 선택 성공");
  assert.equal(round.attempts.length, 0, "original round is unchanged");
  const retry = recordAttempt(
    recordAttempt(round, wrong, item.answer),
    item.answer,
    item.answer,
  );
  assert.equal(getOutcome(retry), "다시 살펴본 뒤 성공");
  assert.equal(retry.attempts[0].personId, wrong);
  assert.equal(retry.attempts.at(-1).personId, item.answer);
  const assisted = recordAttempt(
    { ...round, helpLevel: 3 },
    item.answer,
    item.answer,
  );
  assert.equal(getOutcome(assisted), "도움 후 성공");
  assert.equal(assisted.attempts[0].helpLevel, 3);
  assert.equal(getOutcome(recordAttempt(round, wrong, item.answer)), "미완료");
  assert.equal(
    recordAttempt(independent, wrong, item.answer),
    independent,
    "completed answer cannot be overwritten",
  );
  assert.equal(
    recordAttempt(round, "unknown", item.answer),
    round,
    "only displayed choices can be submitted",
  );
});

test("Malformed or old settings fall back to supported settings", () => {
  assert.deepEqual(sanitizeSettings(null), defaultSettings);
  assert.deepEqual(
    sanitizeSettings({
      choices: 100,
      maxHelp: -1,
      sessionLength: "5",
      autoVoice: "false",
      feedbackVoice: "false",
    }),
    defaultSettings,
  );
  assert.deepEqual(
    sanitizeSettings({
      choices: 2,
      clueCount: 1,
      sessionLength: 5,
      maxHelp: 0,
      autoVoice: true,
      feedbackVoice: false,
      confirmAnswer: true,
    }),
    {
      choices: 2,
      clueCount: 1,
      sessionLength: 5,
      maxHelp: 0,
      autoVoice: true,
      feedbackVoice: false,
      confirmAnswer: true,
    },
  );
});
