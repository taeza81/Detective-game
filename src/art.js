import manifest from "./art-manifest.json";
import { characters, clues } from "./data.js";

const stroke =
  'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"';
export function icon(name, size = 22) {
  const paths = {
    search: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.5 4.5"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    chart: '<path d="M4 3v17h17M8 15v-4m5 4V7m5 8v-5"/>',
    settings:
      '<path d="m10 2-.6 3-2 .9-2.8-1-2 3.4 2.2 2v2.4l-2.2 2 2 3.4 2.8-1 2 .9.6 3h4l.6-3 2-.9 2.8 1 2-3.4-2.2-2v-2.4l2.2-2-2-3.4-2.8 1-2-.9L14 2Z"/><circle cx="12" cy="12" r="3"/>',
    fullscreen: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    window:
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18m-4 5h-5v4m0-4 7 5"/>',
    sound:
      '<path d="m10 4-5 4H2v8h3l5 4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m10 4-5 4H2v8h3l5 4Zm5 5 6 6m0-6-6 6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    star: '<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9Z"/>',
    spark:
      '<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3Z"/>',
    heart:
      '<path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z" transform="translate(0 -1) scale(1 .95)"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    hand: '<path d="M8 12V5a2 2 0 0 1 4 0v7-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v10c0 4-3 6-7 6-3 0-5-2-6-4l-4-5a2 2 0 0 1 3-3l2 2Z"/>',
    flag: '<path d="M5 21V3c6-4 8 4 15 0v10c-7 4-9-4-15 0"/>',
    leaf: '<path d="M20 3C7 2 2 7 5 14s15 5 15-11ZM4 21 16 8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6h4"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    people:
      '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m0-17a3 3 0 0 1 0 6m3 4c2 1 3 2 3 5v2"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" ${stroke} aria-hidden="true">${paths[name] || paths.search}</svg>`;
}

export function logo() {
  return `<svg viewBox="0 0 44 44" aria-hidden="true"><rect width="44" height="44" rx="14" fill="#276b58"/><circle cx="19" cy="18" r="9" fill="#f4cf86" stroke="#fff9ed" stroke-width="2.4"/><path d="m26 25 8 8" stroke="#fff9ed" stroke-width="5" stroke-linecap="round"/><path d="m19 12 1.5 3.5 3.8.5-2.8 2.5.8 4-3.3-2-3.3 2 .8-4-2.8-2.5 3.8-.5Z" fill="#276b58"/></svg>`;
}

function artUrl(name) {
  return (
    window.__DETECTIVE_IMAGES__?.[name] ||
    `${import.meta.env.BASE_URL}art/${name}`
  );
}

let clipSequence = 0;
function clippedImage(name, x, y, width, height) {
  const file = manifest[name];
  const id = `picture-clip-${clipSequence++}`;
  return `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><rect x="${x}" y="${y}" width="${width}" height="${height}" /></clipPath></defs><image href="${artUrl(name)}" x="0" y="0" width="${file.width}" height="${file.height}" clip-path="url(#${id})" />`;
}

function atlas(name, index, columns, rows, label = "", trim = 0) {
  const { width, height } = manifest[name];
  const cell = manifest[name].cells?.[index];
  const cellW = cell?.width ?? width / columns,
    cellH = cell?.height ?? height / rows;
  const x = (cell?.x ?? (index % columns) * cellW) + cellW * trim;
  const y = (cell?.y ?? Math.floor(index / columns) * cellH) + cellH * trim;
  return `<svg class="generated-art" viewBox="${x} ${y} ${cellW * (1 - trim * 2)} ${cellH * (1 - trim * 2)}" preserveAspectRatio="xMidYMid meet" overflow="hidden" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${clippedImage(name, x, y, cellW * (1 - trim * 2), cellH * (1 - trim * 2))}</svg>`;
}

export function clueArt(type, color, personId) {
  // A generic "sneakers" cue must not show green shoes when this character
  // actually wears brown or blue sneakers. Show their own generated shoes.
  if (type === "sneakers" && color === clues.sneakers.color && personId) {
    const person = characters.find((entry) => entry.id === personId);
    if (person) return avatarCrop(person, "신발");
  }
  const entries = Object.entries(clues);
  const index = entries.findIndex(
    ([, value]) => value.icon === type && value.color === color,
  );
  return atlas("clues.png", Math.max(0, index), 5, 4);
}

export function scene(item, small = false) {
  const order = [
    "gift",
    "cup",
    "can",
    "books",
    "bag",
    "plant",
    "ball",
    "library",
    "photo",
    "scarf",
    "basket",
    "letter",
  ];
  const index = order.indexOf(item.id);
  const result = atlas(
    index < 6 ? "scenes-a.png" : "scenes-b.png",
    index % 6,
    2,
    3,
    small ? "" : `${item.situation} ${item.place}의 상황 그림`,
    0.004,
  );
  return small ? result.replace("xMidYMid meet", "xMidYMid slice") : result;
}

export function avatar(person, focus = "") {
  const index = characters.findIndex((entry) => entry.id === person.id);
  const { width, height } = manifest["people.png"];
  const cellW = width / 3,
    cellH = height / 2;
  const x = (index % 3) * cellW + cellW * 0.18;
  const y = Math.floor(index / 3) * cellH + cellH * 0.005;
  const area = {
    머리: [24, 1, 132, 91],
    얼굴: [34, 25, 112, 67],
    옷: [22, 82, 136, 123],
    신발: [21, 229, 138, 36],
    가방: [20, 79, 140, 102],
  }[focus];
  return `<svg viewBox="0 0 180 270" aria-hidden="true" overflow="hidden"><svg x="0" y="0" width="180" height="270" viewBox="${x} ${y} ${cellW * 0.64} ${cellH * 0.97}" preserveAspectRatio="xMidYMid meet" overflow="hidden">${clippedImage("people.png", x, y, cellW * 0.64, cellH * 0.97)}</svg>${area ? `<rect x="${area[0]}" y="${area[1]}" width="${area[2]}" height="${area[3]}" rx="12" fill="#fff0b7" fill-opacity=".12" stroke="#24745e" stroke-width="3" stroke-dasharray="7 4"/>` : ""}</svg>`;
}

export function avatarCrop(person, part) {
  const boxes = {
    머리: "19 0 142 96",
    얼굴: "30 22 120 75",
    옷: "18 80 144 128",
    신발: "18 225 144 42",
    가방: "18 73 144 110",
  };
  return avatar(person).replace(
    'viewBox="0 0 180 270"',
    `viewBox="${boxes[part] || boxes["옷"]}"`,
  );
}
