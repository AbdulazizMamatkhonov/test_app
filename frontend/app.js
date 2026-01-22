const apiBaseInput = document.querySelector("#apiBase");
const saveApiButton = document.querySelector("#saveApiBase");
const subscriptionKeyInput = document.querySelector("#subscriptionKey");
const checkSubscriptionButton = document.querySelector("#checkSubscription");
const subscriptionStatus = document.querySelector("#subscriptionStatus");

const productForm = document.querySelector("#productForm");
const productList = document.querySelector("#productList");
const customerForm = document.querySelector("#customerForm");
const customerList = document.querySelector("#customerList");
const saleForm = document.querySelector("#saleForm");
const salesList = document.querySelector("#salesList");
const paymentForm = document.querySelector("#paymentForm");
const paymentList = document.querySelector("#paymentList");
const debtForm = document.querySelector("#debtForm");
const debtResult = document.querySelector("#debtResult");

const loadApiBase = () => {
  const saved = localStorage.getItem("apiBase") || "http://localhost:3000";
  apiBaseInput.value = saved;
  return saved;
};

const loadSubscriptionKey = () => {
  const saved = localStorage.getItem("subscriptionKey") || "";
  subscriptionKeyInput.value = saved;
  return saved;
};

const setNotice = (element, message) => {
  element.innerHTML = `<p class="notice">${message}</p>`;
};

const renderList = (element, items, formatter) => {
  if (!items || items.length === 0) {
    setNotice(element, "No records yet.");
    return;
  }

  element.innerHTML = items.map(formatter).join("");
};

const apiRequest = async (path, options = {}) => {
  const base = apiBaseInput.value.trim();
  const subscriptionKey = subscriptionKeyInput.value.trim();
  const response = await fetch(`${base}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(subscriptionKey ? { "x-subscription-key": subscriptionKey } : {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const refreshProducts = async () => {
  const data = await apiRequest("/products");
  renderList(productList, data.data, (item) => `
    <div class="list-item">
      <strong>${item.name}</strong>
      <div>SKU: ${item.sku}</div>
      <div>Price: ${item.unitPrice} ${item.currency}</div>
    </div>
  `);
};

const refreshCustomers = async () => {
  const data = await apiRequest("/customers");
  renderList(customerList, data.data, (item) => `
    <div class="list-item">
      <strong>${item.name}</strong>
      <div>Phone: ${item.phone || "-"}</div>
      <div>Email: ${item.email || "-"}</div>
    </div>
  `);
};

const refreshSales = async () => {
  const data = await apiRequest("/sales");
  renderList(salesList, data.data, (item) => `
    <div class="list-item">
      <strong>Sale ${item._id}</strong>
      <div>Total: ${item.total}</div>
      <div>Status: ${item.status}</div>
    </div>
  `);
};

const refreshPayments = async () => {
  const data = await apiRequest("/payments");
  renderList(paymentList, data.data, (item) => `
    <div class="list-item">
      <strong>Payment ${item._id}</strong>
      <div>Amount: ${item.amount}</div>
      <div>Method: ${item.method}</div>
    </div>
  `);
};

const refreshAll = async () => {
  try {
    await Promise.all([
      refreshProducts(),
      refreshCustomers(),
      refreshSales(),
      refreshPayments(),
    ]);
  } catch (error) {
    setNotice(productList, "Unable to load data. Check API base URL/subscription.");
    setNotice(customerList, "Unable to load data. Check API base URL/subscription.");
    setNotice(salesList, "Unable to load data. Check API base URL/subscription.");
    setNotice(paymentList, "Unable to load data. Check API base URL/subscription.");
  }
};

const updateSubscriptionStatus = (message) => {
  subscriptionStatus.textContent = message;
};

const checkSubscription = async () => {
  try {
    const data = await apiRequest("/subscriptions/status");
    updateSubscriptionStatus(
      `Status: ${data.data.status} | Plan: ${data.data.plan}`
    );
  } catch (error) {
    updateSubscriptionStatus("Subscription check failed.");
  }
};

saveApiButton.addEventListener("click", () => {
  localStorage.setItem("apiBase", apiBaseInput.value.trim());
  localStorage.setItem("subscriptionKey", subscriptionKeyInput.value.trim());
  refreshAll();
});

checkSubscriptionButton.addEventListener("click", () => {
  localStorage.setItem("subscriptionKey", subscriptionKeyInput.value.trim());
  checkSubscription();
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(productForm);

  await apiRequest("/products", {
    method: "POST",
    body: JSON.stringify({
      name: formData.get("name"),
      sku: formData.get("sku"),
      description: formData.get("description"),
      unitPrice: Number(formData.get("unitPrice")),
      currency: formData.get("currency"),
    }),
  });

  productForm.reset();
  await refreshProducts();
});

customerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(customerForm);

  await apiRequest("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
    }),
  });

  customerForm.reset();
  await refreshCustomers();
});

saleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(saleForm);

  await apiRequest("/sales", {
    method: "POST",
    body: JSON.stringify({
      customerId: formData.get("customerId") || undefined,
      items: JSON.parse(formData.get("items")),
      discount: Number(formData.get("discount")) || 0,
      paidAmount: Number(formData.get("paidAmount")) || 0,
      paymentMethod: formData.get("paymentMethod"),
    }),
  });

  saleForm.reset();
  await refreshSales();
});

paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(paymentForm);

  await apiRequest("/payments", {
    method: "POST",
    body: JSON.stringify({
      customerId: formData.get("customerId"),
      saleId: formData.get("saleId") || undefined,
      amount: Number(formData.get("amount")),
      method: formData.get("method"),
      note: formData.get("note"),
    }),
  });

  paymentForm.reset();
  await refreshPayments();
});

debtForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(debtForm);
  const customerId = formData.get("customerId");

  const data = await apiRequest(`/debts/customers/${customerId}`);
  debtResult.innerHTML = `
    <div class="list-item">
      <strong>Customer ${data.data.customerId}</strong>
      <div>Total Sales: ${data.data.totalSales}</div>
      <div>Total Payments: ${data.data.totalPayments}</div>
      <div>Outstanding: ${data.data.outstanding}</div>
    </div>
  `;
});

loadApiBase();
loadSubscriptionKey();
refreshAll();
