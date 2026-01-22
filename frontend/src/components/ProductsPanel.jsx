import { useEffect, useState } from "react";
import PanelShell from "./PanelShell.jsx";
import useApiClient from "./useApiClient.js";

const ProductsPanel = ({ client }) => {
  const { request } = useApiClient(client);
  const [products, setProducts] = useState([]);
  const [notice, setNotice] = useState("Loading products...");
  const [formState, setFormState] = useState({
    name: "",
    sku: "",
    description: "",
    unitPrice: "",
    currency: "USD",
  });

  const loadProducts = async () => {
    try {
      const data = await request("/products");
      setProducts(data.data);
      setNotice(data.data.length ? "" : "No products yet.");
    } catch (error) {
      setNotice("Unable to load products.");
    }
  };

  useEffect(() => {
    loadProducts();
  }, [client.apiBase, client.subscriptionKey, client.tenantId, client.authToken]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await request("/products", {
        method: "POST",
        body: JSON.stringify({
          name: formState.name,
          sku: formState.sku,
          description: formState.description,
          unitPrice: Number(formState.unitPrice),
          currency: formState.currency,
        }),
      });
      setFormState({
        name: "",
        sku: "",
        description: "",
        unitPrice: "",
        currency: "USD",
      });
      loadProducts();
    } catch (error) {
      setNotice("Failed to add product.");
    }
  };

  return (
    <PanelShell
      title="Products"
      description="Create and manage the catalog used for inventory and sales."
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
          name="sku"
          value={formState.sku}
          onChange={handleChange}
          placeholder="SKU"
          required
        />
        <input
          name="description"
          value={formState.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <input
          name="unitPrice"
          type="number"
          min="0"
          step="0.01"
          value={formState.unitPrice}
          onChange={handleChange}
          placeholder="Unit Price"
          required
        />
        <input
          name="currency"
          value={formState.currency}
          onChange={handleChange}
          placeholder="Currency"
        />
        <button type="submit">Add Product</button>
      </form>
      <div className="panel-list">
        {notice && <p className="muted">{notice}</p>}
        {products.map((product) => (
          <article key={product._id} className="list-card">
            <h4>{product.name}</h4>
            <span>SKU: {product.sku}</span>
            <span>
              {product.unitPrice} {product.currency}
            </span>
          </article>
        ))}
      </div>
    </PanelShell>
  );
};

export default ProductsPanel;
