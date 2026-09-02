const STORAGE_KEY = "lexicon-demo-entries-v1";
const CONTENT_RESET_KEY = "lexicon-system-content-reset-v2";

const seedEntries = [
  { id: 1, type: "expression", title: "Honor my man.", translation: "为我的战士 / 为我的人致哀。", source: "The Odyssey · Emily Wilson", topic: "荣誉与忠诚", note: "", status: "finished", favorite: true, date: "2025.11.08", relations: ["honor the fallen", "my brother-in-arms", "祭奠"] },
  { id: 2, type: "expression", title: "stroll / wander", translation: "从容走过 / 漫无目的地游荡", source: "词语对照 · 日常观察", topic: "漫游与移动", note: "", status: "finished", favorite: false, date: "2025.12.16", relations: ["roam", "walk", "从容"] },
  { id: 3, type: "expression", title: "The world is not a stage.", translation: "世界并不是一座舞台。", source: "The New Yorker · The cultural life of a phrase", topic: "隐喻与现实", note: "", status: "finished", favorite: false, date: "2026.01.11", relations: ["all the world's a stage", "metaphor"] },
  { id: 4, type: "work", title: "The Remains of the Day", translation: "长日将尽", source: "Kazuo Ishiguro · 1989", topic: "阶级与距离", note: "", status: "finished", favorite: true, date: "2026.01.28", relations: ["remain", "dignity", "克制"] },
  { id: 5, type: "expression", title: "I could do with a drink.", translation: "我倒是很想喝一杯。", source: "电影对白 · The Holdovers", topic: "委婉与欲望", note: "", status: "finished", favorite: false, date: "2026.02.03", relations: ["I need", "understatement"] },
  { id: 6, type: "expression", title: "A house of one’s own", translation: "一间属于自己的房间 / 房子", source: "Virginia Woolf · A Room of One's Own", topic: "空间与自我", note: "", status: "finished", favorite: false, date: "2026.02.14", relations: ["belonging", "privacy", "空间"] },
  { id: 7, type: "expression", title: "to bear witness", translation: "作证 / 见证", source: "The New York Review of Books · 阅读片段", topic: "记忆与见证", note: "", status: "inbox", favorite: false, date: "2026.03.01", relations: ["witness", "memory"] },
  { id: 8, type: "work", title: "The Left Hand of Darkness", translation: "黑暗的左手", source: "Ursula K. Le Guin · 1969", topic: "身份与他者", note: "", status: "finished", favorite: false, date: "2026.03.12", relations: ["otherness", "duality"] },
  { id: 9, type: "expression", title: "He was a good sort.", translation: "他是个好人 / 是个厚道人。", source: "英国英语 · 口语观察", topic: "性格与评价", note: "", status: "inbox", favorite: false, date: "2026.03.18", relations: ["good man", "a decent fellow"] },
  { id: 10, type: "expression", title: "There is no accounting for taste.", translation: "各人有各人的品味。", source: "English proverb · 互联网片段", topic: "判断与宽容", note: "", status: "finished", favorite: false, date: "2026.03.26", relations: ["taste", "judgment"] },
  { id: 11, type: "work", title: "The Odyssey", translation: "奥德赛", source: "Homer · Emily Wilson translation", topic: "荣誉与忠诚", note: "", status: "inbox", favorite: false, date: "2026.04.02", relations: ["homecoming", "Honor my man"] },
  { id: 12, type: "expression", title: "It is what it is.", translation: "事情就是这样。", source: "The Office · Season 5", topic: "接受与逃避", note: "", status: "finished", favorite: false, date: "2026.04.16", relations: ["acceptance", "resignation"] }
];

let entries = loadEntries();
let selectedId = null;
let activeFilter = "all";
let activeStatus = "all";
let currentView = "all";
let sortNewest = true;
let discoveryId = entries[0]?.id || null;

const entryGrid = document.querySelector("#entryGrid");
const emptyState = document.querySelector("#emptyState");
const appShell = document.querySelector(".app-shell");
const detailPanel = document.querySelector("#detailPanel");
const detailContent = document.querySelector("#detailContent");
const captureModal = document.querySelector("#captureModal");
const captureModePicker = document.querySelector("#captureModePicker");
const captureForm = document.querySelector("#captureForm");
const editModal = document.querySelector("#editModal");
const editForm = document.querySelector("#editForm");

function loadEntries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const source = stored ? JSON.parse(stored) : seedEntries;
    const normalized = source.map(normalizeEntry);
    if (!localStorage.getItem(CONTENT_RESET_KEY)) {
      normalized.forEach((entry) => {
        entry.context = "";
        entry.note = "";
        entry.reflection = "";
      });
      localStorage.setItem(CONTENT_RESET_KEY, "1");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch (error) {
    return seedEntries.map(normalizeEntry);
  }
}

function normalizeEntry(entry) {
  return {
    ...entry,
    title: entry.title || entry.quote || "未命名观察",
    translation: entry.translation || "尚未补充译法",
    source: entry.source || "未注明出处",
    context: entry.context || "",
    note: entry.note || "",
    reflection: entry.reflection || "",
    useNow: entry.useNow || "",
    fixIt: entry.fixIt || "",
    topic: entry.topic || "待命名主题",
    relations: Array.isArray(entry.relations) ? entry.relations : [],
    status: entry.status === "finished" ? "finished" : "inbox",
    favorite: Boolean(entry.favorite),
    date: entry.date || new Date().toISOString().slice(0, 10).replaceAll("-", ".")
  };
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function typeLabel(type) {
  return type === "work" ? "WORK" : "PHRASE";
}

function filteredEntries() {
  const query = document.querySelector("#searchInput").value.trim().toLowerCase();
  return entries
    .filter((entry) => {
      const matchesView = currentView === "all" || (currentView === "inbox" && entry.status === "inbox") || (currentView === "saved" && entry.favorite) || (currentView === "expressions" && entry.type === "expression") || (currentView === "works" && entry.type === "work") || (currentView === "themes" && entry.topic);
      const matchesType = activeFilter === "all" || entry.type === activeFilter;
      const matchesStatus = activeStatus === "all" || entry.status === activeStatus;
      const searchable = [entry.title, entry.translation, entry.source, entry.context, entry.topic, entry.note, entry.reflection, entry.useNow, entry.fixIt, ...(entry.relations || [])].join(" ").toLowerCase();
      return matchesView && matchesType && matchesStatus && (!query || searchable.includes(query));
    })
    .sort((a, b) => sortNewest ? b.id - a.id : a.id - b.id);
}

function renderCards() {
  const visible = filteredEntries();
  entryGrid.innerHTML = visible.map((entry) => `
    <article class="entry-card ${entry.id === selectedId ? "selected" : ""}" data-entry-id="${entry.id}" tabindex="0">
      <div class="card-top"><span class="type-label ${entry.type}">${typeLabel(entry.type)}</span><span class="card-status ${entry.status === "inbox" ? "pending" : ""}" title="${entry.status === "inbox" ? "Waiting" : "Done"}"></span></div>
      <h3 class="card-title">${escapeHtml(entry.title)}</h3>
      <div class="card-source">${escapeHtml(entry.source)}</div>
      <p class="card-insight ${entry.note ? "" : "empty-insight"}">${entry.note ? escapeHtml(entry.note) : "尚未记录观察"}</p>
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
    document.querySelector("#favoriteButton").classList.remove("favorite-active");
    document.querySelector("#favoriteButton").textContent = "♡";
    document.querySelector("#editEntry").hidden = true;
    document.querySelector("#markDone").hidden = true;
    return;
  }
  detailContent.innerHTML = `
    <div class="detail-type">${typeLabel(entry.type)} · ${entry.status === "inbox" ? "Waiting" : "Done"}</div>
    <h1 class="detail-title">${escapeHtml(entry.title)}</h1>
    <div class="detail-translation"><span class="detail-small-label">Homer's Epic</span><span>${escapeHtml(entry.translation)}</span></div>
    <div class="detail-source-block"><div class="detail-small-label">Home</div><div class="detail-source">${escapeHtml(entry.source)}</div></div>
    <section class="detail-section"><h3>Background</h3><p>${displayText(entry.context, "Not recorded")}</p></section>
    <section class="detail-section"><h3>Prejudice</h3><p>${displayText(entry.note, "Not recorded")}</p></section>
    <section class="detail-section"><h3>Flag</h3><div class="relation-list"><span class="relation">#${escapeHtml(entry.topic)}</span></div></section>
    <section class="detail-section"><h3>Sister</h3><div class="relation-list">${(entry.relations || []).map((relation) => `<span class="relation">${escapeHtml(relation)}</span>`).join("") || `<span class="empty-field">Not added</span>`}</div></section>
    <section class="detail-section personal"><h3>X</h3><p>${displayText(entry.reflection, "Not recorded")}</p></section>
    <section class="detail-section"><h3>Use now</h3><p>${displayText(entry.useNow, "Not recorded")}</p></section>
    <section class="detail-section"><h3>Fix it</h3><p>${displayText(entry.fixIt, "Not recorded")}</p></section>
    <div class="detail-footer"><span>记录于 ${entry.date}</span></div>
  `;
  document.querySelector("#favoriteButton").classList.toggle("favorite-active", entry.favorite);
  document.querySelector("#favoriteButton").textContent = entry.favorite ? "♥" : "♡";
  const editButton = document.querySelector("#editEntry");
  const markButton = document.querySelector("#markDone");
  editButton.hidden = false;
  markButton.hidden = false;
  markButton.textContent = entry.status === "inbox" ? "✓" : "↶";
  markButton.title = entry.status === "inbox" ? "Done" : "Waiting";
  markButton.setAttribute("aria-label", markButton.title);
}

function openDetail(id) {
  selectedId = id;
  renderCards();
  renderDetail();
  setDrawerOpen(true);
}

function setDrawerOpen(open) {
  detailPanel.classList.toggle("open", open);
  appShell.classList.toggle("drawer-open", open);
}

function openEdit() {
  const entry = entries.find((item) => item.id === selectedId);
  if (!entry) return;
  editForm.elements.title.value = entry.title;
  editForm.elements.type.value = entry.type;
  editForm.elements.source.value = entry.source;
  editForm.elements.translation.value = entry.translation === "尚未补充译法" ? "" : entry.translation;
  editForm.elements.context.value = entry.context;
  editForm.elements.note.value = entry.note;
  editForm.elements.reflection.value = entry.reflection;
  editForm.elements.useNow.value = entry.useNow;
  editForm.elements.fixIt.value = entry.fixIt;
  editForm.elements.topic.value = entry.topic === "待命名主题" ? "" : entry.topic;
  editForm.elements.relations.value = (entry.relations || []).join(", ");
  editForm.elements.status.value = entry.status;
  editModal.hidden = false;
  setTimeout(() => editForm.elements.title.focus(), 0);
}

function closeEdit() {
  editModal.hidden = true;
}

function renderDiscovery() {
  const entry = entries.find((item) => item.id === discoveryId) || entries[0];
  if (!entry) return;
  document.querySelector("#rediscoveryQuote").textContent = entry.title;
  document.querySelector("#rediscoverySource").textContent = entry.source;
  document.querySelector("#rediscoveryTopic").textContent = entry.topic;
  document.querySelector("#rediscoveryNote").textContent = entry.note || "尚未记录观察";
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
  captureModePicker.classList.add("active");
  captureForm.classList.remove("active", "rough-mode", "detailed-mode");
  captureForm.reset();
  setTimeout(() => captureModePicker.querySelector(".mode-option").focus(), 0);
}

function closeCapture() { captureModal.hidden = true; }

function chooseCaptureMode(mode) {
  captureModePicker.classList.remove("active");
  captureForm.classList.add("active", `${mode}-mode`);
  document.querySelector("#selectedModeLabel").textContent = mode === "detailed" ? "详细完整记录 · 直接沉淀" : "粗略记录 · 稍后整理";
  document.querySelector("#captureDraftNote").textContent = mode === "detailed" ? "保存后会进入 Done" : "保存后会进入 Waiting";
  setTimeout(() => captureForm.querySelector("textarea").focus(), 0);
}

function backToCaptureMode() {
  captureModePicker.classList.add("active");
  captureForm.classList.remove("active", "rough-mode", "detailed-mode");
  setTimeout(() => captureModePicker.querySelector(".mode-option").focus(), 0);
}

function toggleStatus() {
  const entry = entries.find((item) => item.id === selectedId);
  if (!entry) return;
  entry.status = entry.status === "inbox" ? "finished" : "inbox";
  persist();
  renderAll();
  setDrawerOpen(true);
}

function saveEditedEntry(event) {
  event.preventDefault();
  const entry = entries.find((item) => item.id === selectedId);
  if (!entry) return;
  const data = new FormData(event.currentTarget);
  entry.title = data.get("title");
  entry.translation = data.get("translation") || "尚未补充译法";
  entry.source = data.get("source") || "未注明出处";
  entry.context = data.get("context") || "";
  entry.note = data.get("note") || "";
  entry.reflection = data.get("reflection") || "";
  entry.useNow = data.get("useNow") || "";
  entry.fixIt = data.get("fixIt") || "";
  entry.topic = data.get("topic") || "待命名主题";
  entry.relations = String(data.get("relations") || "").split(",").map((item) => item.trim()).filter(Boolean);
  entry.status = data.get("status") === "finished" ? "finished" : "inbox";
  persist();
  renderAll();
  closeEdit();
  setDrawerOpen(true);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function displayText(value, placeholder) {
  return value ? escapeHtml(value) : `<span class="empty-field">${placeholder}</span>`;
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
document.querySelector("#mobileCapture").addEventListener("click", openCapture);
document.querySelector("#closeCapture").addEventListener("click", closeCapture);
document.querySelector("#cancelCapture").addEventListener("click", closeCapture);
document.querySelectorAll(".mode-option").forEach((button) => button.addEventListener("click", () => chooseCaptureMode(button.dataset.mode)));
document.querySelector("#backToMode").addEventListener("click", backToCaptureMode);
document.querySelector("#captureModal").addEventListener("click", (event) => { if (event.target === captureModal) closeCapture(); });
document.querySelector("#closeDetail").addEventListener("click", () => setDrawerOpen(false));
document.querySelector("#editEntry").addEventListener("click", openEdit);
document.querySelector("#markDone").addEventListener("click", toggleStatus);
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
  const mode = event.currentTarget.classList.contains("detailed-mode") ? "detailed" : "rough";
  const newEntry = {
    id: Date.now(), mode, type: data.get("type"), title: data.get("quote"), translation: data.get("translation") || "尚未补充译法", source: data.get("source") || "未注明出处", context: data.get("context") || "", topic: data.get("topic") || "待命名主题", note: data.get("note") || "", reflection: data.get("reflection") || "", useNow: data.get("useNow") || "", fixIt: data.get("fixIt") || "", status: mode === "detailed" ? "finished" : "inbox", favorite: false, date: new Date().toISOString().slice(0, 10).replaceAll("-", "."), relations: String(data.get("relations") || "").split(",").map((item) => item.trim()).filter(Boolean)
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
document.querySelector("#closeEdit").addEventListener("click", closeEdit);
document.querySelector("#cancelEdit").addEventListener("click", closeEdit);
document.querySelector("#editModal").addEventListener("click", (event) => { if (event.target === editModal) closeEdit(); });
document.querySelector("#editForm").addEventListener("submit", saveEditedEntry);
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "n" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) openCapture();
  if (event.key === "Escape") { closeCapture(); closeEdit(); setDrawerOpen(false); }
  if (event.key === "/" && document.activeElement.tagName !== "INPUT") { event.preventDefault(); document.querySelector("#searchInput").focus(); }
});

renderAll();
