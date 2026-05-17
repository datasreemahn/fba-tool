import { useState } from "react";

const TABS = [
  { id: "research", icon: "🔍", label: "Product Research" },
  { id: "pl", icon: "📊", label: "P&L Model" },
  { id: "supplier", icon: "🏭", label: "Supplier Tracker" },
  { id: "keyword", icon: "🎯", label: "Keywords" },
  { id: "inventory", icon: "📦", label: "Inventory" },
  { id: "launch", icon: "🚀", label: "Launch Checklist" },
];

const CRITERIA = [
  { id: "price", label: "Selling price $15–$70", tip: "Sweet spot for margins and impulse buys.", weight: 2 },
  { id: "bsr", label: "BSR under 100,000", tip: "Proves consistent demand in the category.", weight: 2 },
  { id: "reviews", label: "Top competitors < 500 reviews", tip: "Lower review count = faster to compete.", weight: 2 },
  { id: "competitors", label: "3–15 FBA sellers on listing", tip: "Healthy demand without a bloodbath.", weight: 1 },
  { id: "size", label: "Small & lightweight (shoebox)", tip: "Lower FBA fulfillment fees.", weight: 2 },
  { id: "seasonal", label: "Sells year-round", tip: "Steady cash flow beats seasonal spikes.", weight: 1 },
  { id: "differentiate", label: "Can be improved or differentiated", tip: "Read 1–3 star reviews for opportunities.", weight: 2 },
  { id: "cogs", label: "COGS < 25% of selling price", tip: "Leaves room for fees (~30%) + ads (~15%).", weight: 2 },
  { id: "brand", label: "Not dominated by big brands", tip: "You can't out-budget Nike or Procter & Gamble.", weight: 2 },
  { id: "ip", label: "No IP / patent / trademark issues", tip: "Search USPTO before sourcing anything.", weight: 2 },
  { id: "keyword", label: "Primary keyword 10K+ searches/mo", tip: "Use Helium 10 or Jungle Scout to verify.", weight: 1 },
  { id: "fragile", label: "Not fragile / hazmat / restricted", tip: "Avoid glass, batteries, FDA-regulated items.", weight: 1 },
];

const LAUNCH_STEPS = [
  { phase: "Before Ordering", items: ["Product scores 80%+ on research checklist", "P&L model shows 20%+ margin and 30%+ ROI", "Trademark search completed (USPTO.gov)", "At least 3 supplier quotes obtained", "Sample ordered and quality approved", "Final COGS and shipping cost confirmed"] },
  { phase: "Brand & Account Setup", items: ["Amazon Seller Central account created", "Professional plan activated ($39.99/mo)", "Business name and brand name finalized", "Logo and brand colors designed", "GS1 UPC barcode purchased", "Trademark application filed"] },
  { phase: "Listing Creation", items: ["Keyword research completed (primary + secondary)", "Product title optimized with main keyword", "7 bullet points written (benefit-led)", "Product description / A+ Content drafted", "Professional product photos taken (7+)", "Backend search terms filled in Seller Central"] },
  { phase: "Inventory & Shipping", items: ["Bulk order placed with supplier", "FNSKU labels sent to supplier for application", "Shipment plan created in Seller Central", "Freight forwarder booked", "Inventory received at Amazon warehouse", "Listing set to Active"] },
  { phase: "Launch", items: ["Automatic PPC campaign live ($20–$30/day budget)", "Manual PPC campaign targeting top keywords", "Friends/family initial purchases for velocity", "Email follow-up sequence set up for reviews", "Seller Central inventory alerts configured", "Daily ACoS and sales monitoring started"] },
];

const genId = () => Math.random().toString(36).slice(2, 9);
const fmt = (v) => "$" + Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const STATUS_COLORS = {
  Contacted: { bg: "#1e293b", text: "#94a3b8", border: "#334155" },
  "Sample Ordered": { bg: "#1a2a0a", text: "#86efac", border: "#166534" },
  Negotiating: { bg: "#1a1a00", text: "#fde68a", border: "#854d0e" },
  Approved: { bg: "#052e16", text: "#22c55e", border: "#166534" },
  Rejected: { bg: "#2d0a0a", text: "#f87171", border: "#7f1d1d" },
};

const KEYWORD_INTENT = ["Broad", "Exact", "Long-tail", "Competitor"];
const INTENT_COLORS = {
  Broad: { bg: "#0f172a", text: "#60a5fa", border: "#1e3a5f" },
  Exact: { bg: "#052e16", text: "#22c55e", border: "#166534" },
  "Long-tail": { bg: "#1a0f00", text: "#fb923c", border: "#7c2d12" },
  Competitor: { bg: "#2d0a2d", text: "#e879f9", border: "#6b21a8" },
};

const STATUS_C = { "OK": "#22c55e", "Low Stock": "#f59e0b", "Reorder Now": "#ef4444", "Out of Stock": "#7f1d1d" };

export default function FBATool() {
  const [tab, setTab] = useState("research");
  const [checked, setChecked] = useState({});
  const [pl, setPl] = useState({ sellingPrice: 35, unitCost: 6, shippingPerUnit: 1.5, unitsOrdered: 400, referralPct: 15, fulfillmentFee: 4.5, ppcBudget: 800, photography: 400, branding: 300, upc: 30, misc: 200 });
  const [suppliers, setSuppliers] = useState([{ id: genId(), name: "Alibaba Supplier A", contact: "", moq: 300, unitPrice: 5.5, leadDays: 30, sampleCost: 25, status: "Contacted", notes: "" }]);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: "", contact: "", moq: "", unitPrice: "", leadDays: "", sampleCost: "", status: "Contacted", notes: "" });
  const [keywords, setKeywords] = useState([
    { id: genId(), keyword: "stainless steel water bottle", volume: 45000, cpc: 0.85, competition: "Medium", intent: "Broad", priority: true },
    { id: genId(), keyword: "insulated water bottle 32oz", volume: 18000, cpc: 1.20, competition: "Low", intent: "Exact", priority: true },
    { id: genId(), keyword: "best water bottle for gym", volume: 9000, cpc: 0.65, competition: "Low", intent: "Long-tail", priority: false },
  ]);
  const [newKw, setNewKw] = useState({ keyword: "", volume: "", cpc: "", competition: "Low", intent: "Broad", priority: false });
  const [showAddKw, setShowAddKw] = useState(false);
  const [invItems, setInvItems] = useState([{ id: genId(), product: "Water Bottle 32oz", sku: "WB-001", stock: 240, sold30: 85, reorderPoint: 150, reorderQty: 400, unitCost: 5.5 }]);
  const [newInv, setNewInv] = useState({ product: "", sku: "", stock: "", sold30: "", reorderPoint: "", reorderQty: "", unitCost: "" });
  const [showAddInv, setShowAddInv] = useState(false);
  const [launchChecked, setLaunchChecked] = useState({});

  const totalLaunchItems = LAUNCH_STEPS.reduce((a, s) => a + s.items.length, 0);
  const completedLaunch = Object.values(launchChecked).filter(Boolean).length;
  const launchPct = Math.round((completedLaunch / totalLaunchItems) * 100);

  const score = CRITERIA.reduce((a, c) => a + (checked[c.id] ? c.weight : 0), 0);
  const maxScore = CRITERIA.reduce((a, c) => a + c.weight, 0);
  const pct = Math.round((score / maxScore) * 100);
  const verdict = pct >= 80 ? { label: "Strong Product ✓", color: "#22c55e" } : pct >= 55 ? { label: "Needs Vetting", color: "#f59e0b" } : { label: "Too Risky", color: "#ef4444" };

  const revenue = pl.sellingPrice * pl.unitsOrdered;
  const referral = (pl.referralPct / 100) * pl.sellingPrice * pl.unitsOrdered;
  const fulfillment = pl.fulfillmentFee * pl.unitsOrdered;
  const cogs = pl.unitCost * pl.unitsOrdered;
  const shipping = pl.shippingPerUnit * pl.unitsOrdered;
  const launchCosts = +pl.ppcBudget + +pl.photography + +pl.branding + +pl.upc + +pl.misc;
  const profit = revenue - referral - fulfillment - cogs - shipping - launchCosts;
  const roi = ((profit / (cogs + shipping + launchCosts)) * 100).toFixed(1);
  const margin = ((profit / revenue) * 100).toFixed(1);
  const breakEven = Math.ceil((referral + fulfillment + cogs + shipping + launchCosts) / pl.sellingPrice);

  const calcDaysLeft = (item) => +item.sold30 > 0 ? Math.round((+item.stock / +item.sold30) * 30) : 999;
  const calcStatus = (item) => {
    if (+item.stock <= 0) return "Out of Stock";
    if (+item.stock <= +item.reorderPoint) return "Reorder Now";
    if (+item.stock <= +item.reorderPoint * 1.3) return "Low Stock";
    return "OK";
  };

  const addSupplier = () => { if (!newSupplier.name) return; setSuppliers(s => [...s, { ...newSupplier, id: genId() }]); setNewSupplier({ name: "", contact: "", moq: "", unitPrice: "", leadDays: "", sampleCost: "", status: "Contacted", notes: "" }); setShowAddSupplier(false); };
  const addKeyword = () => { if (!newKw.keyword) return; setKeywords(k => [...k, { ...newKw, id: genId() }]); setNewKw({ keyword: "", volume: "", cpc: "", competition: "Low", intent: "Broad", priority: false }); setShowAddKw(false); };
  const addInv = () => { if (!newInv.product) return; setInvItems(i => [...i, { ...newInv, id: genId() }]); setNewInv({ product: "", sku: "", stock: "", sold30: "", reorderPoint: "", reorderQty: "", unitCost: "" }); setShowAddInv(false); };

  const inp = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9", padding: "8px 12px", fontSize: 13, fontFamily: "monospace", width: "100%", outline: "none", boxSizing: "border-box" };
  const lbl = { fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 4, display: "block" };
  const card = { background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 16 };
  const btn = (accent) => ({ background: accent || "#FF9900", color: accent ? "#fff" : "#000", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" });

  const NumInput = ({ k, label, prefix = "$", step = 1 }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={lbl}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
        <span style={{ padding: "0 8px", color: "#475569", fontSize: 12, fontFamily: "monospace" }}>{prefix}</span>
        <input type="number" value={pl[k]} step={step} onChange={e => setPl(p => ({ ...p, [k]: parseFloat(e.target.value) || 0 }))} style={{ background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: 14, fontFamily: "monospace", padding: "8px 8px 8px 0", width: "100%", fontWeight: 600 }} />
      </div>
    </div>
  );

  const Stat = ({ label, value, accent, sub }) => (
    <div style={{ background: "#0f172a", border: `1px solid ${accent || "#1e293b"}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: accent || "#f1f5f9", fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#475569", marginTop: 2, fontFamily: "monospace" }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#020817", color: "#f1f5f9", fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ width: 32, height: 32, background: "#FF9900", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>📦</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>Amazon FBA Toolkit</div>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>Budget: $3K–$5K · 6 modules</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%" }} />
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>Shared workspace</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#0a0f1e", borderBottom: "1px solid #1e293b", padding: "0 12px", display: "flex", gap: 0, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "11px 14px", background: "transparent", border: "none", borderBottom: `2px solid ${tab === t.id ? "#FF9900" : "transparent"}`, color: tab === t.id ? "#FF9900" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "monospace", whiteSpace: "nowrap", transition: "all 0.15s" }}>{t.icon} {t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>

        {/* RESEARCH */}
        {tab === "research" && (
          <div>
            <div style={{ ...card, borderColor: verdict.color + "40" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Product Score</span>
                <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: verdict.color }}>{pct}% · {verdict.label}</span>
              </div>
              <div style={{ background: "#0f172a", borderRadius: 999, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: verdict.color, borderRadius: 999, transition: "width 0.4s" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#475569", fontFamily: "monospace" }}>{score}/{maxScore} pts · Aim for 80%+ before ordering anything</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CRITERIA.map(c => (
                <div key={c.id} onClick={() => setChecked(p => ({ ...p, [c.id]: !p[c.id] }))} style={{ background: checked[c.id] ? "#052e16" : "#0a0f1e", border: `1px solid ${checked[c.id] ? "#22c55e40" : "#1e293b"}`, borderRadius: 10, padding: "11px 14px", cursor: "pointer", transition: "all 0.15s", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 17, height: 17, borderRadius: 5, border: `2px solid ${checked[c.id] ? "#22c55e" : "#334155"}`, background: checked[c.id] ? "#22c55e" : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#000", fontWeight: 800, transition: "all 0.15s" }}>{checked[c.id] ? "✓" : ""}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: checked[c.id] ? "#f1f5f9" : "#94a3b8", marginBottom: 2 }}>{c.label}<span style={{ marginLeft: 8, fontSize: 10, background: "#1e293b", color: "#475569", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>+{c.weight}pt</span></div>
                    <div style={{ fontSize: 12, color: "#475569" }}>{c.tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* P&L */}
        {tab === "pl" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <Stat label="Net Profit" value={fmt(profit)} accent={profit >= 0 ? "#22c55e" : "#ef4444"} sub={`on ${pl.unitsOrdered} units`} />
              <Stat label="Profit Margin" value={`${margin}%`} accent={+margin >= 20 ? "#22c55e" : +margin >= 10 ? "#f59e0b" : "#ef4444"} sub="of revenue" />
              <Stat label="Total Investment" value={fmt(cogs + shipping + launchCosts)} accent="#FF9900" sub="inventory + launch" />
              <Stat label="ROI" value={`${roi}%`} accent={+roi >= 30 ? "#22c55e" : +roi >= 15 ? "#f59e0b" : "#ef4444"} sub="return on investment" />
            </div>
            <div style={{ ...card, fontFamily: "monospace", marginBottom: 20 }}>
              <span style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Break-even: </span>
              <span style={{ color: "#f59e0b", fontWeight: 800, fontSize: 15 }}>{breakEven} units</span>
              <span style={{ color: "#475569", fontSize: 12 }}> of {pl.unitsOrdered} ordered ({Math.round((breakEven / pl.unitsOrdered) * 100)}%)</span>
            </div>
            <div style={card}>
              <div style={{ ...lbl, fontSize: 12, marginBottom: 14 }}>Product & Inventory</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <NumInput k="sellingPrice" label="Selling Price" />
                <NumInput k="unitCost" label="Unit Cost (COGS)" />
                <NumInput k="shippingPerUnit" label="Shipping / Unit" step={0.1} />
                <NumInput k="unitsOrdered" label="Units Ordered" prefix="#" step={50} />
              </div>
            </div>
            <div style={card}>
              <div style={{ ...lbl, fontSize: 12, marginBottom: 14 }}>Amazon Fees</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <NumInput k="referralPct" label="Referral Fee %" prefix="%" step={1} />
                <NumInput k="fulfillmentFee" label="FBA Fulfillment / Unit" step={0.1} />
              </div>
            </div>
            <div style={card}>
              <div style={{ ...lbl, fontSize: 12, marginBottom: 14 }}>Launch Costs (One-Time)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <NumInput k="ppcBudget" label="PPC Ad Budget" />
                <NumInput k="photography" label="Product Photos" />
                <NumInput k="branding" label="Logo / Packaging" />
                <NumInput k="upc" label="UPC / FNSKU" />
                <NumInput k="misc" label="Misc / Buffer" />
              </div>
            </div>
            <div style={card}>
              <div style={{ ...lbl, fontSize: 12, marginBottom: 14 }}>Cost Breakdown</div>
              {[["Revenue", revenue, "#22c55e"], ["COGS (inventory)", -cogs, "#ef4444"], ["Inbound Shipping", -shipping, "#ef4444"], ["Amazon Referral Fee", -referral, "#f59e0b"], ["FBA Fulfillment Fees", -fulfillment, "#f59e0b"], ["Launch Costs (one-time)", -launchCosts, "#f59e0b"], ["NET PROFIT", profit, profit >= 0 ? "#22c55e" : "#ef4444"]].map(([label, val, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: label === "NET PROFIT" ? "none" : "1px solid #0f172a", fontFamily: "monospace", fontSize: 13 }}>
                  <span style={{ color: label === "NET PROFIT" ? "#f1f5f9" : "#64748b", fontWeight: label === "NET PROFIT" ? 800 : 400 }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{val >= 0 ? "+" : ""}{fmt(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUPPLIER */}
        {tab === "supplier" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><div style={{ fontWeight: 800, fontSize: 16 }}>Supplier Tracker</div><div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>Compare quotes, samples and status</div></div>
              <button onClick={() => setShowAddSupplier(s => !s)} style={btn()}>+ Add Supplier</button>
            </div>
            {showAddSupplier && (
              <div style={{ ...card, borderColor: "#FF990040" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#FF9900" }}>New Supplier</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  {[["name", "Supplier Name"], ["contact", "Contact / URL"], ["moq", "MOQ (units)"], ["unitPrice", "Unit Price ($)"], ["leadDays", "Lead Time (days)"], ["sampleCost", "Sample Cost ($)"]].map(([k, l]) => (
                    <div key={k}><label style={lbl}>{l}</label><input style={inp} value={newSupplier[k]} onChange={e => setNewSupplier(p => ({ ...p, [k]: e.target.value }))} /></div>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}><label style={lbl}>Status</label><select style={inp} value={newSupplier.status} onChange={e => setNewSupplier(p => ({ ...p, status: e.target.value }))}>{Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}</select></div>
                <div style={{ marginBottom: 16 }}><label style={lbl}>Notes</label><textarea style={{ ...inp, height: 60, resize: "vertical" }} value={newSupplier.notes} onChange={e => setNewSupplier(p => ({ ...p, notes: e.target.value }))} /></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addSupplier} style={btn()}>Save Supplier</button>
                  <button onClick={() => setShowAddSupplier(false)} style={{ ...btn("#334155"), color: "#94a3b8" }}>Cancel</button>
                </div>
              </div>
            )}
            {suppliers.map(s => {
              const sc = STATUS_COLORS[s.status] || STATUS_COLORS["Contacted"];
              return (
                <div key={s.id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div><div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{s.name}</div>{s.contact && <div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{s.contact}</div>}</div>
                    <div style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>{s.status}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: s.notes ? 12 : 0 }}>
                    {[["MOQ", s.moq ? `${s.moq} units` : "—"], ["Unit Price", s.unitPrice ? `$${s.unitPrice}` : "—"], ["Lead Time", s.leadDays ? `${s.leadDays}d` : "—"], ["Sample", s.sampleCost ? `$${s.sampleCost}` : "—"]].map(([l, v]) => (
                      <div key={l} style={{ background: "#0f172a", borderRadius: 8, padding: "8px 10px" }}><div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>{v}</div></div>
                    ))}
                  </div>
                  {s.notes && <div style={{ fontSize: 12, color: "#64748b", background: "#0f172a", borderRadius: 8, padding: "8px 12px", fontFamily: "monospace", marginBottom: 10 }}>📝 {s.notes}</div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                    {Object.keys(STATUS_COLORS).map(st => (<button key={st} onClick={() => setSuppliers(prev => prev.map(x => x.id === s.id ? { ...x, status: st } : x))} style={{ background: s.status === st ? STATUS_COLORS[st].bg : "transparent", border: `1px solid ${s.status === st ? STATUS_COLORS[st].border : "#1e293b"}`, color: s.status === st ? STATUS_COLORS[st].text : "#475569", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontFamily: "monospace", cursor: "pointer" }}>{st}</button>))}
                    <button onClick={() => setSuppliers(prev => prev.filter(x => x.id !== s.id))} style={{ marginLeft: "auto", background: "transparent", border: "1px solid #7f1d1d", color: "#ef4444", borderRadius: 6, padding: "3px 10px", fontSize: 10, fontFamily: "monospace", cursor: "pointer" }}>Remove</button>
                  </div>
                </div>
              );
            })}
            {suppliers.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#475569", fontFamily: "monospace" }}>No suppliers yet. Add your first one above.</div>}
          </div>
        )}

        {/* KEYWORDS */}
        {tab === "keyword" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><div style={{ fontWeight: 800, fontSize: 16 }}>Keyword Research</div><div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>Track volume, CPC and intent</div></div>
              <button onClick={() => setShowAddKw(s => !s)} style={btn()}>+ Add Keyword</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
              <Stat label="Total Keywords" value={keywords.length} />
              <Stat label="Priority" value={keywords.filter(k => k.priority).length} accent="#FF9900" />
              <Stat label="Avg Volume" value={keywords.length ? Math.round(keywords.reduce((a, k) => a + (+k.volume || 0), 0) / keywords.length).toLocaleString() : "0"} accent="#60a5fa" />
            </div>
            {showAddKw && (
              <div style={{ ...card, borderColor: "#FF990040" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#FF9900" }}>New Keyword</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div style={{ gridColumn: "1/-1" }}><label style={lbl}>Keyword</label><input style={inp} value={newKw.keyword} onChange={e => setNewKw(p => ({ ...p, keyword: e.target.value }))} placeholder="e.g. stainless steel water bottle" /></div>
                  <div><label style={lbl}>Monthly Volume</label><input type="number" style={inp} value={newKw.volume} onChange={e => setNewKw(p => ({ ...p, volume: e.target.value }))} /></div>
                  <div><label style={lbl}>CPC ($)</label><input type="number" style={inp} value={newKw.cpc} step={0.01} onChange={e => setNewKw(p => ({ ...p, cpc: e.target.value }))} /></div>
                  <div><label style={lbl}>Competition</label><select style={inp} value={newKw.competition} onChange={e => setNewKw(p => ({ ...p, competition: e.target.value }))}>{["Low", "Medium", "High"].map(c => <option key={c}>{c}</option>)}</select></div>
                  <div><label style={lbl}>Intent</label><select style={inp} value={newKw.intent} onChange={e => setNewKw(p => ({ ...p, intent: e.target.value }))}>{KEYWORD_INTENT.map(i => <option key={i}>{i}</option>)}</select></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <input type="checkbox" id="priority" checked={newKw.priority} onChange={e => setNewKw(p => ({ ...p, priority: e.target.checked }))} />
                  <label htmlFor="priority" style={{ fontSize: 13, color: "#94a3b8", cursor: "pointer" }}>Mark as priority keyword</label>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addKeyword} style={btn()}>Save Keyword</button>
                  <button onClick={() => setShowAddKw(false)} style={{ ...btn("#334155"), color: "#94a3b8" }}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...keywords].sort((a, b) => (b.priority - a.priority) || (+b.volume - +a.volume)).map(k => {
                const ic = INTENT_COLORS[k.intent] || INTENT_COLORS["Broad"];
                const compColor = k.competition === "Low" ? "#22c55e" : k.competition === "Medium" ? "#f59e0b" : "#ef4444";
                return (
                  <div key={k.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {k.priority && <span>⭐</span>}
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>{k.keyword}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ background: ic.bg, color: ic.text, border: `1px solid ${ic.border}`, borderRadius: 5, padding: "2px 8px", fontSize: 10, fontFamily: "monospace" }}>{k.intent}</span>
                        <button onClick={() => setKeywords(prev => prev.filter(x => x.id !== k.id))} style={{ background: "transparent", border: "none", color: "#475569", cursor: "pointer", fontSize: 12 }}>✕</button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                      {[["Monthly Volume", (+k.volume || 0).toLocaleString(), "#60a5fa"], ["Avg CPC", k.cpc ? `$${(+k.cpc).toFixed(2)}` : "—", "#f1f5f9"], ["Competition", k.competition, compColor]].map(([l, v, c]) => (
                        <div key={l} style={{ background: "#0f172a", borderRadius: 8, padding: "8px 10px" }}><div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "monospace" }}>{v}</div></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {keywords.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#475569", fontFamily: "monospace" }}>No keywords yet.</div>}
            <div style={{ marginTop: 16, padding: 14, background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12, color: "#475569", fontFamily: "monospace", lineHeight: 1.7 }}>
              💡 Use <strong style={{ color: "#64748b" }}>Helium 10</strong> or <strong style={{ color: "#64748b" }}>Jungle Scout</strong> for these numbers. Target: 1–2 Exact keywords with 10K+ volume + Low competition.
            </div>
          </div>
        )}

        {/* INVENTORY */}
        {tab === "inventory" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><div style={{ fontWeight: 800, fontSize: 16 }}>Inventory & Reorder Planner</div><div style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>Track stock levels and reorder triggers</div></div>
              <button onClick={() => setShowAddInv(s => !s)} style={btn()}>+ Add Product</button>
            </div>
            {showAddInv && (
              <div style={{ ...card, borderColor: "#FF990040" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "#FF9900" }}>New Inventory Item</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[["product", "Product Name", "text"], ["sku", "SKU", "text"], ["stock", "Current Stock (units)", "number"], ["sold30", "Units Sold (last 30 days)", "number"], ["reorderPoint", "Reorder Point (units)", "number"], ["reorderQty", "Reorder Quantity", "number"], ["unitCost", "Unit Cost ($)", "number"]].map(([k, l, t]) => (
                    <div key={k}><label style={lbl}>{l}</label><input type={t} style={inp} value={newInv[k]} onChange={e => setNewInv(p => ({ ...p, [k]: e.target.value }))} /></div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addInv} style={btn()}>Save Product</button>
                  <button onClick={() => setShowAddInv(false)} style={{ ...btn("#334155"), color: "#94a3b8" }}>Cancel</button>
                </div>
              </div>
            )}
            {invItems.map(item => {
              const daysLeft = calcDaysLeft(item);
              const status = calcStatus(item);
              const sc = STATUS_C[status];
              const dailyRate = +item.sold30 > 0 ? (+item.sold30 / 30).toFixed(1) : 0;
              return (
                <div key={item.id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div><div style={{ fontWeight: 700, fontSize: 15 }}>{item.product}</div><div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>SKU: {item.sku || "—"}</div></div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ background: sc + "20", color: sc, border: `1px solid ${sc}40`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>{status}</div>
                      <button onClick={() => setInvItems(prev => prev.filter(x => x.id !== item.id))} style={{ background: "transparent", border: "none", color: "#475569", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace", color: "#64748b", marginBottom: 4 }}>
                      <span>Stock: {item.stock} units</span><span>Reorder at: {item.reorderPoint} units</span>
                    </div>
                    <div style={{ background: "#0f172a", borderRadius: 999, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, (+item.stock / (+item.reorderPoint * 2)) * 100)}%`, height: "100%", background: sc, borderRadius: 999, transition: "width 0.4s" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                    {[["Days Left", daysLeft === 999 ? "∞" : `${daysLeft}d`, daysLeft < 30 ? "#ef4444" : daysLeft < 60 ? "#f59e0b" : "#22c55e"], ["Daily Rate", `${dailyRate}/day`, "#f1f5f9"], ["Reorder Qty", `${item.reorderQty}`, "#60a5fa"], ["Reorder Cost", fmt(+item.reorderQty * +item.unitCost), "#FF9900"]].map(([l, v, c]) => (
                      <div key={l} style={{ background: "#0f172a", borderRadius: 8, padding: "8px 10px" }}><div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "monospace" }}>{v}</div></div>
                    ))}
                  </div>
                  {status === "Reorder Now" && (
                    <div style={{ marginTop: 12, background: "#2d0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#f87171", fontFamily: "monospace" }}>
                      ⚠️ Stock below reorder point! Place order of {item.reorderQty} units ({fmt(+item.reorderQty * +item.unitCost)}) now to avoid stockout.
                    </div>
                  )}
                </div>
              );
            })}
            {invItems.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#475569", fontFamily: "monospace" }}>No products tracked yet.</div>}
          </div>
        )}

        {/* LAUNCH CHECKLIST */}
        {tab === "launch" && (
          <div>
            <div style={{ ...card, borderColor: launchPct === 100 ? "#22c55e40" : "#FF990030" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Launch Progress</span>
                <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: launchPct === 100 ? "#22c55e" : "#FF9900" }}>{launchPct}% · {completedLaunch}/{totalLaunchItems} steps</span>
              </div>
              <div style={{ background: "#0f172a", borderRadius: 999, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${launchPct}%`, height: "100%", background: launchPct === 100 ? "#22c55e" : "#FF9900", borderRadius: 999, transition: "width 0.4s" }} />
              </div>
            </div>
            {LAUNCH_STEPS.map((phase, pi) => {
              const phaseCompleted = phase.items.filter((_, ii) => launchChecked[`${pi}-${ii}`]).length;
              return (
                <div key={pi} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#f1f5f9" }}>{phase.phase}</div>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: phaseCompleted === phase.items.length ? "#22c55e" : "#64748b" }}>{phaseCompleted}/{phase.items.length}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {phase.items.map((item, ii) => {
                      const key = `${pi}-${ii}`;
                      const done = launchChecked[key];
                      return (
                        <div key={ii} onClick={() => setLaunchChecked(p => ({ ...p, [key]: !p[key] }))} style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", padding: "8px 10px", borderRadius: 8, background: done ? "#052e16" : "#0f172a", border: `1px solid ${done ? "#22c55e30" : "#1e293b"}`, transition: "all 0.15s" }}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${done ? "#22c55e" : "#334155"}`, background: done ? "#22c55e" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#000", fontWeight: 800, transition: "all 0.15s" }}>{done ? "✓" : ""}</div>
                          <span style={{ fontSize: 13, color: done ? "#64748b" : "#94a3b8", textDecoration: done ? "line-through" : "none" }}>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 4, padding: 14, background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12, color: "#475569", fontFamily: "monospace", lineHeight: 1.7 }}>
              💡 Don't skip <strong style={{ color: "#64748b" }}>Before Ordering</strong> — most beginners lose money by sourcing before validating margins.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
