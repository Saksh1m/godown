export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMeters(m) {
  return `${parseFloat(m).toLocaleString("en-IN")} m`;
}

export function $(selector) {
  return document.querySelector(selector);
}

export function $$(selector) {
  return document.querySelectorAll(selector);
}

export function showStatus(el, message, type) {
  el.textContent = message;
  el.className = type === "success" ? "status-success" : "status-error";
}

export function clearStatus(el) {
  el.textContent = "";
  el.className = "";
}
