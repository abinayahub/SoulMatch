async function test() {
  console.log("Key:", process.env.OPENAI_API_KEY ? "Set" : "Not Set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Say hello and return JSON format { \"msg\": \"hello\" }" }],
      response_format: { type: "json_object" }
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
