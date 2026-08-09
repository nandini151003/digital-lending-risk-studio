export const reportDate = "31 Jul 2026";

export const portfolioMetrics = {
  applications: 600,
  bureauProcessed: 552,
  approvals: 384,
  disbursals: 312,
  approvalRate: 64.0,
  approvalToDisbursal: 81.2,
  outstanding: 160,
  par30: 62.3,
  par90: 15.0,
  fpd: 23.1,
  account30: 57.8,
  account60: 27.3,
  account90: 12.4,
};

export const partners = [
  { id: "all", name: "All partners", alias: "Portfolio", applications: 600, approvals: 384, disbursals: 312, approval: 64.0, fpd: 23.1, par30: 62.3, exposure: 160.0, score: 58 },
  { id: "aurora", name: "Aurora Bank", alias: "Partner A", applications: 120, approvals: 72, disbursals: 58, approval: 60.0, fpd: 30.0, par30: 64.5, exposure: 30.1, score: 51 },
  { id: "nimbus", name: "Nimbus Finance", alias: "Partner B", applications: 120, approvals: 78, disbursals: 62, approval: 65.0, fpd: 0.0, par30: 57.9, exposure: 28.4, score: 73 },
  { id: "pinnacle", name: "Pinnacle Credit", alias: "Partner C", applications: 120, approvals: 78, disbursals: 63, approval: 65.0, fpd: 30.0, par30: 60.6, exposure: 28.3, score: 56 },
  { id: "summit", name: "Summit Capital", alias: "Partner D", applications: 120, approvals: 78, disbursals: 65, approval: 65.0, fpd: 0.0, par30: 50.9, exposure: 38.6, score: 82 },
  { id: "trustline", name: "Trustline Bank", alias: "Partner E", applications: 120, approvals: 78, disbursals: 64, approval: 65.0, fpd: 54.5, par30: 76.3, exposure: 38.4, score: 32 },
];

export const riskDistribution = [
  { label: "Low", value: 208, share: 34.7, color: "#35c7ad" },
  { label: "Medium", value: 123, share: 20.5, color: "#e4ad38" },
  { label: "High", value: 177, share: 29.5, color: "#f0804b" },
  { label: "Very high", value: 92, share: 15.3, color: "#dc565b" },
];

export const approvalByRisk = [
  { label: "Low", value: 63.0, color: "#35c7ad" },
  { label: "Medium", value: 68.3, color: "#e4ad38" },
  { label: "High", value: 65.5, color: "#f0804b" },
  { label: "Very high", value: 57.6, color: "#dc565b" },
];

export const utilizationBands = [
  { label: "<30%", value: 301, color: "#35c7ad" },
  { label: "30-49%", value: 84, color: "#e4ad38" },
  { label: "50-69%", value: 64, color: "#f0804b" },
  { label: "70-89%", value: 34, color: "#d85d5f" },
  { label: "90%+", value: 117, color: "#dc565b" },
];

export const monthlyTrend = [
  { month: "Apr 25", d30: 41.5, d60: 26.5, d90: 15.6 },
  { month: "May 25", d30: 45.4, d60: 27.4, d90: 17.4 },
  { month: "Jun 25", d30: 45.9, d60: 28.5, d90: 17.7 },
  { month: "Jul 25", d30: 46.1, d60: 29.2, d90: 17.8 },
  { month: "Aug 25", d30: 47.2, d60: 29.2, d90: 17.8 },
  { month: "Sep 25", d30: 47.1, d60: 29.2, d90: 17.8 },
  { month: "Oct 25", d30: 45.1, d60: 28.7, d90: 18.8 },
  { month: "Nov 25", d30: 44.6, d60: 27.6, d90: 17.8 },
  { month: "Dec 25", d30: 43.5, d60: 27.2, d90: 17.1 },
  { month: "Jan 26", d30: 43.4, d60: 27.2, d90: 16.7 },
  { month: "Feb 26", d30: 42.4, d60: 26.4, d90: 16.1 },
  { month: "Mar 26", d30: 40.4, d60: 26.1, d90: 15.7 },
  { month: "Apr 26", d30: 40.3, d60: 25.5, d90: 15.4 },
  { month: "May 26", d30: 41.6, d60: 25.3, d90: 0.7 },
  { month: "Jun 26", d30: 41.7, d60: 1.2, d90: 0.0 },
  { month: "Jul 26", d30: 3.2, d60: 0.0, d90: 0.0 },
];

export const dpdMix = [
  { label: "Current", value: 58, color: "#35c7ad" },
  { label: "1-29", value: 10, color: "#3f86b6" },
  { label: "30-59", value: 49, color: "#e4ad38" },
  { label: "60-89", value: 24, color: "#f0804b" },
  { label: "90+", value: 20, color: "#dc565b" },
];

export const vintageMatrix = {
  columns: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"],
  rows: [
    { label: "Oct 25", values: [0, 16, 32, 35, 35, 52, 36, 36] },
    { label: "Nov 25", values: [27, 27, 41, 32, 32, 48, 32, 0] },
    { label: "Dec 25", values: [34, 26, 26, 61, 61, 61, 7, null] },
    { label: "Jan 26", values: [15, 27, 28, 58, 59, 4, null, null] },
    { label: "Feb 26", values: [34, 16, 16, 58, 0, null, null, null] },
    { label: "Mar 26", values: [26, 40, 53, 0, null, null, null, null] },
    { label: "Apr 26", values: [34, 24, 16, null, null, null, null, null] },
  ],
};

export const rollRate = {
  labels: ["Current", "1-29", "30-59", "60-89", "90+"],
  values: [
    [0, 100, 0, 0, 0],
    [12, 80, 7, 1, 0],
    [0, 22, 75, 3, 0],
    [0, 4, 11, 81, 4],
    [0, 0, 0, 5, 95],
  ],
};

export const alerts = [
  { id: "LN-0000257", lender: "Pinnacle Credit", segment: "Critical", dpd: 60, exposure: 2.7, score: 98, action: "Immediate FPD outreach and affordability review" },
  { id: "LN-0000254", lender: "Trustline Bank", segment: "Critical", dpd: 95, exposure: 2.4, score: 96, action: "Late-stage collections and restructure assessment" },
  { id: "LN-0000059", lender: "Trustline Bank", segment: "Critical", dpd: 120, exposure: 0.75, score: 95, action: "Late-stage collections and restructure assessment" },
  { id: "LN-0000094", lender: "Trustline Bank", segment: "Critical", dpd: 95, exposure: 0.14, score: 93, action: "Late-stage collections and hardship review" },
  { id: "LN-0000099", lender: "Trustline Bank", segment: "Critical", dpd: 120, exposure: 0.11, score: 92, action: "Escalate collections and pause new exposure" },
  { id: "LN-0000179", lender: "Trustline Bank", segment: "Critical", dpd: 120, exposure: 3.3, score: 91, action: "Escalate collections and restructure review" },
  { id: "LN-0000479", lender: "Trustline Bank", segment: "Critical", dpd: 91, exposure: 2.7, score: 90, action: "Late-stage collections and hardship review" },
  { id: "LN-0000359", lender: "Trustline Bank", segment: "Critical", dpd: 120, exposure: 2.7, score: 89, action: "Escalate collections and pause new exposure" },
  { id: "LN-0000295", lender: "Aurora Bank", segment: "Critical", dpd: 45, exposure: 1.9, score: 88, action: "Immediate FPD outreach and fraud check" },
  { id: "LN-0000294", lender: "Trustline Bank", segment: "Critical", dpd: 95, exposure: 1.8, score: 87, action: "Late-stage collections and restructure assessment" },
  { id: "LN-0000118", lender: "Summit Capital", segment: "High", dpd: 58, exposure: 1.6, score: 76, action: "Priority outreach and payment-date review" },
  { id: "LN-0000412", lender: "Nimbus Finance", segment: "High", dpd: 34, exposure: 1.2, score: 72, action: "Collections priority and closer monitoring" },
  { id: "LN-0000320", lender: "Pinnacle Credit", segment: "Watch", dpd: 12, exposure: 0.9, score: 54, action: "Reminder and bureau refresh where appropriate" },
  { id: "LN-0000203", lender: "Aurora Bank", segment: "Stable", dpd: 0, exposure: 1.1, score: 18, action: "Standard monitoring cadence" },
];

export const segmentSummary = [
  { segment: "Critical", accounts: 41, exposure: 46.0, color: "#dc565b" },
  { segment: "High", accounts: 59, exposure: 67.5, color: "#f0804b" },
  { segment: "Watch", accounts: 12, exposure: 10.6, color: "#e4ad38" },
  { segment: "Stable", accounts: 49, exposure: 39.7, color: "#35c7ad" },
];

export const governanceChecks = [
  { label: "Source rows reconciled", status: "Passed" },
  { label: "Future installments excluded", status: "Passed" },
  { label: "FPD maturity gate", status: "Passed" },
  { label: "Bureau timing leakage test", status: "Passed" },
  { label: "PAR threshold hierarchy", status: "Passed" },
];
