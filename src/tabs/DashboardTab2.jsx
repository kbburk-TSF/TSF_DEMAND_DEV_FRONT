// Self-contained tabs (no api.js dependency)
// Updated: 2025-10-06 01:16
// Endpoints used:
//   GET  {BACKEND}/health
//   GET  {BACKEND}/views/forecasts
//   GET  {BACKEND}/views/months?forecast_name=...
//   POST {BACKEND}/views/query   body: { forecast_name, month, span }

import React, { useEffect, useState } from "react";

// ---- backend resolver & fetch helpers ----
import { API_BASE } from "../env.js"; // safe if present; ignored if not used

const BACKEND = (
  (typeof window !== "undefined" && window.__BACKEND_URL__) ||
  (typeof API_BASE !== "undefined" && API_BASE) ||
  "https://tsf-demand-back.onrender.com"
).replace(/\/$/, "");

async function httpGet(path) {
  const res = await fetch(`${BACKEND}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function httpPost(path, body) {
  const res = await fetch(`${BACKEND}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}


export default function DashboardTab2(){
  const [forecastName, setForecastName] = useState("");
  const [forecasts, setForecasts] = useState([]);
  const [months, setMonths] = useState([]);
  const [month, setMonth] = useState("");
  const [span, setSpan] = useState(1);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const names = await httpGet("/views/forecasts");
        const arr = Array.isArray(names) ? names.map(String) : [];
        setForecasts(arr);
        if (arr.length) setForecastName(arr[0]);
      } catch(e){ setError(String(e?.message || e)); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!forecastName) return;
      try {
        const ms = await httpGet(`/views/months?forecast_name=${encodeURIComponent(forecastName)}`);
        setMonths(ms);
        if (ms.length) setMonth(ms[0]);
      } catch(e){ setError(String(e?.message || e)); }
    })();
  }, [forecastName]);

  async function run(){
    setError("");
    try {
      const res = await httpPost("/views/query", {
        forecast_name: forecastName,
        month,
        span: Number(span)
      });
      setRows(res?.rows || res || []);
    } catch(e){ setError(String(e?.message || e)); }
  }

  return (
    <div className="p-4 space-y-3">
      <div className="text-sm opacity-70">Backend: {BACKEND}</div>
      <div className="flex items-center gap-2">
        <select value={forecastName} onChange={e=>setForecastName(e.target.value)} className="border px-2 py-1 rounded">
          {forecasts.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={month} onChange={e=>setMonth(e.target.value)} className="border px-2 py-1 rounded">
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={span} onChange={e=>setSpan(e.target.value)} className="border px-2 py-1 rounded">
          {[1,2,3].map(n => <option key={n} value={n}>{n} mo</option>)}
        </select>
        <button onClick={run} className="px-3 py-2 rounded bg-black text-white">Run</button>
      </div>
      {error && <div className="text-red-700 text-sm">{error}</div>}
      <div className="text-xs">Rows: {rows.length}</div>
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto" style={{maxHeight: 240}}>{JSON.stringify(rows.slice(0,50), null, 2)}</pre>
    </div>
  );
}
