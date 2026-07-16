import 'dotenv/config';
import { signAccessToken } from "./artifacts/api-server/src/lib/auth.ts";

const token = signAccessToken({ userId: 1, email: "kavi@gmail.com", role: "user" });
console.log("Token:", token);

fetch(`${process.env.API_URL}/api/users/me`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
}).then(res => res.json()).then(data => console.log("Profile:", data.profileCompleteness)).catch(console.error);
