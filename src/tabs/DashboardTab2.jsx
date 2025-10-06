// src/tabs/DashboardTab2.jsx
// Derived from DashboardTab.jsx (2025-09-27):
// - Shows only Chart 1 (Classical) and Chart 3 (Gold Line & Green Zone).
// - Uses the exact same configurations, sizing, legends, and shared Y-axis domain logic.
// - Historical actuals on all charts; bottom legend excludes High/Low items.

import React, { useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";

// --- local backend helpers (no api.js) ---
import { API_BASE } from "../env.js"; // optional
const BACKEND = (
  (typeof window !== "undefined" && window.__BACKEND_URL__) ||
  (typeof API_BASE !== "undefined" && API_BASE) ||
  "https://tsf-demand-back.onrender.com"
).replace(/\/$/, "");

async function __handle(res){
  if(!res.ok){
    let t=""; try{ t = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status}${t ? (": " + t) : ""}`);
  }
  return res.json();
}
async function __get(p){ return __handle(await fetch(`${BACKEND}${p}`)); }

export async function listForecastIds(){
  const data = await __get("/views/forecasts");
  return Array.isArray(data) ? data.map(String) : [];
}
export async function listMonths(forecast_name){
  const q = encodeURIComponent(String(forecast_name||""));
  return await __get(`/views/months?forecast_name=${q}`);
}
export async function __postQuery(body){
  const r = await fetch(`${BACKEND}/views/query`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(body||{})
  });
  return __handle(r);
}


// ==== helpers ====
const MS_DAY = 86400000;
function parseYMD(s){ return new Date(s + "T00:00:00Z"); }
function ymd(d){ return d.toISOString().slice(0,10); }
function firstOfMonthUTC(d){ return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); }
function lastOfMonthUTC(d){ return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 0)); }
function addMonthsUTC(d, n){ return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+n, d.getUTCDate())); }
function fmtMDY(s){ const d=parseYMD(s); const mm=d.getUTCMonth()+1, dd=d.getUTCDate(), yy=String(d.getUTCFullYear()).slice(-2); return `${mm}/${dd}/${yy}`; }
function daysBetweenUTC(a,b){ const out=[]; let t=a.getTime(); while (t<=b.getTime()+1e-3){ out.push(ymd(new Date(t))); t+=MS_DAY; } return out; }

// Hook: measure container width (and re-render on resize)
function useContainerWidth(){
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(entries => {
      for (const e of entries){
        const box = e.contentBoxSize ? (Array.isArray(e.contentBoxSize) ? e.contentBoxSize[0] : e.contentBoxSize) : null;
        const width = box ? box.inlineSize : el.clientWidth || 0;
        setW(width);
      }
    });
    ro.observe(el);
    setW(el.clientWidth || 0);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

// Shared chart math
function useChartMath(rows){
  const [wrapRef, W] = useContainerWidth();
  const H = Math.max(220, Math.min(340, Math.round(W * 0.22))); // shorter responsive height (same as DashboardTab)
  const pad = { top: 28, right: 24, bottom: 72, left: 70 };
  const N = (rows||[]).length;
  const startIdx = 7; // preroll days

  const innerW = Math.max(1, W - pad.left - pad.right);
  const innerH = Math.max(1, H - pad.top - pad.bottom);

  const xScale(startIdx) - xScale(0)} y={pad.top} width={Math.max(0, xScale(startIdx) - xScale(0))} height={H-pad.top-pad.bottom} fill="rgba(0,0,0,0.08)"/>
        <path d={path(histActualPts)} fill="none" stroke="#000" strokeWidth={1.8}/>
        <path d={path(futActualPts)}  fill="none" stroke="#000" strokeWidth={2.4} strokeDasharray="4,6"/>
        <path d={path(arimaPts)}      fill="none" stroke={C_ARIMA} strokeWidth={2.4}/>
        <path d={path(sesPts)}        fill="none" stroke={C_SES}   strokeWidth={2.4}/>
        <path d={path(hwesPts)}       fill="none" stroke={C_HWES}  strokeWidth={2.4}/>
        {rows.map((r,i)=>(
          <g key={i} transform={`translate(${xScale(startIdx) - xScale(0)} y={pad.top} width={Math.max(0, xScale(startIdx) - xScale(0))} height={H-pad.top-pad.bottom} fill="rgba(0,0,0,0.08)"/>
        {ci95Poly && <polygon points={ci95Poly} fill={fill95} stroke="none" />}
{ci90Poly && <polygon points={ci90Poly} fill={fill90} stroke="none" />}
{ci85Poly && <polygon points={ci85Poly} fill={fill85} stroke="none" />}
<path d={path(ci95HighPts)} fill="none" stroke={strokeGreen} strokeWidth={1.6}/>
<path d={path(ci95LowPts)}  fill="none" stroke={strokeGreen} strokeWidth={1.6}/>
<path d={path(ci90HighPts)} fill="none" stroke={strokeGreen} strokeWidth={1.6}/>
<path d={path(ci90LowPts)}  fill="none" stroke={strokeGreen} strokeWidth={1.6}/>
<path d={path(ci85HighPts)} fill="none" stroke={strokeGreen} strokeWidth={1.6}/>
<path d={path(ci85LowPts)}  fill="none" stroke={strokeGreen} strokeWidth={1.6}/>
        <path d={path(histActualPts)} fill="none" stroke="#000" strokeWidth={1.8}/>
        <path d={path(futActualPts)}  fill="none" stroke="#000" strokeWidth={2.4} strokeDasharray="4,6"/>
        <path d={path(fvPts)}         fill="none" stroke={fvColor} strokeWidth={2.4}/>
                        {rows.map((r,i)=>(
          <g key={i} transform={`translate(${xScale(i)}, ${H-pad.bottom})`}>
            <line x1={0} y1={0} x2={0} y2={6} stroke="#aaa"/>
            <text x={10} y={0} fontSize="11" fill="#666" transform="rotate(90 10 0)" textAnchor="start">{fmtMDY(r.date)}</text>
          </g>
        ))}
      </svg>
      <InlineLegend items={legendItems} />
    </div>
  );
}

// Section wrapper with explicit side padding
function ChartSection({ title, children, mt=16 }){
  return (
    <section style={{ marginTop: mt, paddingLeft: 32, paddingRight: 32 }}>
      <h2 style={{margin:"6px 0 10px"}}>{title}</h2>
      {children}
    </section>
  );
}

export default function DashboardTab2(){
  const [ids, setIds] = useState([]);
  const [forecastId, setForecastId] = useState("");
  const [allMonths, setAllMonths] = useState([]);
  const [startMonth, setStartMonth] = useState("");
  const [monthsCount, setMonthsCount] = useState(1);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await listForecastIds();
        const norm = (Array.isArray(list) ? list : []).map(x => (
          typeof x === "string" ? { id:x, name:x }
          : { id:String(x.id ?? x.value ?? x), name:String(x.name ?? x.label ?? x.id ?? x) }
        ));
        setIds(norm);
        if (norm.length) setForecastId(norm[0].id);
      } catch(e){ setStatus("Could not load forecasts: " + String(e.message||e)); }
    })();
  }, []);

  useEffect(() => {
    if (!forecastId) return;
    (async () => {
      try {
        setStatus("Loading months…");
try {
  const months = await listMonths(forecastId);
  setAllMonths(months||[]);
  if ((months||[]).length) setStartMonth(String(months[0]) + "-01");
} catch (e) {
  setError(e?.message||String(e));
}
setStatus("");
} catch(e){ setStatus("Failed to scan dates: " + String(e.message||e)); }
    })();
  }, [forecastId]);

  const monthOptions = useMemo(() => allMonths.map(m => ({ value: m+"-01", label: m })), [allMonths]);

  async function run(){
    if (!forecastId || !startMonth) return;
    try{
      setStatus("Loading…");
      const start = firstOfMonthUTC(parseYMD(startMonth));
      const preRollStart = new Date(start.getTime() - 7*MS_DAY);
      const end = lastOfMonthUTC(addMonthsUTC(start, monthsCount-1));

      const res = await __postQuery({ forecast_name:String(forecastId), month:String(startMonth).slice(0,7), span:Number(monthsCount) });

      const byDate = new Map();
      for (const r of (res.rows||[])){
        if (!r || !r.date) continue;
        byDate.set(r.date, r);
      }
      const days = daysBetweenUTC(preRollStart, end);
      const strict = days.map(d => {
        const r = byDate.get(d) || {};
        return {
          date: d,
          value: r.value ?? null,
          fv: r.fv ?? null,
          low: r.low ?? null,
          high: r.high ?? null,
          ARIMA_M: r.ARIMA_M ?? null,
          HWES_M:  r.HWES_M  ?? null,
          SES_M:   r.SES_M   ?? null
        };
      });
      setRows(strict);
      setStatus("");
    } catch(e){ setStatus(String(e.message||e)); }
  }

  const sharedYDomain = useMemo(()=>{
    if (!rows || !rows.length) return null;
    const vals = rows.flatMap(r => [r.value, r.low, r.high, r.fv, r.ci85_low, r.ci85_high, r.ci90_low, r.ci90_high, r.ci95_low, r.ci95_high]).filter(v => v!=null).map(Number);
    if (!vals.length) return null;
    const minv = Math.min(vals), maxv = Math.max(vals);
    const pad = (maxv - minv) * 0.08 || 1;
    return [minv - pad, maxv + pad];
  }, [rows]);

  return (
    <div style={{width:"100%"}}>
      <h2 style={{marginTop:0}}>Dashboard 2 — Classical + TSF (Green Zone)</h2>

      <div className="row" style={{alignItems:"end", flexWrap:"wrap"}}>
        <div>
          <label>Forecast (forecast_name)</label><br/>
          <select className="input" value={forecastId} onChange={e=>setForecastId(e.target.value)}>
            {ids.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div>
          <label>Start month</label><br/>
          <select className="input" value={startMonth} onChange={e=>setStartMonth(e.target.value)}>
            {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label>Months to show</label><br/>
          <select className="input" value={monthsCount} onChange={e=>setMonthsCount(Number(e.target.value))}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
        <div>
          <button className="btn" onClick={run}>Run</button>
        </div>
        <div className="muted" style={{marginLeft:12}}>{status}</div>
      </div>

      <ChartSection title="Classical Forecasts (ARIMA, SES, HWES)" mt={16}>
        <MultiClassicalChart rows={rows} yDomain={sharedYDomain} />
      </ChartSection>

      <ChartSection title="Targeted Seasonal Forecast (Gold Line & Green Zone)" mt={24}>
        <GoldAndGreenZoneChart rows={rows} yDomain={sharedYDomain} />
      </ChartSection>
    </div>
  );
}
