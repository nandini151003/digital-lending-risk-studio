export default function MetricCard({ label, value, detail, tone = "blue", icon: Icon }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__head">
        <span>{label}</span>
        {Icon ? <Icon size={17} aria-hidden="true" /> : null}
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
