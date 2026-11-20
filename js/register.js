
import { apiRequest } from "./mockoon-api.js";

const form = document.getElementById("glass-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  try {
    const existing = await apiRequest(
      `users?email_eq=${encodeURIComponent(email)}`
    );

    if (existing.length > 0) {
      alert("This email is already registered.");
      return;
    }

    const user = await apiRequest("users", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        password
      })
    });

    if (!user?.id) {
      throw new Error("Registration did not return a user ID");
    }

    alert("Registration successful! Please log in.");
    window.location.href = "loginForm.html";

  } catch (error) {
    console.error(error);
    alert("Registration failed. Make sure Mockoon is running.");
  }
});
