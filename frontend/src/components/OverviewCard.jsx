const OverviewCard = ({ title, value, description }) => (
  <article className="overview-card">
    <h3>{title}</h3>
    <p className="overview-value">{value}</p>
    <p>{description}</p>
  </article>
);

export default OverviewCard;
