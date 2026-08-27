const STORAGE_KEY = "lexicon-demo-entries-v1";

const seedEntries = [
  { id: 1, type: "expression", title: "Honor my man.", translation: "为我的战士 / 为我的人致哀。", source: "The Odyssey · Emily Wilson", topic: "荣誉与忠诚", note: "这里的 man 不是泛指“人”，而是关系中的称谓：一个被我承认、愿意为之作证的人。它保留了亲密和责任，而不是把人缩减成一个军籍身份。", status: "finished", favorite: true, date: "2025.11.08", relations: ["honor the fallen", "my brother-in-arms", "祭奠"] },
  { id: 2, type: "expression", title: "stroll / wander", translation: "从容走过 / 漫无目的地游荡", source: "词语对照 · 日常观察", topic: "漫游与移动", note: "stroll 的步伐里有一种被允许的从容，wander 则把重点放在方向感的消失。一个是姿态，一个是目的的松动。", status: "finished", favorite: false, date: "2025.12.16", relations: ["roam", "walk", "从容"] },
  { id: 3, type: "expression", title: "The world is not a stage.", translation: "世界并不是一座舞台。", source: "The New Yorker · The cultural life of a phrase", topic: "隐喻与现实", note: "当一个熟悉的隐喻被否定，句子真正反对的不是“舞台”，而是那种认为角色和结局早已写好的世界观。", status: "finished", favorite: false, date: "2026.01.11", relations: ["all the world's a stage", "metaphor"] },
  { id: 4, type: "work", title: "The Remains of the Day", translation: "长日将尽", source: "Kazuo Ishiguro · 1989", topic: "阶级与距离", note: "remain 既是“剩下”，也有遗存之物的意味。标题没有直接说一个人的晚年，而是把生命写成一天结束后还留在桌上的东西。", status: "finished", favorite: true, date: "2026.01.28", relations: ["remain", "dignity", "克制"] },
  { id: 5, type: "expression", title: "I could do with a drink.", translation: "我倒是很想喝一杯。", source: "电影对白 · The Holdovers", topic: "委婉与欲望", note: "could do with 没有直接说 I need，像是把欲望放在一个共同常识里，既承认需要，又不把它说得太重。", status: "finished", favorite: false, date: "2026.02.03", relations: ["I need", "understatement"] },
  { id: 6, type: "expression", title: "A house of one’s own", translation: "一间属于自己的房间 / 房子", source: "Virginia Woolf · A Room of One's Own", topic: "空间与自我", note: "one’s own 不只是所有权。它强调的是一个人可以不被打断地思考、创作和成为自己的条件。", status: "finished", favorite: false, date: "2026.02.14", relations: ["belonging", "privacy", "空间"] },
  { id: 7, type: "expression", title: "to bear witness", translation: "作证 / 见证", source: "The New York Review of Books · 阅读片段", topic: "记忆与见证", note: "bear 让见证带上了承担的重量。不是看见过就算完成，而是把所见之物带到别人面前。", status: "inbox", favorite: false, date: "2026.03.01", relations: ["witness", "memory"] },
  { id: 8, type: "work", title: "The Left Hand of Darkness", translation: "黑暗的左手", source: "Ursula K. Le Guin · 1969", topic: "身份与他者", note: "“左手”不是黑暗的反面，而是与它共同组成整体的部分。标题先改变了我们理解二元对立的方向。", status: "finished", favorite: false, date: "2026.03.12", relations: ["otherness", "duality"] },
  { id: 9, type: "expression", title: "He was a good sort.", translation: "他是个好人 / 是个厚道人。", source: "英国英语 · 口语观察", topic: "性格与评价", note: "sort 把人放进一个可被共同体识别的类型里，good 也因此更像长期相处后的判断，而不是一次行为的赞美。", status: "inbox", favorite: false, date: "2026.03.18", relations: ["good man", "a decent fellow"] },
  { id: 10, type: "expression", title: "There is no accounting for taste.", translation: "各人有各人的品味。", source: "English proverb · 互联网片段", topic: "判断与宽容", note: "accounting 原本有计算、说明的意味。说 no accounting，不是说品味没有价值，而是承认它不必向别人提交一份可审计的解释。", status: "finished", favorite: false, date: "2026.03.26", relations: ["taste", "judgment"] },
  { id: 11, type: "work", title: "The Odyssey", translation: "奥德赛", source: "Homer · Emily Wilson translation", topic: "荣誉与忠诚", note: "这部作品里的归家从来不是地理上的返回，也是在关系和名字里重新获得位置。", status: "inbox", favorite: false, date: "2026.04.02", relations: ["homecoming", "Honor my man"] },
  { id: 12, type: "expression", title: "It is what it is.", translation: "事情就是这样。", source: "The Office · Season 5", topic: "接受与逃避", note: "这句话可以是成熟的接受，也可以是停止追问的挡板。它的真正含义常常取决于说完之后还有没有行动。", status: "finished", favorite: false, date: "2026.04.16", relations: ["acceptance", "resignation"] }
];

let entries = loadEntries();
let selectedId = entries[0]?.id || null;
let activeFilter = "all";
let activeStatus = "all";
let currentView = "all";
let sortNewest = true;
let discoveryId = entries[0]?.id || null;

const entryGrid = document.querySelector("#entryGrid");
const emptyState = document.querySelector("#emptyState");
const detailPanel = document.querySelector("#detailPanel");
const detailContent = document.querySelector("#detailContent");
const captureModal = document.querySelector("#captureModal");

function loadEntries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : seedEntries;
  } catch (error) {
    return seedEntries;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function typeLabel(type) {
  return type === "work" ? "WORK" : "EXPRESSION";
}

function filteredEntries() {
  const query = document.querySelector("#searchInput").value.trim().toLowerCase();
  return entries
    .filter((entry) => {
      const matchesView = currentView === "all" || (currentView === "inbox" && entry.status === "inbox") || (currentView === "saved" && entry.favorite) || (currentView === "expressions" && entry.type === "expression") || (currentView === "works" && entry.type === "work") || (currentView === "themes" && entry.topic);
      const matchesType = activeFilter === "all" || entry.type === activeFilter;
      const matchesStatus = activeStatus === "all" || entry.status === activeStatus;
      const searchable = [entry.title, entry.translation, entry.source, entry.topic, entry.note, ...(entry.relations || [])].join(" ").toLowerCase();
      return matchesView && matchesType && matchesStatus && (!query || searchable.includes(query));
    })
    .sort((a, b) => sortNewest ? b.id - a.id : a.id - b.id);
}

function renderCards() {
  const visible = filteredEntries();
  entryGrid.innerHTML = visible.map((entry) => `
    <article class="entry-card ${entry.id === selectedId ? "selected" : ""}" data-entry-id="${entry.id}" tabindex="0">
      <div class="card-top"><span class="type-label ${entry.type}">${typeLabel(entry.type)}</span><span class="card-status ${entry.status === "inbox" ? "pending" : ""}" title="${entry.status === "inbox" ? "待整理" : "已沉淀"}"></span></div>
      <h3 class="card-title">${escapeHtml(entry.title)}</h3>
      <div class="card-source">${escapeHtml(entry.source)}</div>
      <p class="card-insight">${escapeHtml(entry.note)}</p>
      <div class="card-bottom"><span class="card-topic">${escapeHtml(entry.topic)}</span><span class="card-date">${entry.date}</span></div>
    </article>
  `).join("");
  emptyState.hidden = visible.length > 0;
  document.querySelector("#visibleCount").textContent = visible.length;
  entryGrid.querySelectorAll(".entry-card").forEach((card) => {
    card.addEventListener("click", () => openDetail(Number(card.dataset.entryId)));
    card.addEventListener("keydown", (event) => { if (event.key === "Enter") openDetail(Number(card.dataset.entryId)); });
  });
}

function renderDetail() {
  const entry = entries.find((item) => item.id === selectedId);
  if (!entry) {
    detailContent.innerHTML = `<div class="empty-state"><div class="empty-icon">✦</div><h3>选择一条观察</h3><p>从左侧内容流开始探索。</p></div>`;
    return;
  }
  detailContent.innerHTML = `
    <div class="detail-type">${typeLabel(entry.type)} · ${entry.status === "inbox" ? "待整理" : "已沉淀"}</div>
    <h1 class="detail-title">${escapeHtml(entry.title)}</h1>
    <div class="detail-translation">${escapeHtml(entry.translation)}</div>
    <div class="detail-source-block"><div class="detail-small-label">出处</div><div class="detail-source">${escapeHtml(entry.source)}</div></div>
    <section class="detail-section"><h3>语言观察</h3><p>${escapeHtml(entry.note)}</p></section>
    <section class="detail-section"><h3>所属主题</h3><div class="relation-list"><span class="relation">#${escapeHtml(entry.topic)}</span></div></section>
    <section class="detail-section"><h3>相关观察</h3><div class="relation-list">${(entry.relations || []).map((relation) => `<span class="relation">${escapeHtml(relation)}</span>`).join("")}</div></section>
    <section class="detail-section personal"><h3>留给未来的自己</h3><p>${entry.status === "inbox" ? "这条内容还没有经过你的完整消化。等你想清楚之后，再把自己的判断写在这里。" : "这是你自己的解释，不是自动生成的答案。它会随着你下一次回看而继续变化。"}</p></section>
    <div class="detail-footer"><span>记录于 ${entry.date}</span><button class="text-button" id="markDone" type="button">${entry.status === "inbox" ? "标记为已沉淀" : "重新放入待整理"}</button></div>
  `;
  document.querySelector("#favoriteButton").classList.toggle("favorite-active", entry.favorite);
  document.querySelector("#favoriteButton").textContent = entry.favorite ? "♥" : "♡";
  document.querySelector("#markDone").addEventListener("click", toggleStatus);
}

function openDetail(id) {
  selectedId = id;
  renderCards();
  renderDetail();
  detailPanel.classList.add("open");
}

function renderDiscovery() {
  const entry = entries.find((item) => item.id === discoveryId) || entries[0];
  if (!entry) return;
  document.querySelector("#rediscoveryQuote").textContent = entry.title;
  document.querySelector("#rediscoverySource").textContent = entry.source;
  document.querySelector("#rediscoveryTopic").textContent = entry.topic;
  document.querySelector("#rediscoveryNote").textContent = entry.note;
  document.querySelector(".rediscovery-date").textContent = `记录于 ${entry.date}`;
}

function updateCounts() {
  document.querySelector("#allCount").textContent = entries.length;
  document.querySelector("#inboxCount").textContent = entries.filter((entry) => entry.status === "inbox").length;
  document.querySelector("#observationTotal").textContent = entries.length;
  document.querySelector("#filterRow .filter-chip:nth-child(2) span").textContent = entries.filter((entry) => entry.status === "inbox").length;
  document.querySelector("#filterRow .filter-chip:nth-child(3) span").textContent = entries.filter((entry) => entry.status !== "inbox").length;
}

function renderAll() {
  renderCards();
  renderDetail();
  renderDiscovery();
  updateCounts();
}

function openCapture() {
  captureModal.hidden = false;
  setTimeout(() => captureModal.querySelector("textarea").focus(), 0);
}

function closeCapture() { captureModal.hidden = true; }

function toggleStatus() {
  const entry = entries.find((item) => item.id === selectedId);
  if (!entry) return;
  entry.status = entry.status === "inbox" ? "finished" : "inbox";
  persist();
  renderAll();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

document.querySelectorAll(".segment").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  activeFilter = button.dataset.filter;
  renderCards();
}));

document.querySelectorAll(".filter-chip").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  activeStatus = button.dataset.status;
  renderCards();
}));

document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  currentView = button.dataset.view;
  document.querySelector("#pageTitle").textContent = button.textContent.trim().replace(/\d+$/, "");
  renderCards();
  document.querySelector(".sidebar").classList.remove("open");
}));

document.querySelectorAll(".topic-link").forEach((button) => button.addEventListener("click", () => {
  document.querySelector("#searchInput").value = button.dataset.topic;
  currentView = "all";
  renderCards();
}));

document.querySelector("#searchInput").addEventListener("input", renderCards);
document.querySelector("#sortButton").addEventListener("click", () => { sortNewest = !sortNewest; renderCards(); });
document.querySelector("#openCapture").addEventListener("click", openCapture);
document.querySelector("#closeCapture").addEventListener("click", closeCapture);
document.querySelector("#cancelCapture").addEventListener("click", closeCapture);
document.querySelector("#captureModal").addEventListener("click", (event) => { if (event.target === captureModal) closeCapture(); });
document.querySelector("#closeDetail").addEventListener("click", () => detailPanel.classList.remove("open"));
document.querySelector("#favoriteButton").addEventListener("click", () => {
  const entry = entries.find((item) => item.id === selectedId);
  if (!entry) return;
  entry.favorite = !entry.favorite;
  persist();
  renderAll();
});
document.querySelector("#openRediscovery").addEventListener("click", () => openDetail(discoveryId));
document.querySelector("#openRandom").addEventListener("click", () => {
  const candidates = entries.filter((entry) => entry.id !== discoveryId);
  if (candidates.length) discoveryId = candidates[Math.floor(Math.random() * candidates.length)].id;
  renderDiscovery();
});
document.querySelector(".mobile-menu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
document.querySelector("#exportButton").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lexicon-observations.json";
  link.click();
  URL.revokeObjectURL(url);
});
document.querySelector("#captureForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const newEntry = {
    id: Date.now(), type: data.get("type"), title: data.get("quote"), translation: "尚未补充译法", source: data.get("source") || "未注明出处", topic: data.get("topic") || "待命名主题", note: data.get("note") || "这条观察还没有写下你的理解。", status: "inbox", favorite: false, date: new Date().toISOString().slice(0, 10).replaceAll("-", "."), relations: []
  };
  entries = [newEntry, ...entries];
  selectedId = newEntry.id;
  discoveryId = newEntry.id;
  persist();
  event.currentTarget.reset();
  closeCapture();
  renderAll();
  openDetail(newEntry.id);
});
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "n" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) openCapture();
  if (event.key === "Escape") { closeCapture(); detailPanel.classList.remove("open"); }
  if (event.key === "/" && document.activeElement.tagName !== "INPUT") { event.preventDefault(); document.querySelector("#searchInput").focus(); }
});

renderAll();
