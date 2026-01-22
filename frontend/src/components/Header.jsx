import { useState } from "react";

const Header = ({ onSave }) => {
  const [apiBaseUrl, setApiBaseUrl] = useState(
    localStorage.getItem("apiBase") || "http://localhost:3000"
  );
  const [subscription, setSubscription] = useState(
    localStorage.getItem("subscriptionKey") || ""
  );
  const [statusMessage, setStatusMessage] = useState("Subscription not checked yet.");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({ apiBaseUrl, subscription });
  };

  const handleCheck = async () => {
    if (!subscription) {
      setStatusMessage("Enter a subscription key to check status.");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/subscriptions/status`, {
        headers: {
          "x-subscription-key": subscription,
        },
      });

      if (!response.ok) {
        setStatusMessage("Subscription check failed.");
        return;
      }

      const data = await response.json();
      setStatusMessage(`Status: ${data.data.status} | Plan: ${data.data.plan}`);
    } catch (error) {
      setStatusMessage("Subscription check failed.");
    }
  };

  return (
    <header className="header">
      <div>
        <h2>Operations Dashboard</h2>
        <p>Manage your shop inventory, sales, and customer debt in real time.</p>
      </div>
      <form className="settings" onSubmit={handleSubmit}>
        <label>
          API Base URL
          <input
            type="text"
            value={apiBaseUrl}
            onChange={(event) => setApiBaseUrl(event.target.value)}
          />
        </label>
        <label>
          Subscription Key
          <input
            type="text"
            value={subscription}
            onChange={(event) => setSubscription(event.target.value)}
          />
        </label>
        <div className="settings-actions">
          <button type="submit">Save</button>
          <button type="button" className="secondary" onClick={handleCheck}>
            Check
          </button>
        </div>
        <span className="status">{statusMessage}</span>
      </form>
    </header>
  );
};

export default Header;
