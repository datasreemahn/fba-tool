import { useState, useCallback } from "react";

const MODELS = {
  private_label: { name: "Private Label", margin: [0.20, 0.40], timeline: "3–6 months", budget: "$5K–$15K" },
  wholesale: { name: "Wholesale", margin: [0.10, 0.20], timeline: "1–3 months", budget: "$2K–$10K" },
  arbitrage: { name: "Retail Arbitrage", margin: [0.10, 0.30], timeline: "1–4 weeks", budget: "$500–$3K" },
};

const CRITERIA = [
  { id: "price", label: "Selling price $15–$70", tip: "Sweet spot: not too cheap to make margin, not too expensive for impulse buys.", weight: 2 },
  { id: "bsr", label: "BSR under 100,000 in main category", tip: "Best Seller Rank under 100K means consistent demand.", weight: 2 },
  { id: "reviews", label: "Top competitors have < 500 reviews", tip: "Lower review counts mean you can compete faster.", weight: 2 },
  { id: "competitors", label: "3–15 FBA sellers on the listing", tip: "Proves healthy demand without being a bloodbath.", weight: 1 },
  { id: "size", label: "Small & lightweight (fits in a shoebox)", tip: "Lower FBA fulfillment fees = better margins.", weight: 2 },
  { id: "seasonal", label: "Sells year-round (not seasonal)", tip: "Avoid holiday-only products — you need steady cash flow.", weight: 1 },
  { id: "differentiate", label: "Can be improved or differentiated", tip: "Read 1-3 star reviews. Can you solve complaints competitively?", weight: 2 },
  { id: "cogs", label: "COGS is < 25% of selling price", tip: "This leaves room for fees (~30%) + ads (~15%) + profit.", weight: 2 },
  { id: "brand", label: "Not dominated by big brands (Nike, etc.)", tip: "You can't win a listing dominated by established brands.", weight: 2 },
  { id: "ip", label: "No IP / patent / trademark issues", tip: "Search USPTO and Google before sourcing. One IP strike can suspend your account.", weight: 2 },
  { id: "keyword", label: "Primary keyword gets 10K+ monthly searches", tip: "Use Helium 10 or Jungle Scout to verify demand via keywords.", weight: 1 },
  { id: "fragile", label: "Not fragile / hazmat / restricted", tip: "Avoid glass, liquids, electronics with batteries, and FDA-regulated items as a beginner.", weight: 1 },
];

const formatCurrency = (v) => "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function FBATool() {
  const [tab, setTab] = useState("research");
  const [checked, setChecked] = useState({});
  const [model, setModel] = useState("private_label");

  // P&L state
  const [pl, setPl] = useState({
    sellingPrice: 35,
    unitCost: 6,
    shippingPerUnit: 1.5,
    unitsOrdered: 400,
    referralPct: 15,
    fulfillmentFee: 4.5,
    ppcBudget: 800,
    photography: 400,
    branding: 300,
    upc: 30,
    misc: 200,
  });

  const toggle = useCallback((id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const score = CRITERIA.reduce((acc, c) => acc + (checked[c.id] ? c.weight : 0), 0);
  const maxScore = CRITERIA.reduce((acc, c) => acc + c.weight, 0);
  const pct = Math.round((score / maxScore) * 100);

  const verdict =
    pct >= 80 ? { label: "Strong Product", color: "#22c55e", bg: "#052e16" }
    : pct >= 55 ? { label: "Needs More Vetting", color: "#f59e0b", bg: "#292100" }
    : { label: "Too Risky", color: "#ef4444", bg: "#2d0a0a" };

  // P&L calculations
  const set = (k, v) => setPl((p) => ({ ...p, [k]: v }));
  const revenue = pl.sellingPrice * pl.unitsOrdered;
  const referral = (pl.referralPct / 100) * pl.sellingPrice * pl.unitsOrdered;
  const fulfillment = pl.fulfillmentFee * pl.unitsOrdered;
  const cogs = pl.unitCost * pl.unitsOrdered;
  const shipping = pl.shippingPerUnit * pl.unitsOrdered;
  const launchCosts = Number(pl.ppcBudget) + Number(pl.photography) + Number(pl.branding) + Number(pl.upc) + Number(pl.misc);
  const totalCosts = referral + fulfillment + cogs + shipping + launchCosts;
  const profit = revenue - totalCosts;
  const roi = cogs + shipping > 0 ? ((profit / (cogs + shipping + launchCosts)) * 100).toFixed(1) : 0;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;
  const breakEven = Math.ceil(totalCosts / pl.sellingPrice);
  const totalInvestment = cogs + shipping + launchCosts;

  const Num = ({ k, label, prefix = "$", step = 1, min = 0 }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
        <span style={{ padding: "0 10px", color: "#475569", fontSize: 13, fontFamily: "monospace" }}>{prefix}</span>
        <input
          type="number"
          value={pl[k]}
          min={min}
          step={step}
          onChange={(e) => set(k, parseFloat(e.target.value) || 0)}
          style={{ background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: 14, fontFamily: "monospace", padding: "8px 10px 8px 0", width: "100%", fontWeight: 600 }}
        />
      </div>
    </div>
  );

  const Stat = ({ label, value, accent, sub }) => (
    <div style={{ background: "#0f172a", border: `1px solid ${accent || "#1e293b"}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent || "#f1f5f9", fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 2, fontFamily: "monospace" }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#020817", color: "#f1f5f9", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ maxWidth: 720, margin: "0 auto 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, background: "#FF9900", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📦</div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#f8fafc" }}>Amazon FBA Toolkit</h1>
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13, fontFamily: "monospace" }}>Budget: $3K–$5K · Model selector included</p>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 720, margin: "0 auto 24px", display: "flex", gap: 8 }}>
        {[["research", "🔍 Product Research"], ["pl", "📊 P&L Model"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
            background: tab === id ? "#FF9900" : "#0f172a",
            color: tab === id ? "#000" : "#64748b",
            transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* ── RESEARCH TAB ── */}
        {tab === "research" && (
          <div>
            {/* Model Selector */}
            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 12 }}>Business Model</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(MODELS).map(([k, m]) => (
                  <button key={k} onClick={() => setModel(k)} style={{
                    padding: "8px 16px", borderRadius: 8, border: `1px solid ${model === k ? "#FF9900" : "#1e293b"}`,
                    background: model === k ? "#1a0f00" : "#0f172a", color: model === k ? "#FF9900" : "#64748b",
                    cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "monospace", transition: "all 0.15s",
                  }}>{m.name}</button>
                ))}
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[["Margin", `${(MODELS[model].margin[0]*100).toFixed(0)}–${(MODELS[model].margin[1]*100).toFixed(0)}%`],
                  ["Timeline", MODELS[model].timeline],
                  ["Budget", MODELS[model].budget]].map(([k, v]) => (
                  <div key={k} style={{ fontFamily: "monospace" }}>
                    <span style={{ color: "#475569", fontSize: 11 }}>{k}: </span>
                    <span style={{ color: "#FF9900", fontSize: 12, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Bar */}
            <div style={{ background: "#0a0f1e", border: `1px solid ${verdict.color}40`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Product Score</span>
                <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 18, color: verdict.color }}>{pct}% · {verdict.label}</span>
              </div>
              <div style={{ background: "#0f172a", borderRadius: 999, height: 10, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: verdict.color, borderRadius: 999, transition: "width 0.4s cubic-bezier(.4,0,.2,1)" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#475569", fontFamily: "monospace" }}>
                {score}/{maxScore} points · Check more boxes to improve your score
              </div>
            </div>

            {/* Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CRITERIA.map((c) => (
                <div key={c.id} onClick={() => toggle(c.id)} style={{
                  background: checked[c.id] ? "#052e16" : "#0a0f1e",
                  border: `1px solid ${checked[c.id] ? "#22c55e40" : "#1e293b"}`,
                  borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                  transition: "all 0.15s", display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked[c.id] ? "#22c55e" : "#334155"}`,
                    background: checked[c.id] ? "#22c55e" : "transparent", flexShrink: 0, marginTop: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, transition: "all 0.15s",
                  }}>{checked[c.id] ? "✓" : ""}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: checked[c.id] ? "#f1f5f9" : "#94a3b8", marginBottom: 3 }}>
                      {c.label}
                      <span style={{ marginLeft: 8, fontSize: 10, background: "#1e293b", color: "#475569", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>+{c.weight}pt</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>{c.tip}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: 14, background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12, color: "#475569", fontFamily: "monospace", lineHeight: 1.6 }}>
              💡 <strong style={{ color: "#64748b" }}>Rule of thumb:</strong> Don't launch any product scoring below 55%. Strong products (80%+) are worth pursuing with confidence given your $3K–$5K budget.
            </div>
          </div>
        )}

        {/* ── P&L TAB ── */}
        {tab === "pl" && (
          <div>
            {/* Key Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <Stat label="Net Profit" value={formatCurrency(profit)} accent={profit >= 0 ? "#22c55e" : "#ef4444"} sub={`on ${pl.unitsOrdered} units`} />
              <Stat label="Profit Margin" value={`${margin}%`} accent={margin >= 20 ? "#22c55e" : margin >= 10 ? "#f59e0b" : "#ef4444"} sub="of revenue" />
              <Stat label="Total Investment" value={formatCurrency(totalInvestment)} accent="#FF9900" sub="incl. inventory + launch" />
              <Stat label="ROI" value={`${roi}%`} accent={roi >= 30 ? "#22c55e" : roi >= 15 ? "#f59e0b" : "#ef4444"} sub="return on investment" />
            </div>

            {/* Break-even */}
            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, padding: 16, marginBottom: 20, fontFamily: "monospace" }}>
              <span style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Break-even: </span>
              <span style={{ color: "#f59e0b", fontWeight: 800, fontSize: 16 }}>{breakEven} units</span>
              <span style={{ color: "#475569", fontSize: 12 }}> of {pl.unitsOrdered} ordered ({Math.round((breakEven/pl.unitsOrdered)*100)}%)</span>
            </div>

            {/* Inputs */}
            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 16 }}>Product & Inventory</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Num k="sellingPrice" label="Selling Price" />
                <Num k="unitCost" label="Unit Cost (COGS)" />
                <Num k="shippingPerUnit" label="Shipping / Unit" step={0.1} />
                <Num k="unitsOrdered" label="Units Ordered" prefix="#" step={50} />
              </div>
            </div>

            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 16 }}>Amazon Fees</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Num k="referralPct" label="Referral Fee %" prefix="%" step={1} />
                <Num k="fulfillmentFee" label="FBA Fulfillment / Unit" step={0.1} />
              </div>
            </div>

            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 16 }}>Launch Costs (One-Time)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Num k="ppcBudget" label="PPC Ad Budget" />
                <Num k="photography" label="Product Photos" />
                <Num k="branding" label="Logo / Packaging" />
                <Num k="upc" label="UPC / FNSKU" />
                <Num k="misc" label="Misc / Buffer" />
              </div>
            </div>

            {/* Cost Breakdown */}
            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace", marginBottom: 16 }}>Cost Breakdown</div>
              {[
                ["Revenue", revenue, "#22c55e"],
                ["COGS (inventory)", -cogs, "#ef4444"],
                ["Inbound Shipping", -shipping, "#ef4444"],
                ["Amazon Referral Fee", -referral, "#f59e0b"],
                ["FBA Fulfillment Fees", -fulfillment, "#f59e0b"],
                ["Launch Costs (one-time)", -launchCosts, "#f59e0b"],
                ["NET PROFIT", profit, profit >= 0 ? "#22c55e" : "#ef4444"],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: label === "NET PROFIT" ? "none" : "1px solid #0f172a", fontFamily: "monospace", fontSize: 13 }}>
                  <span style={{ color: label === "NET PROFIT" ? "#f1f5f9" : "#64748b", fontWeight: label === "NET PROFIT" ? 800 : 400 }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{val >= 0 ? "+" : ""}{formatCurrency(val)}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, padding: 14, background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12, color: "#475569", fontFamily: "monospace", lineHeight: 1.7 }}>
              💡 <strong style={{ color: "#64748b" }}>Target benchmarks:</strong> Margin &gt; 20% · ROI &gt; 30% · COGS &lt; 25% of selling price · Leave 10–15% buffer for storage + returns
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
