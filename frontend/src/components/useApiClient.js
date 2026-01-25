const parseErrorMessage = async (response) => {
  try {
    const text = await response.text();
    return text || "Request failed";
  } catch (error) {
    return "Request failed";
  }
};

const useApiClient = ({ apiBase, subscriptionKey }) => {
  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(subscriptionKey ? { "x-subscription-key": subscriptionKey } : {}),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  return { request };
};

export default useApiClient;
