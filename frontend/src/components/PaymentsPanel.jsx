import { useEffect, useState } from "react";
import PanelShell from "./PanelShell.jsx";
import useApiClient from "./useApiClient.js";

const PaymentsPanel = ({ client }) => {
  const { request } = useApiClient(client);
  const [payments, setPayments] = useState([]);
  const [notice, setNotice] = useState("Loading payments...");
  const [formState, setFormState] = useState({
    customerId: "",
    saleId: "",
    amount: "",
    method: "",
    note: "",
  });

  const loadPayments = async () => {
    try {
      const data = await request("/payments");
      setPayments(data.data);
      setNotice(data.data.length ? "" : "No payments yet.");
    } catch (error) {
      setNotice("Unable to load payments.");
    }
  };

  useEffect(() => {
    loadPayments();
  }, [client.apiBase, client.subscriptionKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await request("/payments", {
        method: "POST",
        body: JSON.stringify({
          customerId: formState.customerId,
          saleId: formState.saleId || undefined,
          amount: Number(formState.amount),
          method: formState.method,
          note: formState.note,
        }),
      });
      setFormState({
        customerId: "",
        saleId: "",
        amount: "",
        method: "",
        note: "",
      });
      loadPayments();
    } catch (error) {
      setNotice("Failed to record payment.");
    }
  };

  return (
    <PanelShell
      title="Payments"
      description="Log customer payments and sync sale status automatically."
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          name="customerId"
          value={formState.customerId}
          onChange={handleChange}
          placeholder="Customer ID"
          required
        />
        <input
          name="saleId"
          value={formState.saleId}
          onChange={handleChange}
          placeholder="Sale ID (optional)"
        />
        <input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          value={formState.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
        />
        <input
          name="method"
          value={formState.method}
          onChange={handleChange}
          placeholder="Method"
        />
        <input
          name="note"
          value={formState.note}
          onChange={handleChange}
          placeholder="Note"
        />
        <button type="submit">Record Payment</button>
      </form>
      <div className="panel-list">
        {notice && <p className="muted">{notice}</p>}
        {payments.map((payment) => (
          <article key={payment._id} className="list-card">
            <h4>Payment {payment._id.slice(-6)}</h4>
            <span>Amount: {payment.amount}</span>
            <span>Method: {payment.method || "-"}</span>
          </article>
        ))}
      </div>
    </PanelShell>
  );
};

export default PaymentsPanel;
