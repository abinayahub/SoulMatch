async function main() {
  try {
    const res = await fetch("http://localhost:5000/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test", email: "test@test.com", subject: "test", message: "test" })
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
}
main();
