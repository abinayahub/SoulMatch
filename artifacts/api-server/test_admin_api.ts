import { signAccessToken } from "./src/lib/auth";

async function run() {
  const token = signAccessToken({ userId: 1, email: "admin@soulmatch.com", role: "admin" });
  console.log("Token:", token);
  const res = await fetch("http://localhost:5000/api/admin/community-questions", {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
run();
