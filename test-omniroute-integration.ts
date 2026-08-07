const OMNIROUTE_API_KEY = process.env.OMNIROUTE_API_KEY!;
const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || "http://localhost:20128/v1";

interface ModelListResponse {
  data: { id: string }[];
}

interface TestResult {
  modelId: string;
  provider: string;
  status: number;
  latencyMs: number;
  success: boolean;
  message: string;
}

async function testOmniRoute() {
  console.log("==========================================");
  console.log("🚀 Starting OmniRoute Integration Test");
  console.log("==========================================\n");

  if (!OMNIROUTE_API_KEY) {
    console.error("❌ ERROR: OMNIROUTE_API_KEY is missing from environment variables.");
    process.exit(1);
  }

  console.log(`Checking OmniRoute at: ${OMNIROUTE_BASE_URL}...`);
  
  // 1. Detect Models
  let models: string[] = [];
  try {
    const res = await fetch(`${OMNIROUTE_BASE_URL}/models`, {
      headers: { "Authorization": `Bearer ${OMNIROUTE_API_KEY}` }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as ModelListResponse;
    models = data.data.map(m => m.id);
    console.log(`✅ OmniRoute is reachable. Found ${models.length} available models.\n`);
  } catch (e: any) {
    console.error(`❌ ERROR: OmniRoute is unreachable or /models endpoint failed: ${e.message}`);
    process.exit(1);
  }

  // 2. Group by provider
  // Standard format is provider/model-name
  const providers: Record<string, string[]> = {};
  for (const model of models) {
    const parts = model.split("/");
    const provider = parts.length > 1 ? parts[0] : "unknown";
    if (!providers[provider]) providers[provider] = [];
    providers[provider].push(model);
  }

  const providerNames = Object.keys(providers);
  console.log(`Detected Providers: ${providerNames.join(", ") || "None"}\n`);

  // Order providers (Prioritize Gemini, then Groq, then others)
  const orderedProviders = [
    ...providerNames.filter(p => p.toLowerCase() === "gemini"),
    ...providerNames.filter(p => p.toLowerCase() === "groq"),
    ...providerNames.filter(p => p.toLowerCase() !== "gemini" && p.toLowerCase() !== "groq")
  ];

  const results: TestResult[] = [];
  let selectedModel = "";
  let selectedProvider = "";
  let testPassed = false;

  console.log("==========================================");
  console.log("🛠️ Testing Models with Fallback Logic");
  console.log("==========================================\n");

  for (const provider of orderedProviders) {
    if (testPassed) break;
    
    console.log(`\n▶️ Testing Provider: [${provider.toUpperCase()}]`);
    const providerModels = providers[provider];

    for (const modelId of providerModels) {
      console.log(`  - Testing model: ${modelId}...`);
      
      const startTime = Date.now();
      let status = 0;
      let latency = 0;
      let success = false;
      let message = "";
      
      try {
        const response = await fetch(`${OMNIROUTE_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OMNIROUTE_API_KEY}`
          },
          body: JSON.stringify({
            model: modelId,
            stream: false,
            messages: [{ role: "user", content: "Hello, this is a connection test. Reply with a short greeting." }]
          })
        });

        status = response.status;
        latency = Date.now() - startTime;
        
        const textResponse = await response.text();
        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          // If it fails, check if it's SSE format (starts with data: )
          if (textResponse.includes("data: ")) {
            const lines = textResponse.split('\n').filter(l => l.startsWith('data: '));
            for (const line of lines) {
              const jsonStr = line.replace('data: ', '').trim();
              if (jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content) {
                  // Merge if it's a stream
                  if (!data) data = { choices: [{ message: { content: "" } }] };
                  data.choices[0].message.content += (parsed.choices[0].delta?.content || parsed.choices[0].message?.content || "");
                }
                if (parsed.error) data = parsed;
              } catch(err){}
            }
            if (!data) throw new Error(`Invalid JSON returned: ${textResponse.slice(0, 50)}...`);
          } else {
            throw new Error(`Invalid JSON returned: ${textResponse.slice(0, 50)}...`);
          }
        }

        if (!response.ok) {
          throw new Error(data.error?.message || `HTTP ${status}`);
        }

        const reply = data.choices?.[0]?.message?.content;
        if (!reply) {
          throw new Error("Invalid response format (missing choices)");
        }

        success = true;
        message = reply.trim();
        selectedModel = modelId;
        selectedProvider = provider;
        testPassed = true;

        results.push({ modelId, provider, status, latencyMs: latency, success, message });
        
        console.log(`    ✅ Success! Latency: ${latency}ms | Status: ${status}`);
        console.log(`    💬 AI Response: "${message}"`);
        break; // Stop testing other models in this provider because we found a working one
      } catch (err: any) {
        latency = Date.now() - startTime;
        message = err.message || "Unknown error";
        results.push({ modelId, provider, status, latencyMs: latency, success, message });
        
        console.log(`    ❌ Failed! Latency: ${latency}ms | Status: ${status}`);
        console.log(`       Reason: ${message}`);
        console.log(`       Trying next model...`);
      }
    }
  }

  // 3. Summary Report
  console.log("\n==========================================");
  console.log("📋 SUMMARY REPORT");
  console.log("==========================================");
  console.log(`✓ OmniRoute Status: Reachable`);
  console.log(`✓ Connected Providers: ${providerNames.join(", ") || "None"}`);
  
  const workingModels = results.filter(r => r.success).map(r => r.modelId);
  const failedModels = results.filter(r => !r.success).map(r => r.modelId);
  
  console.log(`✓ Working Models: ${workingModels.length > 0 ? workingModels.join(", ") : "None"}`);
  console.log(`✓ Failed Models: ${failedModels.length > 0 ? failedModels.join(", ") : "None"}`);
  
  if (testPassed) {
    console.log(`✓ Selected Model: ${selectedModel}`);
    console.log(`✓ Provider Used: ${selectedProvider}`);
    console.log(`✓ Final Result: PASS ✅`);
  } else {
    console.log(`✓ Selected Model: N/A`);
    console.log(`✓ Provider Used: N/A`);
    console.log(`✓ Final Result: FAIL ❌`);
    console.log(`\nℹ️ All available models across all providers failed. Check your API keys and rate limits.`);
  }
}

testOmniRoute();
