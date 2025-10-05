// src/tabs/api.js
// Endpoint glue ONLY — no UI logic changed.
// Points to FastAPI routes defined in backend/routes/views.py
//  - GET  /views/forecasts           -> string[] of forecast_name
//  - GET  /views/months?forecast_name -> string[] of YYYY-MM
//  - POST /views/query { forecast_name, month:"YYYY-MM", span:1|2|3 } -> { rows: [...] }

async function getJSON(url){
  const r = await fetch(url, { credentials: "same-origin" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function postJSON(url, body){
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ---- Public API (do not change call sites) ----
export async function getForecasts(){
  return getJSON("/views/forecasts");           // -> string[]
}

export async function getMonths(forecast_name){
  const q = encodeURIComponent(forecast_name ?? "");
  return getJSON(`/views/months?forecast_name=${q}`);  // -> string[] "YYYY-MM"
}

export async function runQuery({ forecast_name, month, span }){
  // month = "YYYY-MM"; span = 1|2|3
  return postJSON("/views/query", { forecast_name, month, span });
}

// Optionally default export to keep older imports happy
export default {
  getForecasts,
  getMonths,
  runQuery,
};
