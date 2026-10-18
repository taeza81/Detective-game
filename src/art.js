const stroke =
  'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"';
export function icon(name, size = 22) {
  const paths = {
    search: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.5 4.5"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    chart: '<path d="M4 3v17h17M8 15v-4m5 4V7m5 8v-5"/>',
    settings:
      '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="3" fill="currentColor" stroke="none"/>',
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

const outline =
  'stroke="#786653" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"';
export function clueArt(type, color = "#7ea88d") {
  let body = "";
  if (type === "cap")
    body = `<path d="M24 49c0-26 48-31 50 0Z" fill="${color}"/><path d="M16 49h61c10 0 11 9-1 9H26c-13 0-20-8-10-9Z" fill="${color}"/><path d="M50 25c-10 3-13 10-13 23" fill="none" opacity=".5"/>`;
  if (type === "hat")
    body = `<path d="m29 47 6-23c2-5 28-5 30 0l7 23Z" fill="${color}"/><ellipse cx="50" cy="49" rx="37" ry="11" fill="${color}"/><path d="M30 40c13 6 27 6 39 0" fill="none"/>`;
  if (type === "glasses")
    body =
      '<rect x="12" y="31" width="31" height="25" rx="9" fill="#d9e9e5"/><rect x="57" y="31" width="31" height="25" rx="9" fill="#d9e9e5"/><path d="M43 39q7-6 14 0M12 35 6 31m82 4 6-4" fill="none"/>';
  if (type === "shirt" || type === "stripes")
    body = `<path d="m34 18-18 12-8 20 15 8 7-14-2 37h44l-2-37 7 14 15-8-8-20-18-12c-7 9-25 9-32 0Z" fill="${type === "stripes" ? "#fcf9ee" : color}"/>${type === "stripes" ? '<path d="M29 42h42M29 57h42M29 72h42" stroke="#998778" stroke-width="7"/>' : ""}<path d="M34 18q16 16 32 0" fill="none"/>`;
  if (type === "shorts" || type === "pants")
    body = `<path d="M26 18h48l5 ${type === "pants" ? 68 : 44}H55l-5-${type === "pants" ? 43 : 24}-5 ${type === "pants" ? 43 : 24}H21Z" fill="${color}"/><path d="M27 27h46M50 27v10" fill="none"/>`;
  if (type === "skirt")
    body = `<path d="M33 22h34l16 52c-22 7-44 7-66 0Z" fill="${color}"/><path d="M32 31h36M40 35l-6 37m26-37 6 37" fill="none" opacity=".6"/>`;
  if (type === "dress")
    body = `<path d="m34 15-13 8-12 24 12 7 10-15-9 44h56l-9-44 10 15 12-7-12-24-13-8c-6 9-26 9-32 0Z" fill="${color}"/><path d="m34 15 6 13 10-5 10 5 6-13" fill="#fff9ed"/>`;
  if (["shoes", "sneakers", "sandals"].includes(type))
    body = `<path d="M16 39 9 59c-2 11 29 9 33 1l-3-22-9 9Z" fill="${color}"/><path d="m62 38-4 22c4 8 35 10 33-1l-7-20-14 8Z" fill="${color}"/><path d="M10 61q15 7 32-3m16 0q15 10 32 3" fill="none" stroke="#fef9ef" stroke-width="4"/>${type !== "shoes" ? '<path d="m20 47 11 4m-12 2 11 4m40-6 11-4m-10 10 11-4" fill="none" stroke="#fff9ed" stroke-width="3"/>' : ""}`;
  if (type === "bag")
    body = `<path d="M36 28v-9c0-13 28-13 28 0v9" fill="none"/><rect x="23" y="22" width="54" height="62" rx="15" fill="${color}"/><rect x="31" y="50" width="38" height="24" rx="8" fill="#f1dd99"/><path d="M32 41h36m-18 0v6" fill="none"/>`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g ${outline}>${body}</g></svg>`;
}

export function avatar(person, focus = "") {
  const id = person.id;
  const pink = id === "nara";
  const girl = pink || id === "miso";
  const top = {
    jun: "#bec1b7",
    doyun: "#fbf8ef",
    miso: "#67a4c4",
    nara: "#e1a1af",
    onyu: "#d97c71",
    daon: "#ae8972",
  }[id];
  const shoes = {
    jun: "#9eb78a",
    doyun: "#ad8b78",
    miso: "#8fa87b",
    nara: "#4d4b47",
    onyu: "#82a6bf",
    daon: "#95745d",
  }[id];
  const hair = {
    jun: "#87634d",
    doyun: "#8f6e54",
    miso: "#966c50",
    nara: "#8d6650",
    onyu: "#8b634b",
    daon: "#b9ada1",
  }[id];
  const focusRect = {
    머리: [32, 3, 116, 75],
    얼굴: [47, 40, 87, 57],
    옷: [28, 92, 127, 116],
    신발: [34, 223, 113, 38],
    가방: [28, 92, 124, 88],
  }[focus];
  return `<svg viewBox="0 0 180 270" aria-hidden="true">
    <ellipse cx="90" cy="258" rx="51" ry="6" fill="#68755c" opacity=".09"/>
    <g ${outline}>
      ${girl ? `<path d="M53 64c-12 29-16 44-8 51l18-6 53 1 17 5c8-16-3-38-5-54Z" fill="${hair}"/>` : ""}
      ${id === "onyu" ? '<path d="M49 102c-21 14-22 62-9 71h96c12-20 7-61-7-71Z" fill="#91ab7d"/>' : ""}
      <path d="M59 183v56h24l5-54m5 0 5 54h24v-56" fill="${["jun", "miso", "nara"].includes(id) ? "#f2d3b6" : id === "doyun" ? "#9cb7c6" : id === "onyu" ? "#d97c71" : "#c1b99d"}"/>
      <path d="m58 236-12 9c-8 11 7 13 36 8l1-17Z" fill="${shoes}"/><path d="m98 236-1 17c29 5 44 3 36-8l-12-9Z" fill="${shoes}"/>
      ${["jun", "doyun", "onyu"].includes(id) ? '<path d="M47 251h35m16 0h36m-74-9 12 1m37-1 12 1" stroke="#fff9ef" stroke-width="3"/>' : id === "miso" ? '<path d="m56 240 22 5m24 0 22-5" stroke="#fff7dc" stroke-width="5"/>' : ""}
      <path d="m56 103-14 38-11 28c-3 10 10 16 15 6l22-39m56-33 14 38 11 28c3 10-10 16-15 6l-22-39" fill="${top}"/>
      <path d="m58 100-5 83c24 10 51 10 75 0l-6-83-20-8H78Z" fill="${top}"/>
      ${id === "doyun" ? '<path d="M56 125h69m-70 22h71m-72 22h73" stroke="#9f8b7d" stroke-width="10"/>' : ""}
      ${id === "jun" ? '<path d="M53 183h75l-4 27H97l-7-18-7 18H56Z" fill="#f2ce6e"/>' : ""}
      ${id === "miso" ? '<path d="M55 176h70l11 36c-31 9-61 9-92 0Z" fill="#b0d1de"/>' : ""}
      ${pink ? '<path d="M56 145h68l15 66c-34 12-65 12-98 0Z" fill="#e1a1af"/><path d="m73 95 17 13 17-13-4-6H77Z" fill="#fff9ed"/>' : ""}
      ${id === "onyu" ? '<path d="M63 101c-11 12-13 39-10 55m66-55c11 12 13 39 10 55" stroke="#91ab7d" stroke-width="9"/><path d="M90 107v77m-25-20h12m27 0h12" stroke="#fff3db" fill="none"/>' : ""}
      <path d="M77 80v18q13 12 26 0V80" fill="#f2d3b6"/>
      <ellipse cx="90" cy="58" rx="36" ry="38" fill="#f2d3b6"/>
      <path d="M54 57C39 6 123 4 128 46c-12 1-22-6-29-16-12 18-24 20-45 27Z" fill="${hair}"/>
      <path d="M56 61c-11-8-13 15 1 15m69-15c11-8 13 15-1 15" fill="#f2d3b6"/>
      <path d="M74 62h.2m30 0h.2" stroke="#5d4a3e" stroke-width="4"/>
      <path d="M83 78q7 6 14 0" fill="none"/>
      <ellipse cx="68" cy="73" rx="5" ry="3" fill="#e8ae98" stroke="none"/><ellipse cx="112" cy="73" rx="5" ry="3" fill="#e8ae98" stroke="none"/>
      ${["doyun", "nara", "daon"].includes(id) ? '<rect x="60" y="53" width="24" height="19" rx="6" fill="#fff" fill-opacity=".13"/><rect x="96" y="53" width="24" height="19" rx="6" fill="#fff" fill-opacity=".13"/><path d="M84 59q6-4 12 0" fill="none"/>' : ""}
      ${id === "jun" ? '<path d="M54 36c0-39 72-41 73 0Z" fill="#6da8d1"/><path d="M52 34h77c15 0 15 9 0 11l-78-1c-7-1-7-9 1-10Z" fill="#6da8d1"/><path d="M90 8c-14 3-18 14-18 25" fill="none" opacity=".5"/>' : ""}
      ${pink ? '<path d="m61 28 8-22c2-9 40-9 42 0l8 22Z" fill="#f2ce77"/><ellipse cx="90" cy="29" rx="49" ry="10" fill="#f2ce77"/><path d="M63 20q27 11 54 0" fill="none"/>' : ""}
    </g>
    ${focusRect ? `<rect x="${focusRect[0]}" y="${focusRect[1]}" width="${focusRect[2]}" height="${focusRect[3]}" rx="15" fill="#fff0b7" fill-opacity=".17" stroke="#24745e" stroke-width="3" stroke-dasharray="7 4"/>` : ""}
  </svg>`;
}

function objectArt(type) {
  const common =
    'stroke="#756b56" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const items = {
    gift: '<rect x="31" y="35" width="85" height="67" rx="5" fill="#b3c397"/><path d="M28 32h91v21H28Z" fill="#c5d2a9"/><path d="M67 34v68h16V34" fill="#df91a0"/><path d="M75 33C32 29 45 3 64 16l11 17c5-39 39-25 17-10Z" fill="#e5a6b0"/>',
    cup: '<path d="M99 37c50-13 34 48 1 39" fill="none" stroke-width="12" stroke="#d89c56"/><path d="m28 27 7 66c4 21 65 21 69 0l7-66Z" fill="#e8b369"/><ellipse cx="69" cy="27" rx="42" ry="12" fill="#f6ce8f"/><path d="m82 34-8 20 13 9-13 25 6 10" fill="none"/><path d="m113 103 15-11 10 10-15 7Z" fill="#e8b369"/>',
    can: '<g transform="rotate(24 70 65)"><rect x="43" y="18" width="53" height="88" rx="13" fill="#d7806e"/><ellipse cx="69" cy="20" rx="25" ry="7" fill="#d4d6ca"/><path d="M45 44h49v32H45Z" fill="#f4dfae"/><path d="m57 54 12-6 12 6-12 14Z" fill="#d7806e" stroke="none"/></g>',
    books:
      '<path d="m22 79 84-11 22 19-85 15Z" fill="#e1b16d"/><path d="m24 77 81-11v12L24 91Z" fill="#fff7e4"/><path d="m20 73 83-11 24 17-84 14Z" fill="#88af9b"/><path d="m37 39 73 9-8 30-73-9Z" fill="#7da3bb"/><path d="m44 48 54 7m-55 0 40 5" stroke="#eff1de"/>',
    bag: '<path d="M52 36V23c0-23 43-23 43 0v13" fill="none" stroke-width="7" stroke="#90a476"/><rect x="31" y="28" width="85" height="81" rx="21" fill="#9bb584"/><rect x="43" y="65" width="61" height="32" rx="9" fill="#f1d58c"/><path d="M47 54h52m-25 0v8" fill="none"/>',
    plant:
      '<path d="m40 68 9 43h50l9-43Z" fill="#cb9373"/><path d="M73 68V23" fill="none" stroke="#72947b" stroke-width="5"/><path d="M72 48C36 54 28 20 31 14c28-1 42 13 41 34Zm2-9c31 8 46-16 44-29-26-2-41 6-44 29Z" fill="#8eb18b"/><rect x="34" y="65" width="81" height="12" rx="4" fill="#dba789"/>',
    ball: '<circle cx="73" cy="63" r="46" fill="#f0c77a"/><path d="m60 46 24-3 12 23-17 20-24-10Z" fill="#83a7ae"/><path d="M60 46 44 29m40 14 16-16m-4 39 22 5M79 86l1 23M55 76l-23 9" fill="none"/>',
    library:
      '<path d="M75 31c-18-13-44-13-63-5v65c20-8 44-7 63 6 19-13 43-14 63-6V26c-19-8-45-8-63 5Z" fill="#c2b4d6"/><path d="M75 32v64M25 42l33 3M25 54l33 3m34-12 33-3M92 57l33-3" fill="none" stroke="#fff6e5" stroke-width="4"/>',
    camera:
      '<path d="m52 26 9-14h28l9 14" fill="#71958b"/><rect x="18" y="25" width="114" height="76" rx="12" fill="#92b0a0"/><circle cx="76" cy="63" r="25" fill="#f4dfaa"/><circle cx="76" cy="63" r="17" fill="#7a9daa"/><path d="m69 54 10-3" stroke="#dfece6" stroke-width="5"/><rect x="109" y="36" width="12" height="10" rx="3" fill="#f7e6b6"/>',
    scarf:
      '<path d="m33 19 80 10-13 76-81-12Z" fill="#e2aab6"/><path d="m41 29 60 9-9 55-61-8Z" fill="none" stroke="#fff4df" stroke-dasharray="5 5"/><path d="m57 48 8 5 8-4-1 12-10 7-8-9Z" fill="#fff4df" stroke="none"/>',
    basket:
      '<circle cx="52" cy="38" r="23" fill="#e3b876"/><circle cx="94" cy="38" r="23" fill="#96b3b3"/><path d="m24 45 10 60h82l10-60Z" fill="#c7af88"/><path d="M32 62h87M35 82h81M49 47l5 57m21-57v57m25-57-5 57" fill="none" stroke="#f7e8cc" stroke-width="5"/>',
    letter:
      '<rect x="18" y="25" width="113" height="77" rx="5" fill="#f7e6bd"/><path d="m20 28 54 42 55-42M20 99l39-37m32 0 38 37" fill="none"/><path d="M75 57c-10-13-25 1-13 11l13 11 13-11c12-10-3-24-13-11Z" fill="#d48c84" stroke="none"/>',
  };
  return `<g ${common}>${items[type] || items.gift}</g>`;
}

export function scene(item, small = false) {
  const tint = item.color;
  return `<svg viewBox="0 0 500 270" ${small ? "" : 'role="img"'} ${small ? 'aria-hidden="true"' : `aria-label="${item.situation} 얼굴이 보이지 않는 사람과 ${item.place}의 모습"`}>
    <rect width="500" height="270" fill="${tint}"/>
    <circle cx="421" cy="48" r="44" fill="#fffaf0" opacity=".65"/>
    <path d="M0 213Q143 159 283 204t217-7v73H0Z" fill="#cfddc5" opacity=".65"/>
    <path d="M0 244Q135 196 300 233t200-10v47H0Z" fill="#b5c8ac" opacity=".3"/>
    ${["gift", "cup", "books", "library"].includes(item.id) ? '<path d="M40 199V36h115v163" fill="#f6f1e3" stroke="#b8bcaa" stroke-width="2"/><path d="M52 192V48h91v144" fill="#a9c1c2" stroke="#849b91" stroke-width="2"/><circle cx="126" cy="126" r="4" fill="#e6ce94"/><path d="M42 202h112" stroke="#899d87" stroke-width="4" stroke-linecap="round"/>' : '<path d="M29 167v-53m28 57V99m-43 37q15-19 29 0m0-17q17-20 28 0" stroke="#9fb393" stroke-width="4" fill="none"/><path d="M447 188v-39m-16 17q16-17 32 0" stroke="#9fb393" stroke-width="4" fill="none"/>'}
    <ellipse cx="254" cy="226" rx="78" ry="10" fill="#6d8261" opacity=".1"/>
    <g transform="translate(166 98) scale(1.18)">${objectArt(item.object)}</g>
    <g transform="translate(351 70) rotate(7 30 80)" fill="#9daaa2" stroke="#83958a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="32" cy="17" r="17"/><path d="M22 36c-7 0-10 6-13 18L0 79c-3 8 8 11 11 4l13-24-4 51-17 31c-6 9 6 16 12 8l24-33 13 35c4 11 18 5 13-5l-14-42-1-50 12 20c6 9 17 1 11-7L53 40c-5-7-20-5-31-4Z"/>
    </g>
    <g fill="#8fa38c" opacity=".35"><ellipse cx="379" cy="241" rx="5" ry="9" transform="rotate(-35 379 241)"/><ellipse cx="405" cy="249" rx="5" ry="9" transform="rotate(-35 405 249)"/></g>
    <path d="m180 54 3 7 7 3-7 3-3 7-3-7-7-3 7-3Zm133-9 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#b4bd91"/>
  </svg>`;
}

export function avatarCrop(person, part) {
  const boxes = {
    머리: "32 0 116 100",
    얼굴: "37 25 106 80",
    옷: "25 88 130 132",
    신발: "28 215 124 48",
    가방: "25 87 130 100",
  };
  return avatar(person).replace(
    'viewBox="0 0 180 270"',
    `viewBox="${boxes[part] || boxes["옷"]}"`,
  );
}

export function heroArt() {
  return `<svg viewBox="0 0 470 290" aria-hidden="true">
    <ellipse cx="255" cy="255" rx="160" ry="18" fill="#bfd2b8" opacity=".4"/>
    <path d="M91 220c-55-17-63-78-25-110 4-64 99-95 150-63 44-49 130-12 126 36 76-6 109 92 49 137Z" fill="#d1e1c7"/>
    <g transform="translate(106 55) rotate(-13 80 90)"><rect x="0" y="0" width="139" height="176" rx="15" fill="#fffdf5" stroke="#8eaa8b" stroke-width="2"/><rect x="11" y="12" width="117" height="115" rx="9" fill="#e8efdf"/><g transform="translate(3 -8) scale(.78)">${objectArt("gift")}</g><path d="M26 145h83m-65 12h47" stroke="#b7c3a9" stroke-width="6" stroke-linecap="round"/></g>
    <g transform="translate(218 52) rotate(12 80 90)"><rect width="143" height="178" rx="15" fill="#fffdf5" stroke="#8eaa8b" stroke-width="2"/><rect x="12" y="12" width="119" height="118" rx="9" fill="#f2e9d4"/><g transform="translate(8 16) scale(1.27)">${clueArt("cap", "#6b9fba").replace('<svg viewBox="0 0 100 100" aria-hidden="true">', "").replace("</svg>", "")}</g><path d="M29 146h82m-64 12h46" stroke="#c4b993" stroke-width="6" stroke-linecap="round"/></g>
    <g transform="translate(280 145) rotate(-17)"><path d="m43 43 45 61" stroke="#4f7761" stroke-width="24" stroke-linecap="round"/><path d="m43 43 45 61" stroke="#79967a" stroke-width="13" stroke-linecap="round"/><circle r="51" fill="#f8e6b8" stroke="#466b56" stroke-width="9"/><circle r="39" fill="#e6efd9" fill-opacity=".86" stroke="#fffdf1" stroke-width="4"/><path d="M-22-20q13-13 29-10" fill="none" stroke="#fffdf4" stroke-width="7" stroke-linecap="round"/><path d="m-7 6 9 9 17-21" fill="none" stroke="#6b8d6b" stroke-width="5" stroke-linecap="round"/></g>
    <path d="m83 53 4 10 11 4-11 4-4 10-4-10-11-4 11-4Zm293-8 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill="#d4ad61"/>
    <path d="m59 183 6 6-6 6-6-6Zm345-63 6 6-6 6-6-6Z" fill="#93ad81"/>
  </svg>`;
}
