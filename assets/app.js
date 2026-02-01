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

const createTableHeader = (columns) => {
  const row = document.createElement("tr");
  columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column;
    row.append(th);
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

const createPhotoCard = ({ title, caption, meta }) => {
  const card = document.createElement("div");
  card.className = "photo";
  const name = document.createElement("span");
  name.textContent = title;
   const captionEl = document.createElement("p");
  captionEl.textContent = caption;
  const list = document.createElement("ul");
  list.className = "meta-list";
  meta.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  });
  card.append(name, captionEl, list);
  return card;
};

const renderHero = () => {
  const { summary, heroStats, ctas } = textileBatch;
  const heroDescription = document.getElementById("hero-description");
  const heroStatsEl = document.getElementById("hero-stats");
  const heroTitle = document.getElementById("hero-title");
  const pill = document.getElementById("pill");
  const ctaPrimary = document.getElementById("cta-primary");
  const ctaSecondary = document.getElementById("cta-secondary");
  
  heroTitle.textContent = summary.title;
  heroDescription.textContent = summary.description;
  pill.textContent = summary.subtitle;
  ctaPrimary.textContent = ctas.primary.label;
  ctaPrimary.href = ctas.primary.href;
  ctaSecondary.textContent = ctas.secondary.label;
  ctaSecondary.href = ctas.secondary.href;

  heroStatsEl.innerHTML = "";
  heroStats.forEach((stat, index) => {
    const statNode = createStat(stat);
    if (index) {
      statNode.style.marginTop = "16px";
    }
    heroStatsEl.append(statNode);
  });
};

const renderPageTitle = () => {
  document.title = textileBatch.pageTitle;
};
  
const renderModules = () => {
  const container = document.getElementById("modules");
  textileBatch.modules.forEach((module) => {
    container.append(createModuleCard(module));
  });
};

const renderBatchDetails = () => {
  const { batchControl } = textileBatch.sections;
  const details = document.getElementById("batch-details");
  const batchId = document.getElementById("batch-id");
  const batchHead = document.getElementById("batch-head");
  const batchTitle = document.getElementById("batch-title");
  batchTitle.textContent = batchControl.title;
  batchId.textContent = `${batchControl.tag} ${textileBatch.summary.batchId}`;
  batchHead.innerHTML = "";
  batchHead.append(createTableHeader(batchControl.columns));
  details.innerHTML = "";
  batchControl.details.forEach((detail) => {
    details.append(createTableRow([detail.label, detail.value]));
  });
};

const renderStock = () => {
  const { stock: stockData } = textileBatch.sections;
  const stockGrid = document.getElementById("stock");
  const stockTitle = document.getElementById("stock-title");
  const stockTag = document.getElementById("stock-tag");
  stockTitle.textContent = stockData.title;
  stockTag.textContent = stockData.tag;
  stockGrid.innerHTML = "";
  stockData.stats.forEach((item) => {
    const stat = createStat(item);
    stockGrid.append(createCard(stat));
  });

  const conversion = document.getElementById("conversion");
  conversion.innerHTML = "";
  const heading = document.createElement("h3");
  heading.textContent = stockData.conversion.title;
  const summary = document.createElement("p");
  summary.textContent = stockData.conversion.summary;
  const list = document.createElement("ul");
  list.className = "detail-list";
  stockData.conversion.details.forEach((detail) => {
    const item = document.createElement("li");
    item.textContent = detail;
    list.append(item);
  });
  conversion.append(heading, summary, list);
};

const renderTimeline = () => {
  const timeline = document.getElementById("timeline");
  const { timeline: timelineData } = textileBatch.sections;
  const timelineTitle = document.getElementById("timeline-title");
  const timelineTag = document.getElementById("timeline-tag");
  timelineTitle.textContent = timelineData.title;
  timelineTag.textContent = timelineData.tag;
  timeline.innerHTML = "";
  timelineData.entries.forEach((entry) => {
    timeline.append(createTimelineItem(entry));
  });
};

const renderStory = () => {
  const { story } = textileBatch.sections;
  document.getElementById("story-title").textContent = story.title;
  document.getElementById("story-overview").textContent = story.overview;
  document.getElementById("story-pill").textContent = story.pill;

  const metrics = document.getElementById("story-metrics");
  metrics.innerHTML = "";
  story.metrics.forEach((metric) => {
    metrics.append(createStoryMetric(metric));
  });

  const highlights = document.getElementById("story-highlights");
  highlights.innerHTML = "";
  const heading = document.createElement("h4");
  heading.textContent = story.highlightsTitle;
  const list = document.createElement("ul");
  list.className = "detail-list";
  story.highlights.forEach((highlight) => {
    const item = document.createElement("li");
    item.textContent = highlight;
    list.append(item);
  });
  highlights.append(heading, list);
};

const renderQuality = () => {
  const { quality } = textileBatch.sections;
  const qcTable = document.getElementById("qc-table");
  const qcHead = document.getElementById("qc-head");
  const qcTitle = document.getElementById("qc-title");
  qcTitle.textContent = quality.title;
  qcHead.innerHTML = "";
  qcHead.append(createTableHeader(quality.columns));
  qcTable.innerHTML = "";
  quality.checkpoints.forEach((item) => {
    qcTable.append(createTableRow([item.stage, item.status, item.defects, item.action]));
  });
};

const renderPhotos = () => {
  const { photos } = textileBatch.sections;
  const grid = document.getElementById("photo-grid");
  const photoTitle = document.getElementById("photo-title");
  const photoTag = document.getElementById("photo-tag");
  photoTitle.textContent = photos.title;
  photoTag.textContent = photos.tag;
  grid.innerHTML = "";
  photos.items.forEach((photo) => {
    grid.append(createPhotoCard(photo));
  });
};

const renderVendors = () => {
  const { vendors } = textileBatch.sections;
  const table = document.getElementById("vendor-table");
  const vendorHead = document.getElementById("vendor-head");
  const vendorTitle = document.getElementById("vendor-title");
  vendorTitle.textContent = vendors.title;
  vendorHead.innerHTML = "";
  vendorHead.append(createTableHeader(vendors.columns));
  table.innerHTML = "";
  vendors.items.forEach((vendor) => {
    table.append(createTableRow([vendor.vendor, vendor.work, vendor.rate, vendor.due, vendor.payment]));
  });
};

const renderFooter = () => {
  const footer = document.getElementById("footer-text");
  footer.textContent = textileBatch.footer;
};

const initializeTextileStory = () => {
  renderPageTitle();
  renderHero();
  renderModules();
  renderBatchDetails();
  renderStock();
  renderTimeline();
  renderStory();
  renderQuality();
  renderPhotos();
  renderVendors();
  renderFooter();
};

initializeTextileStory();