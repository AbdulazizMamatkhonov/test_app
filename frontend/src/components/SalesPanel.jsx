import { useEffect, useState } from "react";
import PanelShell from "./PanelShell.jsx";
import useApiClient from "./useApiClient.js";

const SalesPanel = ({ client }) => {
  const { request } = useApiClient(client);
  const [sales, setSales] = useState([]);
  const [notice, setNotice] = useState("Loading sales...");
  const [formState, setFormState] = useState({
    customerId: "",
    items: "",
    discount: "",
    paidAmount: "",
    paymentMethod: "",
  });

  const loadSales = async () => {
    try {
      const data = await request("/sales");
      setSales(data.data);
      setNotice(data.data.length ? "" : "No sales yet.");
    } catch (error) {
      setNotice("Unable to load sales.");
    }
  };

  useEffect(() => {
    loadSales();
  }, [client.apiBase, client.subscriptionKey, client.tenantId, client.authToken]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await request("/sales", {
        method: "POST",
        body: JSON.stringify({
          customerId: formState.customerId || undefined,
          items: JSON.parse(formState.items),
          discount: Number(formState.discount) || 0,
          paidAmount: Number(formState.paidAmount) || 0,
          paymentMethod: formState.paymentMethod,
        }),
      });
      setFormState({
        customerId: "",
        items: "",
        discount: "",
        paidAmount: "",
        paymentMethod: "",
      });
      loadSales();
    } catch (error) {
      setNotice("Failed to create sale. Check JSON items.");
    }
  };

  return (
    <PanelShell
      title="Sales"
      description="Create sales and capture payments to reduce customer debt."
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          name="customerId"
          value={formState.customerId}
          onChange={handleChange}
          placeholder="Customer ID (optional)"
        />
        <input
          name="items"
          value={formState.items}
          onChange={handleChange}
          placeholder='Items JSON e.g. [{"productId":"...","quantity":1,"unitPrice":10}]'
          required
        />
        <input
          name="discount"
          type="number"
          min="0"
          step="0.01"
          value={formState.discount}
          onChange={handleChange}
          placeholder="Discount"
        />
        <input
          name="paidAmount"
          type="number"
          min="0"
          step="0.01"
          value={formState.paidAmount}
          onChange={handleChange}
          placeholder="Paid Amount"
        />
        <input
          name="paymentMethod"
          value={formState.paymentMethod}
          onChange={handleChange}
          placeholder="Payment Method"
        />
        <button type="submit">Create Sale</button>
      </form>
      <div className="panel-list">
        {notice && <p className="muted">{notice}</p>}
        {sales.map((sale) => (
          <article key={sale._id} className="list-card">
            <h4>Sale {sale._id.slice(-6)}</h4>
            <span>Total: {sale.total}</span>
            <span>Status: {sale.status}</span>
          </article>
        ))}
      </div>
    </PanelShell>
  );
};

export default SalesPanel;
