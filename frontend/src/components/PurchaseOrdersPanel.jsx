import { useEffect, useMemo, useState } from "react";
import PanelShell from "./PanelShell.jsx";
import useApiClient from "./useApiClient.js";

const PurchaseOrdersPanel = ({ client }) => {
  const { request } = useApiClient(client);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [notice, setNotice] = useState("Loading purchase orders...");
  const [formState, setFormState] = useState({
    supplierId: "",
    expectedAt: "",
    note: "",
    status: "ordered",
  });
  const [itemDraft, setItemDraft] = useState({
    productId: "",
    quantity: "",
    unitCost: "",
  });
  const [items, setItems] = useState([]);

  const loadOrders = async () => {
    try {
      const data = await request("/purchase-orders");
      setOrders(data.data);
      setNotice(data.data.length ? "" : "No purchase orders yet.");
    } catch (error) {
      setNotice("Unable to load purchase orders.");
    }
  };

  const loadSupportingData = async () => {
    try {
      const [productsResponse, suppliersResponse] = await Promise.all([
        request("/products"),
        request("/suppliers"),
      ]);
      setProducts(productsResponse.data);
      setSuppliers(suppliersResponse.data);
    } catch (error) {
      setNotice("Unable to load products or suppliers.");
    }
  };

  useEffect(() => {
    loadSupportingData();
    loadOrders();
  }, [client.apiBase, client.subscriptionKey, client.tenantId, client.authToken]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (event) => {
    const { name, value } = event.target;
    setItemDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (!itemDraft.productId || !itemDraft.quantity || !itemDraft.unitCost) {
      setNotice("Add a product, quantity, and unit cost.");
      return;
    }

    const quantity = Number(itemDraft.quantity);
    const unitCost = Number(itemDraft.unitCost);

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitCost)) {
      setNotice("Use valid quantities and costs.");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: itemDraft.productId,
        quantity,
        unitCost,
      },
    ]);
    setItemDraft({ productId: "", quantity: "", unitCost: "" });
    setNotice("");
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0).toFixed(2),
    [items]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.supplierId) {
      setNotice("Select a supplier before creating a purchase order.");
      return;
    }
    if (items.length === 0) {
      setNotice("Add at least one item to the purchase order.");
      return;
    }

    try {
      await request("/purchase-orders", {
        method: "POST",
        body: JSON.stringify({
          supplierId: formState.supplierId,
          items,
          status: formState.status,
          expectedAt: formState.expectedAt || undefined,
          note: formState.note,
        }),
      });
      setFormState({ supplierId: "", expectedAt: "", note: "", status: "ordered" });
      setItems([]);
      loadOrders();
    } catch (error) {
      setNotice("Failed to create purchase order.");
    }
  };

  const handleReceive = async (orderId) => {
    try {
      await request(`/purchase-orders/${orderId}/receive`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      loadOrders();
    } catch (error) {
      setNotice("Failed to receive purchase order.");
    }
  };

  return (
    <PanelShell
      title="Purchase Orders"
      description="Create purchase orders, track inbound deliveries, and receive stock."
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <select
          name="supplierId"
          value={formState.supplierId}
          onChange={handleFormChange}
          required
        >
          <option value="">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name}
            </option>
          ))}
        </select>
        <input
          name="expectedAt"
          type="date"
          value={formState.expectedAt}
          onChange={handleFormChange}
        />
        <input
          name="note"
          value={formState.note}
          onChange={handleFormChange}
          placeholder="Notes"
        />
        <select name="status" value={formState.status} onChange={handleFormChange}>
          <option value="draft">Draft</option>
          <option value="ordered">Ordered</option>
          <option value="partial">Partial</option>
          <option value="received">Received</option>
        </select>
        <div className="form-inline">
          <select
            name="productId"
            value={itemDraft.productId}
            onChange={handleItemChange}
          >
            <option value="">Product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
          <input
            name="quantity"
            type="number"
            min="1"
            value={itemDraft.quantity}
            onChange={handleItemChange}
            placeholder="Qty"
          />
          <input
            name="unitCost"
            type="number"
            min="0"
            step="0.01"
            value={itemDraft.unitCost}
            onChange={handleItemChange}
            placeholder="Unit Cost"
          />
          <button type="button" className="secondary" onClick={handleAddItem}>
            Add Item
          </button>
        </div>
        <div className="inline-summary">
          <span>Items: {items.length}</span>
          <span>Subtotal: {subtotal}</span>
        </div>
        <button type="submit">Create Purchase Order</button>
      </form>

      {items.length > 0 && (
        <div className="panel-list">
          <p className="muted">Pending items</p>
          {items.map((item, index) => {
            const product = products.find((product) => product._id === item.productId);
            return (
              <article key={`${item.productId}-${index}`} className="list-card">
                <h4>{product?.name || "Product"}</h4>
                <span>Qty: {item.quantity}</span>
                <span>Unit Cost: {item.unitCost}</span>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => handleRemoveItem(index)}
                >
                  Remove
                </button>
              </article>
            );
          })}
        </div>
      )}

      <div className="panel-list">
        {notice && <p className="muted">{notice}</p>}
        {orders.map((order) => (
          <article key={order._id} className="list-card">
            <h4>{order.supplier?.name || "Supplier"}</h4>
            <span>Status: {order.status}</span>
            <span>Subtotal: {order.subtotal}</span>
            <span>Receipts: {order.receipts?.length || 0}</span>
            <span>
              Expected: {order.expectedAt ? order.expectedAt.slice(0, 10) : "N/A"}
            </span>
            <button
              type="button"
              className="secondary"
              onClick={() => handleReceive(order._id)}
            >
              Receive Remaining
            </button>
          </article>
        ))}
      </div>
    </PanelShell>
  );
};

export default PurchaseOrdersPanel;
