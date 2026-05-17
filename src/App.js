import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc
} from "firebase/firestore";

const fc = (v) => "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const uid = () => Math.random().toString(36).slice(2, 8);

const T = {
  bg: "#020817", surface: "#0a0f1e", card: "#0f172a",
  border: "#1e293b", accent: "#FF9900", text: "#f1f5f9",
  muted: "#64748b", sub: "#475569",
  green: "#22c55e", red: "#ef4444", yellow: "#f59e0b",
  mono: "'IBM Plex Mono', monospace",
  sans: "'IBM Plex Sans', 'Segoe UI', sans-serif",
};

const Badge = ({ children, color = T.accent }) => (
  <span style={{ fontSize: 10, fontFamily: T.mono, background: color + "22", color, padding: "2px 7px", borderRadius: 4, fontWeight: 700 }}>{children}</span>
);
const Card = ({ children, style = {} }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, ...style }}>{children}</div>
);
const Input = ({ value, onChange, placeholder, style = {} }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, fontFamily: T.mono, padding: "8px 12px", outline: "none", width: "100%", boxSizing: "border-box", ...style }} />
);
const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: T.mono, marginBottom: 12 }}>{children}</div>
);
const SyncBadge = ({ syncing }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
    <div style={{ width: 7, height: 7, borderRadius: "50%", background: syncing ? T.yellow : T.green }} />
    <span style={{ fontSize: 10, color: T.muted, fontFamily: T.mono }}>{syncing ? "Saving..." : "Synced"}</span>
  </div>
);

// ── Firebase hooks ──────────────────────────────────────────────────────────
function useCollection(col) {
  const [data, setData] = useState([]);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    return onSnapshot(collection(db, col), snap => setData(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [col]);
  const add = async (item) => { setSyncing(true); const id = uid(); await setDoc(doc(db, col, id), { ...item, id, createdAt: Date.now() }); setSyncing(false); };
  const update = async (id, u) => { setSyncing(true); await updateDoc(doc(db, col, id), u); setSyncing(false); };
  const remove = async (id) => { setSyncing(true); await deleteDoc(doc(db, col, id)); setSyncing(false); };
  return { data, syncing, add, update, remove };
}

function useDocument(path, def) {
  const [data, setData] = useState(def);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    const [c, i] = path.split("/");
    return onSnapshot(doc(db, c, i), snap => { if (snap.exists()) setData(snap.data()); });
  }, [path]);
  const save = async (updates) => { setSyncing(true); const [c, i] = path.split("/"); await setDoc(doc(db, c, i), updates, { merge: true }); setSyncing(false); };
  return { data, syncing, save };
}

// ── Research Tab ────────────────────────────────────────────────────────────
const CRITERIA = [
  { id: "price", label: "Selling price $15–$70", tip: "Sweet spot for impulse buys with healthy margin.", weight: 2 },
  { id: "bsr", label: "BSR under 100,000 in main category", tip: "Proves consistent demand.", weight: 2 },
  { id: "reviews", label: "Top competitors < 500 reviews", tip: "Lower barrier to compete.", weight: 2 },
  { id: "competitors", label: "3–15 FBA sellers on listing", tip: "Healthy demand, not saturated.", weight: 1 },
  { id: "size", label: "Small & lightweight (shoebox or less)", tip: "Lower FBA fees = better margins.", weight: 2 },
  { id: "seasonal", label: "Sells year-round", tip: "Steady cash flow beats seasonal spikes.", weight: 1 },
  { id: "differentiate", label: "Can be improved / differentiated", tip: "Read 1–3 star reviews for inspiration.", weight: 2 },
  { id: "cogs", label: "COGS < 25% of selling price", tip: "Leaves room for fees + ads + profit.", weight: 2 },
  { id: "brand", label: "Not dominated by big brands", tip: "You can't out-brand Nike.", weight: 2 },
  { id: "ip", label: "No IP / patent / trademark issues", tip: "Search USPTO before sourcing.", weight: 2 },
  { id: "keyword", label: "Primary keyword 10K+ monthly searches", tip: "Use Helium 10 to verify demand.", weight: 1 },
  { id: "fragile", label: "Not fragile / hazmat / restricted", tip: "Avoid glass, liquids, batteries as a beginner.", weight: 1 },
];
const MODELS = {
  private_label: { name: "Private Label", margin: "20–40%", timeline: "3–6 mo", budget: "$5K–$15K" },
  wholesale: { name: "Wholesale", margin: "10–20%", timeline: "1–3 mo", budget: "$2K–$10K" },
  arbitrage: { name: "Retail Arbitrage", margin: "10–30%", timeline: "1–4 wk", budget: "$500–$3K" },
};

function ResearchTab() {
  const { data, syncing, save } = useDocument("research/main", { checked: {}, model: "private_label" });
  const checked = data.checked || {};
  const model = data.model || "private_label";
  const toggle = (id) => save({ ...data, checked: { ...checked, [id]: !checked[id] } });
  const setModel = (m) => save({ ...data, model: m });
  const score = CRITERIA.reduce((a, c) => a + (checked[c.id] ? c.weight : 0), 0);
  const maxScore = CRITERIA.reduce((a, c) => a + c.weight, 0);
  const pct = Math.round((score / maxScore) * 100);
  const verdict = pct >= 80 ? { label: "Strong Product ✓", color: T.green } : pct >= 55 ? { label: "Needs More Vetting", color: T.yellow } : { label: "Too Risky", color: T.red };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><SyncBadge syncing={syncing} /></div>
      <Card>
        <SectionLabel>Business Model</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {Object.entries(MODELS).map(([k, m]) => (
            <button key={k} onClick={() => setModel(k)} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${model === k ? T.accent : T.border}`, background: model === k ? T.accent + "18" : T.card, color: model === k ? T.accent : T.muted, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: T.mono }}>{m.name}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[["Margin", MODELS[model].margin], ["Timeline", MODELS[model].timeline], ["Budget", MODELS[model].budget]].map(([k, v]) => (
            <div key={k} style={{ fontFamily: T.mono }}><span style={{ color: T.sub, fontSize: 11 }}>{k} </span><span style={{ color: T.accent, fontSize: 13, fontWeight: 700 }}>{v}</span></div>
          ))}
        </div>
      </Card>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <SectionLabel>Product Score</SectionLabel>
          <span style={{ fontFamily: T.mono, fontWeight: 800, fontSize: 16, color: verdict.color }}>{pct}% · {verdict.label}</span>
        </div>
        <div style={{ background: T.surface, borderRadius: 999, height: 8, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: verdict.color, borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: T.sub, fontFamily: T.mono }}>{score}/{maxScore} points</div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CRITERIA.map(c => (
          <div key={c.id} onClick={() => toggle(c.id)} style={{ background: checked[c.id] ? "#052e16" : T.surface, border: `1px solid ${checked[c.id] ? T.green + "50" : T.border}`, borderRadius: 10, padding: "13px 16px", cursor: "pointer", transition: "all 0.15s", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked[c.id] ? T.green : "#334155"}`, background: checked[c.id] ? T.green : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{checked[c.id] ? "✓" : ""}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: checked[c.id] ? T.text : "#94a3b8", marginBottom: 2 }}>{c.label} <Badge color={T.sub}>+{c.weight}pt</Badge></div>
              <div style={{ fontSize: 12, color: T.sub }}>{c.tip}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── P&L Tab ─────────────────────────────────────────────────────────────────
function PLTab() {
  const def = { sellingPrice: 35, unitCost: 6, shippingPerUnit: 1.5, unitsOrdered: 400, referralPct: 15, fulfillmentFee: 4.5, ppcBudget: 800, photography: 400, branding: 300, upc: 30, misc: 200 };
  const { data: pl, syncing, save } = useDocument("pl/main", def);
  const set = (k, v) => save({ ...pl, [k]: parseFloat(v) || 0 });
  const revenue = pl.sellingPrice * pl.unitsOrdered;
  const referral = (pl.referralPct / 100) * pl.sellingPrice * pl.unitsOrdered;
  const fulfillment = pl.fulfillmentFee * pl.unitsOrdered;
  const cogs = pl.unitCost * pl.unitsOrdered;
  const shipping = pl.shippingPerUnit * pl.unitsOrdered;
  const launch = +pl.ppcBudget + +pl.photography + +pl.branding + +pl.upc + +pl.misc;
  const profit = revenue - referral - fulfillment - cogs - shipping - launch;
  const roi = ((profit / (cogs + shipping + launch)) * 100).toFixed(1);
  const margin = ((profit / revenue) * 100).toFixed(1);
  const breakEven = Math.ceil((referral + fulfillment + cogs + shipping + launch) / pl.sellingPrice);
  const NF = ({ k, label, prefix = "$", step = 1 }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.mono }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }}>
        <span style={{ padding: "0 10px", color: T.sub, fontSize: 12, fontFamily: T.mono }}>{prefix}</span>
        <input type="number" value={pl[k] || 0} step={step} onChange={e => set(k, e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: T.text, fontSize: 13, fontFamily: T.mono, padding: "8px 10px 8px 0", width: "100%", fontWeight: 700 }} />
      </div>
    </div>
  );
  const SC = ({ label, value, color, sub }) => (
    <div style={{ background: T.surface, border: `1px solid ${color}40`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.mono, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: T.mono }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.sub, marginTop: 2, fontFamily: T.mono }}>{sub}</div>}
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><SyncBadge syncing={syncing} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <SC label="Net Profit" value={fc(profit)} color={profit >= 0 ? T.green : T.red} sub={`${pl.unitsOrdered} units`} />
        <SC label="Margin" value={`${margin}%`} color={margin >= 20 ? T.green : margin >= 10 ? T.yellow : T.red} sub="of revenue" />
        <SC label="Total Investment" value={fc(cogs + shipping + launch)} color={T.accent} sub="inventory + launch" />
        <SC label="ROI" value={`${roi}%`} color={roi >= 30 ? T.green : roi >= 15 ? T.yellow : T.red} sub="return on invest" />
      </div>
      <Card style={{ fontFamily: T.mono }}>
        <span style={{ color: T.muted, fontSize: 12 }}>Break-even: </span>
        <span style={{ color: T.yellow, fontWeight: 800, fontSize: 15 }}>{breakEven} units</span>
        <span style={{ color: T.sub, fontSize: 12 }}> of {pl.unitsOrdered} ({Math.round((breakEven / pl.unitsOrdered) * 100)}%)</span>
      </Card>
      <Card><SectionLabel>Product & Inventory</SectionLabel><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><NF k="sellingPrice" label="Selling Price" /><NF k="unitCost" label="Unit Cost" /><NF k="shippingPerUnit" label="Shipping/Unit" step={0.1} /><NF k="unitsOrdered" label="Units Ordered" prefix="#" step={50} /></div></Card>
      <Card><SectionLabel>Amazon Fees</SectionLabel><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><NF k="referralPct" label="Referral %" prefix="%" step={1} /><NF k="fulfillmentFee" label="FBA Fee/Unit" step={0.1} /></div></Card>
      <Card><SectionLabel>Launch Costs</SectionLabel><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><NF k="ppcBudget" label="PPC Budget" /><NF k="photography" label="Photography" /><NF k="branding" label="Branding" /><NF k="upc" label="UPC/FNSKU" /><NF k="misc" label="Misc Buffer" /></div></Card>
      <Card>
        <SectionLabel>Cost Breakdown</SectionLabel>
        {[["Revenue", revenue, T.green], ["COGS", -cogs, T.red], ["Shipping", -shipping, T.red], ["Referral Fee", -referral, T.yellow], ["FBA Fulfillment", -fulfillment, T.yellow], ["Launch Costs", -launch, T.yellow], ["NET PROFIT", profit, profit >= 0 ? T.green : T.red]].map(([label, val, color]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: label === "NET PROFIT" ? "none" : `1px solid ${T.surface}`, fontFamily: T.mono, fontSize: 13 }}>
            <span style={{ color: label === "NET PROFIT" ? T.text : T.muted, fontWeight: label === "NET PROFIT" ? 800 : 400 }}>{label}</span>
            <span style={{ color, fontWeight: 700 }}>{val >= 0 ? "+" : ""}{fc(val)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Supplier Tab ─────────────────────────────────────────────────────────────
const SS = ["Researching","Contacted","Sample Ordered","Sample Received","Negotiating","Approved","Rejected"];
const SC2 = { Researching:T.muted, Contacted:"#60a5fa", "Sample Ordered":T.yellow, "Sample Received":"#a78bfa", Negotiating:T.accent, Approved:T.green, Rejected:T.red };
function SupplierTab() {
  const { data: suppliers, syncing, add, update, remove } = useCollection("suppliers");
  const [form, setForm] = useState({ name: "", platform: "Alibaba", product: "", moq: "", pricePerUnit: "", leadTime: "", status: "Researching", notes: "" });
  const [adding, setAdding] = useState(false);
  const handleAdd = async () => {
    if (!form.name) return;
    await add({ ...form, moq: +form.moq, pricePerUnit: +form.pricePerUnit, leadTime: +form.leadTime, rating: 3 });
    setForm({ name: "", platform: "Alibaba", product: "", moq: "", pricePerUnit: "", leadTime: "", status: "Researching", notes: "" });
    setAdding(false);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ fontSize: 12, color: T.muted, fontFamily: T.mono }}>{suppliers.length} suppliers</span><SyncBadge syncing={syncing} /></div>
        <button onClick={() => setAdding(a => !a)} style={{ padding: "8px 16px", background: T.accent, color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800, fontFamily: T.mono }}>+ Add Supplier</button>
      </div>
      {adding && (
        <Card>
          <SectionLabel>New Supplier</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Supplier name" />
            <Input value={form.platform} onChange={v => setForm(f => ({ ...f, platform: v }))} placeholder="Platform" />
            <Input value={form.product} onChange={v => setForm(f => ({ ...f, product: v }))} placeholder="Product" />
            <Input value={form.moq} onChange={v => setForm(f => ({ ...f, moq: v }))} placeholder="MOQ (units)" />
            <Input value={form.pricePerUnit} onChange={v => setForm(f => ({ ...f, pricePerUnit: v }))} placeholder="Price/unit ($)" />
            <Input value={form.leadTime} onChange={v => setForm(f => ({ ...f, leadTime: v }))} placeholder="Lead time (days)" />
          </div>
          <Input value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Notes" style={{ marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleAdd} style={{ padding: "8px 20px", background: T.green, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: T.mono }}>Save</button>
            <button onClick={() => setAdding(false)} style={{ padding: "8px 16px", background: T.surface, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: T.mono }}>Cancel</button>
          </div>
        </Card>
      )}
      {suppliers.map(s => (
        <Card key={s.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div><div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 3 }}>{s.name}</div><div style={{ display: "flex", gap: 8 }}><Badge color={T.muted}>{s.platform}</Badge>{s.product && <Badge color="#60a5fa">{s.product}</Badge>}</div></div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={s.status} onChange={e => update(s.id, { status: e.target.value })} style={{ background: SC2[s.status] + "22", border: `1px solid ${SC2[s.status]}50`, borderRadius: 6, color: SC2[s.status], fontSize: 11, fontFamily: T.mono, fontWeight: 700, padding: "4px 8px", outline: "none", cursor: "pointer" }}>
                {SS.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <button onClick={() => remove(s.id)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
            {[["MOQ", s.moq + " units"], ["Price/Unit", "$" + s.pricePerUnit], ["Lead Time", s.leadTime + " days"]].map(([k, v]) => (
              <div key={k} style={{ background: T.surface, borderRadius: 8, padding: "8px 12px", fontFamily: T.mono }}><div style={{ fontSize: 10, color: T.sub }}>{k}</div><div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v}</div></div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}>Rating:</span>
            {[1,2,3,4,5].map(n => <span key={n} onClick={() => update(s.id, { rating: n })} style={{ cursor: "pointer", fontSize: 16, color: n <= (s.rating||3) ? T.accent : T.border }}>★</span>)}
          </div>
          {s.notes && <div style={{ fontSize: 12, color: T.sub, fontStyle: "italic", borderTop: `1px solid ${T.border}`, paddingTop: 8, marginTop: 8 }}>{s.notes}</div>}
        </Card>
      ))}
    </div>
  );
}

// ── Keyword Tab ──────────────────────────────────────────────────────────────
function KeywordTab() {
  const { data: keywords, syncing: ks, add: addK, remove: removeK } = useCollection("keywords");
  const { data: competitors, syncing: cs, add: addC, remove: removeC } = useCollection("competitors");
  const [kForm, setKForm] = useState({ keyword: "", volume: "", competition: "Medium", cpc: "", priority: "Medium", notes: "" });
  const [cForm, setCForm] = useState({ asin: "", name: "", price: "", reviews: "", rating: "", bsr: "", notes: "" });
  const [addingK, setAddingK] = useState(false);
  const [addingC, setAddingC] = useState(false);
  const handleAddK = async () => { if (!kForm.keyword) return; await addK({ ...kForm, volume: +kForm.volume, cpc: +kForm.cpc }); setKForm({ keyword: "", volume: "", competition: "Medium", cpc: "", priority: "Medium", notes: "" }); setAddingK(false); };
  const handleAddC = async () => { if (!cForm.name) return; await addC({ ...cForm, price: +cForm.price, reviews: +cForm.reviews, rating: +cForm.rating, bsr: +cForm.bsr }); setCForm({ asin: "", name: "", price: "", reviews: "", rating: "", bsr: "", notes: "" }); setAddingC(false); };
  const PC = { High: T.red, Medium: T.yellow, Low: T.green };
  const CC = { Low: T.green, Medium: T.yellow, High: T.red };
  const SF = (options) => ({ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12, fontFamily: T.mono, padding: "7px 10px", outline: "none" });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}><SectionLabel>Keywords</SectionLabel><SyncBadge syncing={ks} /></div>
          <button onClick={() => setAddingK(a => !a)} style={{ padding: "6px 14px", background: T.accent, color: "#000", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 800, fontFamily: T.mono }}>+ Add</button>
        </div>
        {addingK && (
          <Card style={{ marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <Input value={kForm.keyword} onChange={v => setKForm(f => ({ ...f, keyword: v }))} placeholder="Keyword" />
              <Input value={kForm.volume} onChange={v => setKForm(f => ({ ...f, volume: v }))} placeholder="Monthly searches" />
              <Input value={kForm.cpc} onChange={v => setKForm(f => ({ ...f, cpc: v }))} placeholder="CPC ($)" />
              <div style={{ display: "flex", gap: 8 }}>
                <select value={kForm.competition} onChange={e => setKForm(f => ({ ...f, competition: e.target.value }))} style={SF()}>{["Low","Medium","High"].map(x => <option key={x}>{x}</option>)}</select>
                <select value={kForm.priority} onChange={e => setKForm(f => ({ ...f, priority: e.target.value }))} style={SF()}>{["High","Medium","Low"].map(x => <option key={x}>{x}</option>)}</select>
              </div>
            </div>
            <Input value={kForm.notes} onChange={v => setKForm(f => ({ ...f, notes: v }))} placeholder="Notes" style={{ marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8 }}><button onClick={handleAddK} style={{ padding: "7px 18px", background: T.green, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: T.mono }}>Save</button><button onClick={() => setAddingK(false)} style={{ padding: "7px 14px", background: T.surface, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: T.mono }}>Cancel</button></div>
          </Card>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {keywords.map(k => (
            <Card key={k.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: T.mono }}>{k.keyword}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}><Badge color={PC[k.priority]}>{k.priority}</Badge><Badge color={CC[k.competition]}>{k.competition} Comp</Badge><button onClick={() => removeK(k.id)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 16 }}>×</button></div>
              </div>
              <div style={{ display: "flex", gap: 16, fontFamily: T.mono, fontSize: 12 }}>
                <span><span style={{ color: T.sub }}>Vol: </span><span style={{ color: T.text, fontWeight: 700 }}>{Number(k.volume).toLocaleString()}/mo</span></span>
                <span><span style={{ color: T.sub }}>CPC: </span><span style={{ color: T.text, fontWeight: 700 }}>${k.cpc}</span></span>
                {k.notes && <span style={{ color: T.sub, fontStyle: "italic" }}>{k.notes}</span>}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}><SectionLabel>Competitors</SectionLabel><SyncBadge syncing={cs} /></div>
          <button onClick={() => setAddingC(a => !a)} style={{ padding: "6px 14px", background: T.accent, color: "#000", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 800, fontFamily: T.mono }}>+ Add</button>
        </div>
        {addingC && (
          <Card style={{ marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <Input value={cForm.asin} onChange={v => setCForm(f => ({ ...f, asin: v }))} placeholder="ASIN" />
              <Input value={cForm.name} onChange={v => setCForm(f => ({ ...f, name: v }))} placeholder="Product name" />
              <Input value={cForm.price} onChange={v => setCForm(f => ({ ...f, price: v }))} placeholder="Price ($)" />
              <Input value={cForm.reviews} onChange={v => setCForm(f => ({ ...f, reviews: v }))} placeholder="# Reviews" />
              <Input value={cForm.rating} onChange={v => setCForm(f => ({ ...f, rating: v }))} placeholder="Rating" />
              <Input value={cForm.bsr} onChange={v => setCForm(f => ({ ...f, bsr: v }))} placeholder="BSR" />
            </div>
            <Input value={cForm.notes} onChange={v => setCForm(f => ({ ...f, notes: v }))} placeholder="Notes" style={{ marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8 }}><button onClick={handleAddC} style={{ padding: "7px 18px", background: T.green, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: T.mono }}>Save</button><button onClick={() => setAddingC(false)} style={{ padding: "7px 14px", background: T.surface, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: T.mono }}>Cancel</button></div>
          </Card>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {competitors.map(c => (
            <Card key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>{c.name}</div>{c.asin && <Badge color={T.muted}>{c.asin}</Badge>}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 20, fontWeight: 800, color: T.accent, fontFamily: T.mono }}>${c.price}</span><button onClick={() => removeC(c.id)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 16 }}>×</button></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[["Reviews", Number(c.reviews).toLocaleString()], ["Rating", "★ " + c.rating], ["BSR", "#" + Number(c.bsr).toLocaleString()]].map(([k, v]) => (
                  <div key={k} style={{ background: T.surface, borderRadius: 7, padding: "7px 10px", fontFamily: T.mono }}><div style={{ fontSize: 10, color: T.sub }}>{k}</div><div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v}</div></div>
                ))}
              </div>
              {c.notes && <div style={{ fontSize: 12, color: T.sub, fontStyle: "italic", borderTop: `1px solid ${T.border}`, paddingTop: 8, marginTop: 8 }}>{c.notes}</div>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Inventory Tab ────────────────────────────────────────────────────────────
function InventoryTab() {
  const { data: items, syncing, add, update, remove } = useCollection("inventory");
  const [form, setForm] = useState({ product: "", sku: "", stock: "", dailySales: "", leadTime: 30, reorderQty: 300, unitCost: "" });
  const [adding, setAdding] = useState(false);
  const handleAdd = async () => {
    if (!form.product) return;
    const s = { ...form, stock: +form.stock, dailySales: +form.dailySales, leadTime: +form.leadTime, reorderQty: +form.reorderQty, unitCost: +form.unitCost };
    s.status = s.stock <= s.dailySales * s.leadTime ? "Reorder Now" : s.stock <= s.dailySales * s.leadTime * 1.5 ? "Low" : "OK";
    await add(s); setForm({ product: "", sku: "", stock: "", dailySales: "", leadTime: 30, reorderQty: 300, unitCost: "" }); setAdding(false);
  };
  const updateStock = async (item, v) => { const stock = +v; const status = stock <= item.dailySales * item.leadTime ? "Reorder Now" : stock <= item.dailySales * item.leadTime * 1.5 ? "Low" : "OK"; await update(item.id, { stock, status }); };
  const STC = { OK: T.green, Low: T.yellow, "Reorder Now": T.red };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}><SectionLabel>Inventory Planner</SectionLabel><SyncBadge syncing={syncing} /></div>
        <button onClick={() => setAdding(a => !a)} style={{ padding: "7px 14px", background: T.accent, color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 800, fontFamily: T.mono }}>+ Add Product</button>
      </div>
      {adding && (
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Input value={form.product} onChange={v => setForm(f => ({ ...f, product: v }))} placeholder="Product name" />
            <Input value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} placeholder="SKU" />
            <Input value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} placeholder="Current stock" />
            <Input value={form.dailySales} onChange={v => setForm(f => ({ ...f, dailySales: v }))} placeholder="Avg daily sales" />
            <Input value={form.leadTime} onChange={v => setForm(f => ({ ...f, leadTime: v }))} placeholder="Lead time (days)" />
            <Input value={form.reorderQty} onChange={v => setForm(f => ({ ...f, reorderQty: v }))} placeholder="Reorder qty" />
            <Input value={form.unitCost} onChange={v => setForm(f => ({ ...f, unitCost: v }))} placeholder="Unit cost ($)" />
          </div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={handleAdd} style={{ padding: "7px 18px", background: T.green, color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: T.mono }}>Save</button><button onClick={() => setAdding(false)} style={{ padding: "7px 14px", background: T.surface, color: T.muted, border: `1px solid ${T.border}`, borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: T.mono }}>Cancel</button></div>
        </Card>
      )}
      {items.map(item => {
        const daysLeft = Math.floor(item.stock / (item.dailySales || 1));
        const stockPct = Math.min(100, Math.round((item.stock / (item.dailySales * 60)) * 100));
        return (
          <Card key={item.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div><div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>{item.product}</div>{item.sku && <Badge color={T.muted}>{item.sku}</Badge>}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 800, color: STC[item.status], background: STC[item.status] + "22", padding: "4px 10px", borderRadius: 6 }}>{item.status}</span>
                <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: T.mono, color: T.sub, marginBottom: 5 }}><span>Stock: {item.stock.toLocaleString()} units</span><span>{daysLeft} days left</span></div>
              <div style={{ background: T.surface, borderRadius: 999, height: 8, overflow: "hidden" }}><div style={{ width: `${stockPct}%`, height: "100%", background: STC[item.status], borderRadius: 999 }} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
              {[["Reorder Point", item.dailySales * item.leadTime + " units"], ["Lead Time", item.leadTime + " days"], ["Reorder Cost", "$" + (item.reorderQty * item.unitCost).toLocaleString()]].map(([k, v]) => (
                <div key={k} style={{ background: T.surface, borderRadius: 7, padding: "8px 10px", fontFamily: T.mono }}><div style={{ fontSize: 10, color: T.sub }}>{k}</div><div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{v}</div></div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}>Update stock:</span>
              <input type="number" defaultValue={item.stock} onBlur={e => updateStock(item, e.target.value)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontSize: 12, fontFamily: T.mono, padding: "5px 10px", outline: "none", width: 100 }} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Launch Tab ───────────────────────────────────────────────────────────────
const PHASES = [
  { phase: "Phase 1 · Pre-Launch (Weeks 1–4)", color: "#60a5fa", tasks: [
    { id: "l1", text: "Register Amazon Seller account", link: "https://sell.amazon.com" },
    { id: "l2", text: "File trademark with USPTO (~$250)", link: "https://uspto.gov" },
    { id: "l3", text: "Place bulk order with supplier" },
    { id: "l4", text: "Design logo, packaging & inserts" },
    { id: "l5", text: "Purchase UPC barcode" },
    { id: "l6", text: "Book product photography (7+ photos)" },
    { id: "l7", text: "Set up LLC or business entity" },
    { id: "l8", text: "Open dedicated business bank account" },
  ]},
  { phase: "Phase 2 · Listing Setup (Weeks 5–8)", color: "#a78bfa", tasks: [
    { id: "l9", text: "Create product listing in Seller Central" },
    { id: "l10", text: "Write keyword-optimized title, bullets & description" },
    { id: "l11", text: "Upload all product photos" },
    { id: "l12", text: "Set competitive pricing based on P&L model" },
    { id: "l13", text: "Create FBA shipment plan" },
    { id: "l14", text: "Label all units with FNSKU barcodes" },
    { id: "l15", text: "Ship inventory to Amazon fulfillment center" },
  ]},
  { phase: "Phase 3 · Launch (Weeks 9–12)", color: T.accent, tasks: [
    { id: "l16", text: "Activate listing once inventory is received" },
    { id: "l17", text: "Launch Automatic PPC Campaign ($20–30/day)" },
    { id: "l18", text: "Launch Manual PPC Campaign" },
    { id: "l19", text: "Send product to friends/family for honest reviews" },
    { id: "l20", text: "Enroll in Amazon Vine (if Brand Registered)" },
    { id: "l21", text: "Monitor ACoS daily, adjust bids weekly" },
  ]},
  { phase: "Phase 4 · Scale (Month 3+)", color: T.green, tasks: [
    { id: "l22", text: "Apply for Amazon Brand Registry" },
    { id: "l23", text: "Create A+ Content and Amazon Storefront" },
    { id: "l24", text: "Analyze Search Term Report — add negatives" },
    { id: "l25", text: "Place reorder based on inventory planner" },
    { id: "l26", text: "Expand to new variations or products" },
    { id: "l27", text: "Set up external traffic (TikTok, Meta)" },
  ]},
];

function LaunchTab() {
  const { data, syncing, save } = useDocument("launch/main", { checked: {} });
  const checked = data.checked || {};
  const toggle = (id) => save({ ...data, checked: { ...checked, [id]: !checked[id] } });
  const total = PHASES.reduce((a, p) => a + p.tasks.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}><SectionLabel>Launch Progress</SectionLabel><SyncBadge syncing={syncing} /></div>
          <span style={{ fontFamily: T.mono, fontWeight: 800, fontSize: 16, color: T.accent }}>{done}/{total} · {pct}%</span>
        </div>
        <div style={{ background: T.surface, borderRadius: 999, height: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, #3b82f6, ${T.accent}, ${T.green})`, borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>
      </Card>
      {PHASES.map(({ phase, color, tasks }) => {
        const pd = tasks.filter(t => checked[t.id]).length;
        return (
          <div key={phase}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: T.mono }}>{phase}</div>
              <Badge color={color}>{pd}/{tasks.length}</Badge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tasks.map(t => (
                <div key={t.id} onClick={() => toggle(t.id)} style={{ background: checked[t.id] ? "#052e16" : T.surface, border: `1px solid ${checked[t.id] ? T.green + "40" : T.border}`, borderRadius: 8, padding: "11px 14px", cursor: "pointer", transition: "all 0.15s", display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked[t.id] ? T.green : "#334155"}`, background: checked[t.id] ? T.green : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{checked[t.id] ? "✓" : ""}</div>
                  <span style={{ fontSize: 13, color: checked[t.id] ? T.muted : T.text, textDecoration: checked[t.id] ? "line-through" : "none", flex: 1 }}>{t.text}</span>
                  {t.link && <a href={t.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11, color, fontFamily: T.mono, textDecoration: "none", flexShrink: 0 }}>↗ Open</a>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "research", icon: "🔍", label: "Research" },
  { id: "pl", icon: "📊", label: "P&L" },
  { id: "supplier", icon: "🏭", label: "Suppliers" },
  { id: "keyword", icon: "🔑", label: "Keywords" },
  { id: "inventory", icon: "📦", label: "Inventory" },
  { id: "launch", icon: "🚀", label: "Launch" },
];

export default function App() {
  const [tab, setTab] = useState("research");
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.sans }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "16px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>FBA Command Center</div>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}>Live sync · 2 users</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green }} />
            <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}>Firebase connected</span>
          </div>
        </div>
      </div>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 2, padding: "0 12px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: T.mono, whiteSpace: "nowrap", color: tab === t.id ? T.accent : T.muted, borderBottom: `2px solid ${tab === t.id ? T.accent : "transparent"}`, transition: "all 0.15s" }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 60px" }}>
        {tab === "research" && <ResearchTab />}
        {tab === "pl" && <PLTab />}
        {tab === "supplier" && <SupplierTab />}
        {tab === "keyword" && <KeywordTab />}
        {tab === "inventory" && <InventoryTab />}
        {tab === "launch" && <LaunchTab />}
      </div>
    </div>
  );
}
