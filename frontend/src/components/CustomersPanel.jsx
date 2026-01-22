import { useEffect, useState } from "react";
import PanelShell from "./PanelShell.jsx";
import useApiClient from "./useApiClient.js";

const CustomersPanel = ({ client }) => {
  const { request } = useApiClient(client);
  const [customers, setCustomers] = useState([]);
  const [notice, setNotice] = useState("Loading customers...");
  const [formState, setFormState] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const loadCustomers = async () => {
    try {
      const data = await request("/customers");
      setCustomers(data.data);
      setNotice(data.data.length ? "" : "No customers yet.");
    } catch (error) {
      setNotice("Unable to load customers.");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [client.apiBase, client.subscriptionKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await request("/customers", {
        method: "POST",
        body: JSON.stringify(formState),
      });
      setFormState({ name: "", phone: "", email: "", address: "" });
      loadCustomers();
    } catch (error) {
      setNotice("Failed to add customer.");
    }
  };

  return (
    <PanelShell
      title="Customers"
      description="Store customer records and track their outstanding balances."
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          name="phone"
          value={formState.phone}
          onChange={handleChange}
          placeholder="Phone"
        />
        <input
          name="email"
          value={formState.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          name="address"
          value={formState.address}
          onChange={handleChange}
          placeholder="Address"
        />
        <button type="submit">Add Customer</button>
      </form>
      <div className="panel-list">
        {notice && <p className="muted">{notice}</p>}
        {customers.map((customer) => (
          <article key={customer._id} className="list-card">
            <h4>{customer.name}</h4>
            <span>{customer.phone || "No phone"}</span>
            <span>{customer.email || "No email"}</span>
          </article>
        ))}
      </div>
    </PanelShell>
  );
};

export default CustomersPanel;
