import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const token = jwt.sign({ userId: 1, email: 'test@example.com', role: 'user' }, 'soulmatch-secret-dev-2024');

async function run() {
  console.log("Token:", token);
  try {
    const res = await fetch("http://localhost:5000/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ content: "test note from script" })
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:", text);
  } catch(e) {
    console.error("FETCH ERROR:", e);
  }
}
run();
