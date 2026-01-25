import { useState } from "react";
import PanelShell from "./PanelShell.jsx";
import useApiClient from "./useApiClient.js";

const DebtPanel = ({ client }) => {
  const { request } = useApiClient(client);
  const [customerId, setCustomerId] = useState("");
  const [notice, setNotice] = useState("Enter a customer ID to view debt.");
  const [summary, setSummary] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await request(`/debts/customers/${customerId}`);
      setSummary(data.data);
      setNotice("");
    } catch (error) {
      setSummary(null);
      setNotice("Unable to load debt summary.");
    }
  };

  return (
    <PanelShell
      title="Debt Overview"
      description="Check customer balances and total outstanding debt."
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          name="customerId"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          placeholder="Customer ID"
          required
        />
        <button type="submit">Check Debt</button>
      </form>
      {notice && <p className="muted">{notice}</p>}
      {summary && (
        <div className="list-card highlight">
          <h4>Customer {summary.customerId}</h4>
          <span>Total Sales: {summary.totalSales}</span>
          <span>Total Payments: {summary.totalPayments}</span>
          <strong>Outstanding: {summary.outstanding}</strong>
        </div>
      )}
    </PanelShell>
  );
};

export default DebtPanel;
