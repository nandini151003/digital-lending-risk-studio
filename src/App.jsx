import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  Landmark,
  Layers3,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import MetricCard from "./components/MetricCard.jsx";
import { BarList, DonutChart, Heatmap, RollMatrix, TrendChart } from "./components/Charts.jsx";
import {
  alerts,
  approvalByRisk,
  dpdMix,
  governanceChecks,
  monthlyTrend,
  partners,
  portfolioMetrics,
  reportDate,
  riskDistribution,
  rollRate,
  segmentSummary,
  utilizationBands,
  vintageMatrix,
} from "./data/portfolio.js";

const tabs = [
  { id: "overview", label: "Portfolio", icon: BarChart3 },
  { id: "bureau", label: "Bureau risk", icon: Gauge },
  { id: "vintage", label: "Vintage & roll", icon: TrendingUp },
  { id: "alerts", label: "Action queue", icon: BellRing },
];

const formatLakh = (value) => `INR ${value.toFixed(1)} L`;
const maskAccount = (id) => `${id.slice(0, 3)}••••${id.slice(-2)}`;

function PanelHeader({ eyebrow, title, detail, action }) {
  return (
    <div className="panel-header">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {detail ? <p>{detail}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Insight({ label, children, tone = "amber", icon: Icon = Sparkles }) {
  return (
    <aside className={`insight insight--${tone}`}>
      <Icon size={19} aria-hidden="true" />
      <div><strong>{label}</strong><p>{children}</p></div>
    </aside>
  );
}

function Overview({ partner, setPartner, privacyMode }) {
  const metrics = partner.id === "all"
    ? portfolioMetrics
    : {
        applications: partner.applications,
        approvals: partner.approvals,
        disbursals: partner.disbursals,
        approvalRate: partner.approval,
        approvalToDisbursal: (partner.disbursals / partner.approvals) * 100,
        outstanding: partner.exposure,
        par30: partner.par30,
        fpd: partner.fpd,
      };
  const funnel = [
    { label: "Submitted", value: metrics.applications, color: "#397daf" },
    { label: "Approved", value: metrics.approvals, color: "#35b8a1" },
    { label: "Disbursed", value: metrics.disbursals, color: "#168d7d" },
  ];
  const selectedName = privacyMode && partner.id !== "all" ? partner.alias : partner.name;

  return (
    <div className="view-stack">
      <section>
        <PanelHeader
          eyebrow="Risk-adjusted growth"
          title="Lender partnership & portfolio overview"
          detail={`${selectedName} · Synthetic portfolio · Reporting date ${reportDate}`}
        />
        <div className="metric-grid metric-grid--six">
          <MetricCard label="Applications" value={metrics.applications} detail="Submitted population" tone="blue" icon={Users} />
          <MetricCard label="Approval rate" value={`${metrics.approvalRate.toFixed(1)}%`} detail={`${metrics.approvals} approvals`} tone="teal" icon={CheckCircle2} />
          <MetricCard label="Disbursals" value={metrics.disbursals} detail={`${metrics.approvalToDisbursal.toFixed(1)}% of approvals`} tone="green" icon={Landmark} />
          <MetricCard label="Outstanding" value={formatLakh(metrics.outstanding)} detail="Scheduled principal" tone="blue" icon={Database} />
          <MetricCard label="PAR 30" value={`${metrics.par30.toFixed(1)}%`} detail="Exposure-weighted" tone="orange" icon={Activity} />
          <MetricCard label="FPD rate" value={`${metrics.fpd.toFixed(1)}%`} detail="First instalment 30+" tone="red" icon={Target} />
        </div>
      </section>

      <div className="split split--wide">
        <section className="panel">
          <PanelHeader title="Partner scorecard" detail="Conversion quality must be read beside downstream risk" />
          <div className="partner-table" role="table" aria-label="Lender partner comparison">
            <div className="partner-table__head" role="row">
              <span>Lender</span><span>Approval</span><span>FPD</span><span>PAR 30</span><span>Exposure</span>
            </div>
            {partners.slice(1).map((item) => (
              <button
                className={partner.id === item.id ? "partner-table__row is-active" : "partner-table__row"}
                key={item.id}
                onClick={() => setPartner(item)}
                role="row"
              >
                <span><i className="partner-score" style={{ "--score": item.score }} />{privacyMode ? item.alias : item.name}</span>
                <span>{item.approval.toFixed(1)}%</span>
                <span className={item.fpd >= 30 ? "negative" : "positive"}>{item.fpd.toFixed(1)}%</span>
                <span className={item.par30 > 65 ? "negative" : ""}>{item.par30.toFixed(1)}%</span>
                <span>{formatLakh(item.exposure)}</span>
              </button>
            ))}
          </div>
          <BarList
            data={partners.slice(1).map((item) => ({ ...item, label: item.name, value: item.par30, color: item.par30 > 65 ? "#dc565b" : item.par30 < 55 ? "#35c7ad" : "#f0804b" }))}
            privacyMode={privacyMode}
          />
        </section>

        <section className="panel funnel-panel">
          <PanelHeader title="Application funnel" detail={selectedName} />
          <div className="funnel">
            {funnel.map((item) => (
              <div className="funnel__step" key={item.label} style={{ width: `${44 + (item.value / metrics.applications) * 52}%`, background: item.color }}>
                <strong>{item.value}</strong>
                <span>{item.label} · {((item.value / metrics.applications) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <Insight label="Decision focus">
            Compare conversion with FPD and PAR before changing partner allocation. Growth without risk-adjusted quality can destroy value.
          </Insight>
        </section>
      </div>

      <section className="panel original-story">
        <PanelHeader eyebrow="Original analytical work" title="Tableau storyboard" detail="Five visuals from the source case study, preserved as a privacy-safe portfolio record" />
        <div className="storyboard">
          {[
            ["Lender overview", "assets/lender-overview.png"],
            ["Bureau profile", "assets/bureau-risk.png"],
            ["Vintage analysis", "assets/vintage-roll.png"],
            ["Alert queue", "assets/alerts.png"],
          ].map(([label, src]) => (
            <a href={`${import.meta.env.BASE_URL}${src}`} target="_blank" rel="noreferrer" key={label}>
              <img src={`${import.meta.env.BASE_URL}${src}`} alt={`${label} Tableau dashboard`} />
              <span>{label}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function BureauRisk() {
  return (
    <div className="view-stack">
      <section>
        <PanelHeader eyebrow="Point-in-time bureau snapshot" title="Bureau-risk profile" detail="Credit behaviour, leverage and application outcomes" />
        <div className="metric-grid metric-grid--four">
          <MetricCard label="High / very high" value="269" detail="44.8% of customers" tone="red" icon={ShieldCheck} />
          <MetricCard label="Utilisation 80%+" value="128" detail="Revolving stress" tone="orange" icon={Gauge} />
          <MetricCard label="4+ enquiries / 90d" value="21" detail="Credit-seeking signal" tone="amber" icon={Search} />
          <MetricCard label="Bureau overdue" value="INR 32.5 L" detail="Across tradelines" tone="red" icon={Activity} />
        </div>
      </section>
      <div className="split">
        <section className="panel">
          <PanelHeader title="Customer risk distribution" detail="Count and portfolio share" />
          <DonutChart data={riskDistribution} total={600} centerLabel="customers" />
        </section>
        <section className="panel view-stack view-stack--compact">
          <div>
            <PanelHeader title="Approval rate by risk band" detail="Stratification check" />
            <BarList data={approvalByRisk} />
          </div>
          <Insight label="Policy signal" tone="red" icon={ShieldCheck}>
            Approval should generally decline as risk increases. The medium-band inversion is a prompt to examine overrides, affordability and channel mix.
          </Insight>
        </section>
      </div>
      <section className="panel">
        <PanelHeader title="Revolving utilisation" detail="Customers by latest bureau utilisation band" />
        <div className="column-chart">
          {utilizationBands.map((item) => (
            <div className="column-chart__item" key={item.label}>
              <strong>{item.value}</strong>
              <span className="column-chart__bar" style={{ height: `${42 + (item.value / 301) * 128}px`, background: item.color }} />
              <small>{item.label}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function VintageRoll() {
  return (
    <div className="view-stack">
      <section>
        <PanelHeader eyebrow="Behavioural portfolio risk" title="Delinquency, vintage & roll-rate analysis" detail={`Comparable cohort age · Reporting date ${reportDate}`} />
        <div className="metric-grid metric-grid--five">
          <MetricCard label="Account 30+" value="57.8%" detail="Current snapshot" tone="orange" icon={Activity} />
          <MetricCard label="Account 60+" value="27.3%" detail="Current snapshot" tone="red" icon={Activity} />
          <MetricCard label="Account 90+" value="12.4%" detail="Current snapshot" tone="red" icon={Activity} />
          <MetricCard label="PAR 30" value="62.3%" detail="INR 1.0 Cr" tone="orange" icon={Database} />
          <MetricCard label="PAR 90" value="15.0%" detail="INR 24.6 L" tone="red" icon={Database} />
        </div>
      </section>
      <div className="split split--wide">
        <section className="panel">
          <PanelHeader title="Monthly delinquency trend" detail="Maturity explains the recent drop in 60+ and 90+" />
          <TrendChart data={monthlyTrend} />
        </section>
        <section className="panel">
          <PanelHeader title="Current DPD mix" detail="Accounts" />
          <BarList data={dpdMix} max={60} valueSuffix="" />
          <Insight label="Collections signal" tone="red" icon={BellRing}>
            Account 30+ is 57.8%, while exposure-weighted PAR 30 is 62.3%. Larger balances are slightly more concentrated in delinquency.
          </Insight>
        </section>
      </div>
      <div className="split">
        <section className="panel scroll-panel">
          <PanelHeader title="Vintage heatmap · PAR 30" detail="Rows: origination month · Columns: MOB" />
          <Heatmap matrix={vintageMatrix} />
        </section>
        <section className="panel scroll-panel">
          <PanelHeader title="Roll-rate matrix" detail="All matured consecutive months" />
          <RollMatrix data={rollRate} />
          <div className="matrix-key"><span className="key-cure" /> Cure <span className="key-worse" /> Forward migration</div>
        </section>
      </div>
    </div>
  );
}

function Alerts({ partner, privacyMode }) {
  const [segment, setSegment] = useState("All");
  const [query, setQuery] = useState("");
  const partnerName = partner.id === "all" ? null : partner.name;
  const filtered = useMemo(() => alerts.filter((item) => {
    const matchesPartner = !partnerName || item.lender === partnerName;
    const matchesSegment = segment === "All" || item.segment === segment;
    const matchesQuery = !query || `${item.id} ${item.lender} ${item.action}`.toLowerCase().includes(query.toLowerCase());
    return matchesPartner && matchesSegment && matchesQuery;
  }), [partnerName, query, segment]);

  return (
    <div className="view-stack">
      <section>
        <PanelHeader eyebrow="Human-reviewed treatment queue" title="Early-warning alerts & recommendations" detail="Repayment behaviour and bureau stress combined into an interpretable sorting aid" />
        <div className="metric-grid metric-grid--four">
          {segmentSummary.map((item) => (
            <MetricCard key={item.segment} label={item.segment} value={`${item.accounts} accounts`} detail={`${formatLakh(item.exposure)} exposure`} tone={item.segment.toLowerCase()} icon={BellRing} />
          ))}
        </div>
      </section>
      <div className="split split--alert">
        <section className="panel">
          <PanelHeader title="Exposure by segment" detail="Outstanding principal" />
          <BarList data={segmentSummary.map((item) => ({ label: item.segment, value: item.exposure, color: item.color }))} max={70} valueSuffix=" L" />
          <div className="action-ladder">
            <h3>Action hierarchy</h3>
            {[
              ["Critical", "Late-stage collections / restructure review"],
              ["High", "Collections priority; pause new exposure"],
              ["Watch", "Pre-delinquency outreach and closer monitoring"],
              ["Stable", "Standard monitoring cadence"],
            ].map(([name, detail]) => <div key={name}><span className={`pill pill--${name.toLowerCase()}`}>{name}</span><p>{detail}</p></div>)}
          </div>
        </section>
        <section className="panel queue-panel">
          <PanelHeader title="Prioritised account queue" detail={`${filtered.length} demonstration accounts shown`} />
          <div className="queue-controls">
            <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search account or action" /></label>
            <div className="segment-filter">
              {["All", "Critical", "High", "Watch", "Stable"].map((name) => <button className={segment === name ? "is-active" : ""} onClick={() => setSegment(name)} key={name}>{name}</button>)}
            </div>
          </div>
          <div className="queue-table-wrap">
            <table className="queue-table">
              <thead><tr><th>Account</th><th>Lender</th><th>Segment</th><th>DPD</th><th>Exposure</th><th>Score</th><th>Recommended action</th></tr></thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{privacyMode ? maskAccount(item.id) : item.id}</td>
                    <td>{privacyMode ? partners.find((p) => p.name === item.lender)?.alias : item.lender}</td>
                    <td><span className={`pill pill--${item.segment.toLowerCase()}`}>{item.segment}</span></td>
                    <td>{item.dpd}</td><td>{formatLakh(item.exposure)}</td><td><strong>{item.score}</strong></td><td>{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 ? <div className="empty-state">No demonstration accounts match these filters.</div> : null}
        </section>
      </div>
    </div>
  );
}

function Methodology({ onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="methodology" role="dialog" aria-modal="true" aria-labelledby="methodology-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button methodology__close" onClick={onClose} aria-label="Close methodology"><X size={20} /></button>
        <span className="eyebrow">Transparent by design</span>
        <h2 id="methodology-title">Methodology & governance</h2>
        <p className="methodology__lead">This is a portfolio demonstration built with deterministic synthetic data. The score supports prioritisation and human review. It is not an automated lending decision.</p>
        <div className="methodology__flow">
          {[
            [Database, "Seven source tables", "Customer, application, bureau, account, repayment and partner grains"],
            [Layers3, "MySQL feature layer", "Twelve governed views for funnel, bureau, PAR, FPD, vintage, roll and alerts"],
            [BarChart3, "Decision experience", "Independent analytical sources prevent fan-out and double counting"],
          ].map(([Icon, title, detail]) => <div key={title}><Icon size={22} /><strong>{title}</strong><p>{detail}</p></div>)}
        </div>
        <h3>Core definitions</h3>
        <dl className="definition-grid">
          <div><dt>PAR 30</dt><dd>Outstanding principal at 30+ DPD divided by total reporting outstanding.</dd></div>
          <div><dt>FPD</dt><dd>Loans with a matured first instalment reaching 30+ DPD divided by matured first instalments.</dd></div>
          <div><dt>Vintage</dt><dd>Portfolio risk compared by origination cohort at the same month on book.</dd></div>
          <div><dt>Roll rate</dt><dd>Accounts moving from one DPD bucket to another across consecutive matured months.</dd></div>
        </dl>
        <h3>Quality gates</h3>
        <div className="check-list">
          {governanceChecks.map((item) => <div key={item.label}><CheckCircle2 size={17} /><span>{item.label}</span><strong>{item.status}</strong></div>)}
        </div>
        <Insight label="Responsible-use boundary" tone="red" icon={ShieldCheck}>
          A production system would require consent controls, least-privilege access, ledger reconciliation, fairness and drift testing, monitoring, reason codes and documented manual overrides.
        </Insight>
      </aside>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("overview");
  const [partner, setPartner] = useState(partners[0]);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [methodology, setMethodology] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const downloadSummary = () => {
    const summary = {
      generated_at: new Date().toISOString(),
      reporting_date: "2026-07-31",
      data_class: "deterministic synthetic demonstration",
      selected_partner: privacyMode && partner.id !== "all" ? partner.alias : partner.name,
      portfolio_metrics: portfolioMetrics,
      alert_segments: segmentSummary,
      responsible_use: "Human-reviewed prioritisation only. Not an automated credit decision.",
    };
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "lendguard-sanitized-insight-summary.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="LendGuard home">
          <span className="brand__mark"><ShieldCheck size={23} /></span>
          <span><strong>LendGuard</strong><small>Digital Lending Risk Studio</small></span>
        </a>
        <button className="mobile-menu icon-button" onClick={() => setMobileNav((value) => !value)} aria-label="Toggle navigation"><Menu size={21} /></button>
        <nav className={mobileNav ? "main-nav is-open" : "main-nav"} aria-label="Dashboard sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={tab === id ? "is-active" : ""} onClick={() => { setTab(id); setMobileNav(false); }}><Icon size={17} />{label}</button>
          ))}
        </nav>
        <div className="topbar__actions">
          <button className={privacyMode ? "privacy-button is-active" : "privacy-button"} onClick={() => setPrivacyMode((value) => !value)}>
            {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}{privacyMode ? "Privacy on" : "Privacy off"}
          </button>
          <button className="button button--ghost" onClick={() => setMethodology(true)}><FileText size={16} />Methodology</button>
          <button className="button button--primary" onClick={downloadSummary}><ArrowDownToLine size={16} />Export</button>
        </div>
      </header>

      <div className="context-bar" id="top">
        <div><span className="status-dot" />Synthetic demonstration portfolio</div>
        <label>
          <Building2 size={16} />
          <select value={partner.id} onChange={(event) => setPartner(partners.find((item) => item.id === event.target.value))}>
            {partners.map((item) => <option value={item.id} key={item.id}>{privacyMode && item.id !== "all" ? item.alias : item.name}</option>)}
          </select>
        </label>
        <span className="context-date">As of {reportDate}</span>
      </div>

      <main>
        {tab === "overview" ? <Overview partner={partner} setPartner={setPartner} privacyMode={privacyMode} /> : null}
        {tab === "bureau" ? <BureauRisk /> : null}
        {tab === "vintage" ? <VintageRoll /> : null}
        {tab === "alerts" ? <Alerts partner={partner} privacyMode={privacyMode} /> : null}
      </main>

      <footer>
        <div className="brand brand--footer"><span className="brand__mark"><ShieldCheck size={20} /></span><span><strong>LendGuard</strong><small>Portfolio analytics demonstration</small></span></div>
        <p>Built by Nandini Malik · Business Analyst and Data Science graduate</p>
        <div><a href="https://github.com/nandini151003" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/nandini-malik-384885240" target="_blank" rel="noreferrer">LinkedIn</a></div>
      </footer>

      {methodology ? <Methodology onClose={() => setMethodology(false)} /> : null}
    </div>
  );
}
