import jwt from "jsonwebtoken";

async function main() {
  const token = jwt.sign({ id: 1 }, "your_super_secret_string", { expiresIn: "1h" });
  
  const res = await fetch("http://localhost:5000/api/admin/support", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  console.log("STATUS:", res.status);
  console.log("BODY:", await res.text());
}
main();
