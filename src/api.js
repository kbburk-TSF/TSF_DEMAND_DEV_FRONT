\
// src/api.js — minimal backend client
// Version: 2025-10-05 2025-10-06 00:42
// Helpers: listForecastIds, listMonths, queryView

const DEFAULT_BACKEND = "https://tsf-demand-back.onrender.com";

export const BACKEND = (
  (typeof window !== "undefined" && window.__BACKEND_URL__) ||
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
  DEFAULT_BACKEND
).replace(/\/$/, "");

async function _handle(res) { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); }

export async function getJSON(url)   { return _handle(await fetch(url)); }
export async function postJSON(url, body) {
  return _handle(await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {})
  }));
}

export async function listForecastIds() {
  const data = await getJSON(`${BACKEND}/views/forecasts`);
  return Array.isArray(data) ? data.map(x => String(x)) : [];
}

export async function listMonths(forecast_name) {
  const q = encodeURIComponent(String(forecast_name ?? ""));
  return await getJSON(`${BACKEND}/views/months?forecast_name=${q}`);
}

export async function queryView({ forecast_name, month, span }) {
  return await postJSON(`${BACKEND}/views/query`, {
    forecast_name: String(forecast_name ?? ""),
    month: String(month ?? "").slice(0,7),
    span: Number(span ?? 1)
  });
}
