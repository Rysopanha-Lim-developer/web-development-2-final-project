
const BASE_URL = "http://localhost:3001/api";

// Get the logged-in demo user
export const getAccount = () => {
  try {
    const user = JSON.parse(localStorage.getItem("account"));
    return user?.id != null ? user : null;
  } catch {
    return null;
  }
}

// Ask the visitor to log in if needed
export const requireAccount = () => {
  const user = getAccount();

  if (!user) {
    alert("Please log in first.");
    window.location.href = "loginForm.html";
    return null;
  }

  return user;
}

// Reusable function for Mockoon requests
export const apiRequest =  async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Mockoon API error: ${response.status}`);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// GET records belonging to one demo user
export const listByUser = (resource, userId) =>
  apiRequest(
    `${resource}?userId_eq=${encodeURIComponent(String(userId))}`
  );

// POST a new record
export const insert = (resource, data) =>
  apiRequest(resource, {
    method: "POST",
    body: JSON.stringify(data)
  });

// DELETE a record by its ID
export const remove = (resource, id) =>
  apiRequest(
    `${resource}/${encodeURIComponent(String(id))}`,
    { method: "DELETE" }
  );
