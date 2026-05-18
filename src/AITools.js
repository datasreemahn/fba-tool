import { useState } from "react";

const T = {
  bg: "#020817", surface: "#0a0f1e", card: "#0f172a",
  border: "#1e293b", accent: "#FF9900", text: "#f1f5f9",
  muted: "#64748b", sub: "#475569",
  green: "#22c55e", red: "#ef4444", yellow: "#f59e0b",
  blue: "#60a5fa", purple: "#a78bfa",
  mono: "'IBM Plex Mono', monospace",
  sans: "'IBM Plex Sans', 'Segoe UI', sans-serif",
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, ...style }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: T.mono, marginBottom: 12 }}>{children}</div>
);

const Input = ({ value, onChange, placeholder, style = {} }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, fontFamily: T.mono, padding: "10px 14px", outline: "none", width: "100%", boxSizing: "border-box", ...style }} />
);

const Textarea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, fontFamily: T.mono, padding: "10px 14px", outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: 1.6 }} />
);

const RunButton = ({ onClick, loading, label = "Analyze with AI", color = T.accent }) => (
  <button onClick={onClick} disabled={loading} style={{
    padding: "12px 24px", background: loading ? T.surface : color, color: loading ? T.muted : "#000",
    border: `1px solid ${loading ? T.border : color}`, borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
    fontSize: 13, fontWeight: 800, fontFamily: T.mono, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
  }}>
    {loading ? (
      <>
        <div style={{ width: 14, height: 14, border: `2px solid ${T.border}`, borderTop: `2px solid ${color}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        AI is thinking...
      </>
    ) : `✦ ${label}`}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </button>
);

const Badge = ({ children, color = T.accent }) => (
  <span style={{ fontSize: 11, fontFamily: T.mono, background: color + "22", color, padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>{children}</span>
);

// ── Anthropic API call ───────────────────────────────────────────────────────
async function callClaude(systemPrompt, userPrompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
 },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

// ═══════════════════════════════════════════════════════════════════════════
// AI TOOL 1 — PRODUCT IDEA ANALYZER
// ═══════════════════════════════════════════════════════════════════════════
function ProductAnalyzer() {
  const [idea, setIdea] = useState("");
  const [budget, setBudget] = useState("$3,000–$5,000");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!idea.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const system = `You are an expert Amazon FBA product research analyst with 10+ years of experience. 
Analyze product ideas and return ONLY a JSON object (no markdown, no backticks, no explanation).
The JSON must have exactly these fields:
{
  "score": <number 0-100>,
  "verdict": <"Strong Opportunity" | "Moderate Potential" | "High Risk">,
  "estimatedMonthlyRevenue": <string like "$8,000–$15,000">,
  "estimatedMargin": <string like "22–30%">,
  "competitionLevel": <"Low" | "Medium" | "High">,
  "demandLevel": <"Low" | "Medium" | "High">,
  "pros": [<3-5 short strings>],
  "cons": [<3-5 short strings>],
  "suggestedSellingPrice": <string like "$24.99–$34.99">,
  "estimatedCOGS": <string like "$5–$8">,
  "keyOpportunity": <one sentence>,
  "biggestRisk": <one sentence>,
  "recommendation": <2-3 sentence actionable advice>
}`;
      const raw = await callClaude(system, `Product idea: "${idea}"\nBudget: ${budget}\nAnalyze this for Amazon FBA viability.`);
      const clean = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) {
      setError("Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const scoreColor = result ? (result.score >= 70 ? T.green : result.score >= 45 ? T.yellow : T.red) : T.accent;
  const verdictColor = result?.verdict === "Strong Opportunity" ? T.green : result?.verdict === "Moderate Potential" ? T.yellow : T.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, background: T.accent + "22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Product Idea Analyzer</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: T.mono }}>AI scores your idea against 12 FBA criteria</div>
          </div>
        </div>
        <SectionLabel>Your Product Idea</SectionLabel>
        <Input value={idea} onChange={setIdea} placeholder="e.g. bamboo toothbrush holder, silicone baking mat, portable phone stand..." style={{ marginBottom: 12 }} />
        <SectionLabel>Your Budget</SectionLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {["Under $3,000", "$3,000–$5,000", "$5,000–$10,000", "$10,000+"].map(b => (
            <button key={b} onClick={() => setBudget(b)} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${budget === b ? T.accent : T.border}`, background: budget === b ? T.accent + "18" : T.surface, color: budget === b ? T.accent : T.muted, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: T.mono }}>{b}</button>
          ))}
        </div>
        <RunButton onClick={analyze} loading={loading} label="Analyze Product Idea" />
        {error && <div style={{ marginTop: 12, fontSize: 12, color: T.red, fontFamily: T.mono }}>{error}</div>}
      </Card>

      {result && (
        <>
          {/* Score card */}
          <Card style={{ border: `1px solid ${scoreColor}40` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: T.muted, fontFamily: T.mono, marginBottom: 4 }}>FBA Viability Score</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: scoreColor, fontFamily: T.mono, lineHeight: 1 }}>{result.score}</div>
                <div style={{ fontSize: 12, color: T.sub, fontFamily: T.mono }}>out of 100</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: verdictColor, marginBottom: 8 }}>{result.verdict}</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <Badge color={result.competitionLevel === "Low" ? T.green : result.competitionLevel === "Medium" ? T.yellow : T.red}>{result.competitionLevel} Competition</Badge>
                  <Badge color={result.demandLevel === "High" ? T.green : result.demandLevel === "Medium" ? T.yellow : T.red}>{result.demandLevel} Demand</Badge>
                </div>
              </div>
            </div>
            <div style={{ background: T.surface, borderRadius: 999, height: 10, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ width: `${result.score}%`, height: "100%", background: scoreColor, borderRadius: 999, transition: "width 1s ease" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[["Est. Monthly Revenue", result.estimatedMonthlyRevenue, T.green], ["Suggested Price", result.suggestedSellingPrice, T.accent], ["Est. COGS", result.estimatedCOGS, T.yellow]].map(([k, v, c]) => (
                <div key={k} style={{ background: T.bg, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: T.sub, fontFamily: T.mono, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: T.mono }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pros & Cons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card>
              <SectionLabel>Pros ✓</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.pros.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: T.green, fontSize: 14, flexShrink: 0, marginTop: 1 }}>+</span>
                    <span style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SectionLabel>Cons ✗</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.cons.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: T.red, fontSize: 14, flexShrink: 0, marginTop: 1 }}>−</span>
                    <span style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <SectionLabel>Key Insights</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: T.green + "12", border: `1px solid ${T.green}30`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: T.green, fontFamily: T.mono, fontWeight: 700, marginBottom: 4 }}>KEY OPPORTUNITY</div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{result.keyOpportunity}</div>
              </div>
              <div style={{ background: T.red + "12", border: `1px solid ${T.red}30`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: T.red, fontFamily: T.mono, fontWeight: 700, marginBottom: 4 }}>BIGGEST RISK</div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{result.biggestRisk}</div>
              </div>
              <div style={{ background: T.accent + "12", border: `1px solid ${T.accent}30`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: T.accent, fontFamily: T.mono, fontWeight: 700, marginBottom: 4 }}>AI RECOMMENDATION</div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{result.recommendation}</div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI TOOL 2 — AMAZON LISTING GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
function ListingGenerator() {
  const [form, setForm] = useState({ product: "", category: "", features: "", targetCustomer: "", competitors: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.product.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const system = `You are an expert Amazon listing copywriter who specializes in SEO-optimized product listings that convert. 
Return ONLY a JSON object (no markdown, no backticks, no explanation) with exactly these fields:
{
  "title": <string, 150-200 chars, keyword-rich Amazon title>,
  "bullets": [<exactly 5 strings, each 150-200 chars, benefit-focused bullet points starting with ALL CAPS keyword phrase>],
  "description": <string, 200-300 words, engaging product description>,
  "backendKeywords": <string, comma-separated keywords not used in title/bullets, under 250 bytes>,
  "searchTerms": [<5-7 high-value search terms customers would use>],
  "pricingInsight": <one sentence about pricing strategy>
}`;
      const prompt = `Product: ${form.product}
Category: ${form.category || "General"}
Key features: ${form.features || "Not specified"}
Target customer: ${form.targetCustomer || "General consumer"}
Competitors: ${form.competitors || "Not specified"}
Price point: ${form.price || "Not specified"}

Generate a complete, conversion-optimized Amazon listing.`;
      const raw = await callClaude(system, prompt);
      const clean = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) {
      setError("Generation failed. Please try again.");
    }
    setLoading(false);
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const CopyBtn = ({ text, id }) => (
    <button onClick={() => copy(text, id)} style={{ padding: "4px 10px", background: copied === id ? T.green + "22" : T.surface, border: `1px solid ${copied === id ? T.green : T.border}`, borderRadius: 6, color: copied === id ? T.green : T.muted, cursor: "pointer", fontSize: 11, fontFamily: T.mono, transition: "all 0.2s" }}>
      {copied === id ? "✓ Copied" : "Copy"}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, background: T.blue + "22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📝</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Amazon Listing Generator</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: T.mono }}>AI writes your full listing — title, bullets, description & keywords</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <SectionLabel>Product Name *</SectionLabel>
            <Input value={form.product} onChange={v => set("product", v)} placeholder="e.g. Bamboo Cutting Board" />
          </div>
          <div>
            <SectionLabel>Amazon Category</SectionLabel>
            <Input value={form.category} onChange={v => set("category", v)} placeholder="e.g. Kitchen & Dining" />
          </div>
          <div>
            <SectionLabel>Price Point</SectionLabel>
            <Input value={form.price} onChange={v => set("price", v)} placeholder="e.g. $29.99" />
          </div>
          <div>
            <SectionLabel>Target Customer</SectionLabel>
            <Input value={form.targetCustomer} onChange={v => set("targetCustomer", v)} placeholder="e.g. Home cooks, meal preppers" />
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <SectionLabel>Key Features / USPs</SectionLabel>
          <Textarea value={form.features} onChange={v => set("features", v)} placeholder="e.g. extra thick, juice groove, non-slip feet, eco-friendly bamboo, comes with care guide" rows={3} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Main Competitors (optional)</SectionLabel>
          <Input value={form.competitors} onChange={v => set("competitors", v)} placeholder="e.g. OXO, Teakhaus, John Boos" />
        </div>
        <RunButton onClick={generate} loading={loading} label="Generate Full Listing" color={T.blue} />
        {error && <div style={{ marginTop: 12, fontSize: 12, color: T.red, fontFamily: T.mono }}>{error}</div>}
      </Card>

      {result && (
        <>
          {/* Title */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <SectionLabel>Product Title</SectionLabel>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: result.title.length > 200 ? T.red : T.green, fontFamily: T.mono }}>{result.title.length} chars</span>
                <CopyBtn text={result.title} id="title" />
              </div>
            </div>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6, background: T.surface, borderRadius: 8, padding: "12px 14px", fontWeight: 600 }}>{result.title}</div>
          </Card>

          {/* Bullets */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <SectionLabel>5 Bullet Points</SectionLabel>
              <CopyBtn text={result.bullets.map((b, i) => `• ${b}`).join("\n\n")} id="bullets" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {result.bullets.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: T.surface, borderRadius: 8, padding: "10px 14px" }}>
                  <span style={{ color: T.blue, fontFamily: T.mono, fontWeight: 800, fontSize: 12, flexShrink: 0, marginTop: 2 }}>0{i + 1}</span>
                  <span style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{b}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Description */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <SectionLabel>Product Description</SectionLabel>
              <CopyBtn text={result.description} id="desc" />
            </div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8, background: T.surface, borderRadius: 8, padding: "12px 14px" }}>{result.description}</div>
          </Card>

          {/* Keywords */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <SectionLabel>Backend Keywords</SectionLabel>
                <CopyBtn text={result.backendKeywords} id="backend" />
              </div>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.7, fontFamily: T.mono, background: T.surface, borderRadius: 8, padding: "10px 12px" }}>{result.backendKeywords}</div>
            </Card>
            <Card>
              <SectionLabel>Top Search Terms</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {result.searchTerms.map((t, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface, borderRadius: 6, padding: "7px 10px" }}>
                    <span style={{ fontSize: 12, color: T.text, fontFamily: T.mono }}>{t}</span>
                    <button onClick={() => copy(t, `term-${i}`)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 11, fontFamily: T.mono }}>{copied === `term-${i}` ? "✓" : "copy"}</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Pricing insight */}
          <Card style={{ border: `1px solid ${T.accent}30`, background: T.accent + "08" }}>
            <div style={{ fontSize: 11, color: T.accent, fontFamily: T.mono, fontWeight: 700, marginBottom: 6 }}>💡 PRICING INSIGHT</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{result.pricingInsight}</div>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI TOOL 3 — KEYWORD RESEARCH
// ═══════════════════════════════════════════════════════════════════════════
function KeywordResearch() {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const research = async () => {
    if (!product.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const system = `You are an expert Amazon keyword research specialist. 
Return ONLY a JSON object (no markdown, no backticks, no explanation) with exactly this structure:
{
  "primaryKeyword": <string, the single best main keyword>,
  "keywords": [
    {
      "keyword": <string>,
      "estimatedMonthlyVolume": <string like "12,000–18,000">,
      "competition": <"Low" | "Medium" | "High">,
      "intent": <"Buyer" | "Researcher" | "Browser">,
      "priority": <"Primary" | "Secondary" | "Long-tail">,
      "suggestedBid": <string like "$0.80–$1.20">,
      "tip": <short string, one actionable tip for this keyword>
    }
  ],
  "negativeKeywords": [<5-8 strings to exclude from PPC>],
  "ppcStrategy": <2-3 sentence PPC launch strategy>,
  "totalKeywords": <number>
}
Include exactly 20 keywords covering primary, secondary, and long-tail variations.`;
      const raw = await callClaude(system, `Product: ${product}\nCategory: ${category || "General"}\n\nResearch 20 Amazon keywords for this product, covering all intent types and competition levels.`);
      const clean = raw.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) {
      setError("Research failed. Please try again.");
    }
    setLoading(false);
  };

  const COMP_C = { Low: T.green, Medium: T.yellow, High: T.red };
  const INTENT_C = { Buyer: T.green, Researcher: T.blue, Browser: T.muted };
  const PRIO_C = { Primary: T.accent, Secondary: T.blue, "Long-tail": T.purple };

  const filtered = result?.keywords?.filter(k => filter === "All" || k.priority === filter) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, background: T.purple + "22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔍</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>AI Keyword Research</div>
            <div style={{ fontSize: 12, color: T.muted, fontFamily: T.mono }}>20 ranked keywords with volume, competition & PPC bids</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <SectionLabel>Your Product *</SectionLabel>
            <Input value={product} onChange={setProduct} placeholder="e.g. bamboo cutting board" />
          </div>
          <div>
            <SectionLabel>Category (optional)</SectionLabel>
            <Input value={category} onChange={setCategory} placeholder="e.g. Kitchen & Dining" />
          </div>
        </div>
        <RunButton onClick={research} loading={loading} label="Research Keywords" color={T.purple} />
        {error && <div style={{ marginTop: 12, fontSize: 12, color: T.red, fontFamily: T.mono }}>{error}</div>}
      </Card>

      {result && (
        <>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              ["Primary Keyword", result.primaryKeyword, T.accent],
              ["Total Keywords", result.totalKeywords + " found", T.blue],
              ["Buyer Intent", result.keywords.filter(k => k.intent === "Buyer").length + " keywords", T.green],
            ].map(([label, value, color]) => (
              <div key={label} style={{ background: T.card, border: `1px solid ${color}30`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.mono, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color, fontFamily: T.mono }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["All", "Primary", "Secondary", "Long-tail"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 7, border: `1px solid ${filter === f ? T.accent : T.border}`, background: filter === f ? T.accent + "18" : T.surface, color: filter === f ? T.accent : T.muted, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: T.mono }}>
                {f} {f === "All" ? `(${result.keywords.length})` : `(${result.keywords.filter(k => k.priority === f).length})`}
              </button>
            ))}
          </div>

          {/* Keywords table */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 90px", gap: 8 }}>
              {["Keyword", "Est. Volume/mo", "Comp.", "Intent", "Priority", "PPC Bid"].map(h => (
                <div key={h} style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: T.mono }}>{h}</div>
              ))}
            </div>
            {filtered.map((k, i) => (
              <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 90px", gap: 8, alignItems: "center", background: i % 2 === 0 ? "transparent" : T.surface + "50" }}>
                <div>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 600, fontFamily: T.mono, marginBottom: 2 }}>{k.keyword}</div>
                  <div style={{ fontSize: 11, color: T.sub }}>{k.tip}</div>
                </div>
                <div style={{ fontSize: 12, color: T.text, fontFamily: T.mono, fontWeight: 700 }}>{k.estimatedMonthlyVolume}</div>
                <div><Badge color={COMP_C[k.competition]}>{k.competition}</Badge></div>
                <div><Badge color={INTENT_C[k.intent]}>{k.intent}</Badge></div>
                <div><Badge color={PRIO_C[k.priority]}>{k.priority}</Badge></div>
                <div style={{ fontSize: 12, color: T.yellow, fontFamily: T.mono, fontWeight: 700 }}>{k.suggestedBid}</div>
              </div>
            ))}
          </Card>

          {/* Negative keywords */}
          <Card>
            <SectionLabel>Negative Keywords (Add to PPC to save ad spend)</SectionLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {result.negativeKeywords.map((k, i) => (
                <span key={i} style={{ fontSize: 12, fontFamily: T.mono, background: T.red + "15", color: T.red, padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.red}30` }}>−{k}</span>
              ))}
            </div>
          </Card>

          {/* PPC Strategy */}
          <Card style={{ border: `1px solid ${T.purple}30`, background: T.purple + "08" }}>
            <div style={{ fontSize: 11, color: T.purple, fontFamily: T.mono, fontWeight: 700, marginBottom: 8 }}>🎯 PPC LAUNCH STRATEGY</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>{result.ppcStrategy}</div>
          </Card>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — AI TOOLS TAB CONTAINER
// ═══════════════════════════════════════════════════════════════════════════
const AI_TOOLS = [
  { id: "analyzer", icon: "🧠", label: "Product Analyzer", component: ProductAnalyzer },
  { id: "listing", icon: "📝", label: "Listing Generator", component: ListingGenerator },
  { id: "keywords", icon: "🔍", label: "Keyword Research", component: KeywordResearch },
];

export default function AITools() {
  const [activeTool, setActiveTool] = useState("analyzer");
  const ActiveComponent = AI_TOOLS.find(t => t.id === activeTool)?.component;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* AI tools sub-nav */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 6, display: "flex", gap: 4 }}>
        {AI_TOOLS.map(t => (
          <button key={t.id} onClick={() => setActiveTool(t.id)} style={{
            flex: 1, padding: "10px 8px", borderRadius: 8, border: "none",
            background: activeTool === t.id ? T.accent + "18" : "transparent",
            color: activeTool === t.id ? T.accent : T.muted,
            cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: T.mono,
            borderBottom: `2px solid ${activeTool === t.id ? T.accent : "transparent"}`,
            transition: "all 0.15s",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Active tool */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  );
}
