import { textileBatch } from "../data/textile-story.js";

const iconToneClass = (tone) => {
  const mapping = {
    primary: "icon-primary",
    mint: "icon-mint",
    accent: "icon-accent",
    rose: "icon-rose",
  };
  return mapping[tone] ?? "icon-primary";
};

const createStat = ({ label, value }) => {
  const container = document.createElement("div");
  container.className = "stat";
  const span = document.createElement("span");
  span.textContent = label;
  const strong = document.createElement("strong");
  strong.textContent = value;
  container.append(span, strong);
  return container;
};

const createCard = (content) => {
  const card = document.createElement("div");
  card.className = "card";
  card.append(content);
  return card;
};

const createModuleCard = ({ title, description }) => {
  const article = document.createElement("article");
  article.className = "card";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const body = document.createElement("p");
  body.textContent = description;
  article.append(heading, body);
  return article;
};

const createTableRow = (cells) => {
  const row = document.createElement("tr");
  cells.forEach((cell) => {
    const td = document.createElement("td");
    td.textContent = cell;
    row.append(td);
  });
  return row;
};

const createTimelineItem = ({ code, tone, title, points }) => {
  const wrapper = document.createElement("div");
  wrapper.className = "timeline-item";
  const icon = document.createElement("div");
  icon.className = `timeline-icon ${iconToneClass(tone)}`;
  icon.textContent = code;
  const body = document.createElement("div");
  const heading = document.createElement("h4");
  heading.textContent = title;
  const list = document.createElement("ul");
  points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    list.append(item);
  });
  body.append(heading, list);
  wrapper.append(icon, body);
  return wrapper;
};

const createStoryMetric = ({ tag, value, caption }) => {
  const card = document.createElement("div");
  card.className = "card";
  const tagEl = document.createElement("span");
  tagEl.className = "tag";
  tagEl.textContent = tag;
  const stat = document.createElement("div");
  stat.className = "stat";
  const strong = document.createElement("strong");
  strong.textContent = value;
  const span = document.createElement("span");
  span.textContent = caption;
  stat.append(strong, span);
  card.append(tagEl, stat);
  return card;
};

const createPhotoCard = ({ title, meta }) => {
  const card = document.createElement("div");
  card.className = "photo";
  const name = document.createElement("span");
  name.textContent = title;
  const info = document.createElement("small");
  info.textContent = meta;
  card.append(name, info);
  return card;
};

const renderHero = () => {
  const { summary, heroStats } = textileBatch;
  const heroDescription = document.getElementById("hero-description");
  const heroStatsEl = document.getElementById("hero-stats");
  const heroTitle = document.getElementById("hero-title");
  const pill = document.getElementById("pill");

  heroTitle.textContent = summary.title;
  heroDescription.textContent = summary.description;
  pill.textContent = summary.subtitle;

  heroStatsEl.innerHTML = "";
  heroStats.forEach((stat, index) => {
    const statNode = createStat(stat);
    if (index) {
      statNode.style.marginTop = "16px";
    }
    heroStatsEl.append(statNode);
  });
};

const renderModules = () => {
  const container = document.getElementById("modules");
  textileBatch.modules.forEach((module) => {
    container.append(createModuleCard(module));
  });
};

const renderBatchDetails = () => {
  const details = document.getElementById("batch-details");
  const batchId = document.getElementById("batch-id");
  batchId.textContent = `Unique Batch ID: ${textileBatch.summary.batchId}`;

  textileBatch.batchDetails.forEach((detail) => {
    details.append(createTableRow([detail.label, detail.value]));
  });
};

const renderStock = () => {
  const stock = document.getElementById("stock");
  textileBatch.stock.forEach((item) => {
    const stat = createStat(item);
    stock.append(createCard(stat));
  });

  const conversion = document.getElementById("conversion");
  const heading = document.createElement("h3");
  heading.textContent = textileBatch.conversion.title;
  const summary = document.createElement("p");
  summary.textContent = textileBatch.conversion.summary;
  conversion.append(heading, summary);
};

const renderTimeline = () => {
  const timeline = document.getElementById("timeline");
  textileBatch.timeline.forEach((entry) => {
    timeline.append(createTimelineItem(entry));
  });
};

const renderStory = () => {
  document.getElementById("story-title").textContent = textileBatch.story.title;
  document.getElementById("story-overview").textContent = textileBatch.story.overview;

  const metrics = document.getElementById("story-metrics");
  textileBatch.story.metrics.forEach((metric) => {
    metrics.append(createStoryMetric(metric));
  });
};

const renderQuality = () => {
  const qcTable = document.getElementById("qc-table");
  textileBatch.qc.forEach((item) => {
    qcTable.append(createTableRow([item.stage, item.status, item.defects, item.action]));
  });
};

const renderPhotos = () => {
  const grid = document.getElementById("photo-grid");
  textileBatch.photos.forEach((photo) => {
    grid.append(createPhotoCard(photo));
  });
};

const renderVendors = () => {
  const table = document.getElementById("vendor-table");
  textileBatch.vendors.forEach((vendor) => {
    table.append(createTableRow([vendor.vendor, vendor.order, vendor.rate, vendor.due, vendor.payment]));
  });
};

const initializeTextileStory = () => {
  renderHero();
  renderModules();
  renderBatchDetails();
  renderStock();
  renderTimeline();
  renderStory();
  renderQuality();
  renderPhotos();
  renderVendors();
};

initializeTextileStory();