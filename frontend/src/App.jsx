import { useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import OverviewCard from "./components/OverviewCard.jsx";
import ProductsPanel from "./components/ProductsPanel.jsx";
import CustomersPanel from "./components/CustomersPanel.jsx";
import SalesPanel from "./components/SalesPanel.jsx";
import PaymentsPanel from "./components/PaymentsPanel.jsx";
import DebtPanel from "./components/DebtPanel.jsx";
import SuppliersPanel from "./components/SuppliersPanel.jsx";
import PurchaseOrdersPanel from "./components/PurchaseOrdersPanel.jsx";

const panels = [
  { id: "products", label: "Products" },
  { id: "customers", label: "Customers" },
  { id: "sales", label: "Sales" },
  { id: "payments", label: "Payments" },
  { id: "debts", label: "Debt" },
  { id: "suppliers", label: "Suppliers" },
  { id: "purchase-orders", label: "Purchase Orders" },
];

const App = () => {
  const [apiBase, setApiBase] = useState(
    localStorage.getItem("apiBase") || "http://localhost:3000"
  );
  const [subscriptionKey, setSubscriptionKey] = useState(
    localStorage.getItem("subscriptionKey") || ""
  );
  const [tenantId, setTenantId] = useState(localStorage.getItem("tenantId") || "");
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("authToken") || ""
  );
  const [activePanel, setActivePanel] = useState("products");

  const client = useMemo(
    () => ({
      apiBase,
      subscriptionKey,
      tenantId,
      authToken,
    }),
    [apiBase, subscriptionKey, tenantId, authToken]
  );

  const handleSettingsSave = ({
    apiBaseUrl,
    subscription,
    tenantId: nextTenantId,
    authToken: nextAuthToken,
  }) => {
    localStorage.setItem("apiBase", apiBaseUrl);
    localStorage.setItem("subscriptionKey", subscription);
    localStorage.setItem("tenantId", nextTenantId);
    localStorage.setItem("authToken", nextAuthToken);
    setApiBase(apiBaseUrl);
    setSubscriptionKey(subscription);
    setTenantId(nextTenantId);
    setAuthToken(nextAuthToken);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>StockFlow</h1>
          <span>Operations Console</span>
        </div>
        <nav className="nav">
          {panels.map((panel) => (
            <button
              key={panel.id}
              className={activePanel === panel.id ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => setActivePanel(panel.id)}
            >
              {panel.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>Connected to</p>
          <strong>{apiBase}</strong>
        </div>
      </aside>

      <main className="main-content">
        <Header onSave={handleSettingsSave} />
        <section className="overview">
          <OverviewCard
            title="Sales" 
            value="Track revenue and payment status"
            description="Record sales with debt handling and quick payment capture."
          />
          <OverviewCard
            title="Inventory"
            value="Monitor stock movement"
            description="Track inbound deliveries, sales usage, and adjustments."
          />
          <OverviewCard
            title="Subscriptions"
            value="Manage access"
            description="Subscription keys control access for each customer."
          />
        </section>

        <section className="content-grid">
          {activePanel === "products" && <ProductsPanel client={client} />}
          {activePanel === "customers" && <CustomersPanel client={client} />}
          {activePanel === "sales" && <SalesPanel client={client} />}
          {activePanel === "payments" && <PaymentsPanel client={client} />}
          {activePanel === "debts" && <DebtPanel client={client} />}
          {activePanel === "suppliers" && <SuppliersPanel client={client} />}
          {activePanel === "purchase-orders" && <PurchaseOrdersPanel client={client} />}
        </section>
      </main>
    </div>
  );
};

export default App;
