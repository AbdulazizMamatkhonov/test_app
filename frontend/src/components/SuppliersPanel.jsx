import { useEffect, useState } from "react";
import PanelShell from "./PanelShell.jsx";
import useApiClient from "./useApiClient.js";

const SuppliersPanel = ({ client }) => {
  const { request } = useApiClient(client);
  const [suppliers, setSuppliers] = useState([]);
  const [notice, setNotice] = useState("Loading suppliers...");
  const [formState, setFormState] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
  });

  const loadSuppliers = async () => {
    try {
      const data = await request("/suppliers");
      setSuppliers(data.data);
      setNotice(data.data.length ? "" : "No suppliers yet.");
    } catch (error) {
      setNotice("Unable to load suppliers.");
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [client.apiBase, client.subscriptionKey, client.tenantId, client.authToken]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await request("/suppliers", {
        method: "POST",
        body: JSON.stringify(formState),
      });
      setFormState({
        name: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
      });
      loadSuppliers();
    } catch (error) {
      setNotice("Failed to add supplier.");
    }
  };

  return (
    <PanelShell
      title="Suppliers"
      description="Track supplier contacts for purchase orders and deliveries."
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <input
          name="name"
          value={formState.name}
          onChange={handleChange}
          placeholder="Supplier Name"
          required
        />
        <input
          name="contactName"
          value={formState.contactName}
          onChange={handleChange}
          placeholder="Contact Name"
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
        <button type="submit">Add Supplier</button>
      </form>
      <div className="panel-list">
        {notice && <p className="muted">{notice}</p>}
        {suppliers.map((supplier) => (
          <article key={supplier._id} className="list-card">
            <h4>{supplier.name}</h4>
            <span>{supplier.contactName || "No contact name"}</span>
            <span>{supplier.phone || "No phone"}</span>
          </article>
        ))}
      </div>
    </PanelShell>
  );
};

export default SuppliersPanel;
