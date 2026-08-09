import { useId } from "react";

export function BarList({ data, max = 100, valueSuffix = "%", privacyMode = false }) {
  return (
    <div className="bar-list">
      {data.map((item, index) => (
        <div className="bar-list__row" key={item.id || item.label || item.name}>
          <span className="bar-list__label">
            {privacyMode && item.alias ? item.alias : item.label || item.name}
          </span>
          <div className="bar-list__track">
            <span
              className="bar-list__fill"
              style={{ width: `${Math.min(100, (item.value / max) * 100)}%`, background: item.color }}
            />
          </div>
          <strong>{item.value}{valueSuffix}</strong>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ data, total, centerLabel }) {
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg className="donut" viewBox="0 0 180 180" role="img" aria-label={`${centerLabel}: ${total}`}>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#e8eef2" strokeWidth="28" />
        {data.map((item) => {
          const length = (item.value / total) * circumference;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={item.label}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="28"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 90 90)"
            />
          );
        })}
        <text x="90" y="84" textAnchor="middle" className="donut__total">{total}</text>
        <text x="90" y="106" textAnchor="middle" className="donut__label">{centerLabel}</text>
      </svg>
      <div className="legend">
        {data.map((item) => (
          <div className="legend__item" key={item.label}>
            <span className="legend__dot" style={{ background: item.color }} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.share}%</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendChart({ data }) {
  const gradientId = useId().replace(/:/g, "");
  const width = 720;
  const height = 250;
  const pad = { left: 42, right: 18, top: 20, bottom: 40 };
  const maxY = 55;
  const x = (index) => pad.left + (index * (width - pad.left - pad.right)) / (data.length - 1);
  const y = (value) => pad.top + (maxY - value) * (height - pad.top - pad.bottom) / maxY;
  const points = (key) => data.map((item, index) => `${x(index)},${y(item[key])}`).join(" ");
  const series = [
    { key: "d30", label: "30+", color: "#f0804b" },
    { key: "d60", label: "60+", color: "#dc565b" },
    { key: "d90", label: "90+", color: "#173a57" },
  ];

  return (
    <div className="trend-chart">
      <div className="chart-legend">
        {series.map((item) => <span key={item.key}><i style={{ background: item.color }} />{item.label}</span>)}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly delinquency trend">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0804b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f0804b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 14, 28, 41, 55].map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="#d9e3e9" strokeWidth="1" />
            <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" className="chart-axis">{tick}%</text>
          </g>
        ))}
        <polygon points={`${pad.left},${y(0)} ${points("d30")} ${x(data.length - 1)},${y(0)}`} fill={`url(#${gradientId})`} />
        {series.map((item) => (
          <g key={item.key}>
            <polyline points={points(item.key)} fill="none" stroke={item.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {data.map((point, index) => <circle key={point.month} cx={x(index)} cy={y(point[item.key])} r="2.6" fill={item.color} />)}
          </g>
        ))}
        {data.map((item, index) => index % 3 === 0 || index === data.length - 1 ? (
          <text key={item.month} x={x(index)} y={height - 12} textAnchor="middle" className="chart-axis">{item.month.replace(" 20", " ")}</text>
        ) : null)}
      </svg>
    </div>
  );
}

export function Heatmap({ matrix }) {
  const tone = (value) => {
    if (value == null) return "heat-null";
    if (value < 15) return "heat-1";
    if (value < 30) return "heat-2";
    if (value < 45) return "heat-3";
    if (value < 60) return "heat-4";
    return "heat-5";
  };
  return (
    <div className="heatmap" style={{ "--heat-columns": matrix.columns.length }}>
      <span />
      {matrix.columns.map((column) => <strong key={column}>{column}</strong>)}
      {matrix.rows.flatMap((row) => [
        <strong className="heatmap__row" key={`${row.label}-label`}>{row.label}</strong>,
        ...row.values.map((value, index) => (
          <span key={`${row.label}-${index}`} className={tone(value)}>{value == null ? "-" : `${value}%`}</span>
        )),
      ])}
    </div>
  );
}

export function RollMatrix({ data }) {
  return (
    <div className="roll-matrix" style={{ "--roll-columns": data.labels.length }}>
      <span />
      {data.labels.map((label) => <strong key={label}>{label}</strong>)}
      {data.values.flatMap((row, rowIndex) => [
        <strong className="roll-matrix__row" key={`${data.labels[rowIndex]}-label`}>{data.labels[rowIndex]}</strong>,
        ...row.map((value, columnIndex) => {
          const worsening = columnIndex > rowIndex && value > 0;
          const cure = columnIndex < rowIndex && value > 0;
          return <span className={worsening ? "roll-worse" : cure ? "roll-cure" : ""} key={`${rowIndex}-${columnIndex}`}>{value}%</span>;
        }),
      ])}
    </div>
  );
}
