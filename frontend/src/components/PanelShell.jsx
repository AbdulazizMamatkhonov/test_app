const PanelShell = ({ title, description, children }) => (
  <section className="panel-shell">
    <header>
      <h3>{title}</h3>
      <p>{description}</p>
    </header>
    <div className="panel-content">{children}</div>
  </section>
);

export default PanelShell;
