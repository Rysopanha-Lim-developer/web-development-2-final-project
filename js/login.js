
import { apiRequest } from "./mockoon-api.js";

const form = document.getElementById("glass-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  try {
    const users = await apiRequest(
      `users?email_eq=${encodeURIComponent(email)}`
    );

    const user = users.find((item) =>
      item.username === username &&
      item.email.toLowerCase() === email &&
      item.password === password
    );

    if (!user) {
      alert("Incorrect username, email, or password.");
      return;
    }

    // Remember the demo session, not the password
    localStorage.setItem("account", JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email
    }));

    window.location.href = "account.html";

  } catch (error) {
    console.error(error);
    alert("Cannot connect to Mockoon. Check port 3001.");
  }
});
