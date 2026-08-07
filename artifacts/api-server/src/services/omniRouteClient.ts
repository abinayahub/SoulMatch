import { DEFAULT_AI_MODEL, FALLBACK_AI_MODEL, OMNIROUTE_BASE_URL, OMNIROUTE_API_KEY } from '../config/aiConfig';

export interface AIResponse<T = any> {
  data: T | null;
  error?: string;
  modelUsed: string;
}

export async function generateAIResponse<T = any>(
  systemInstruction: string,
  userPrompt: string,
  jsonSchema?: any
): Promise<AIResponse<T>> {
  if (!OMNIROUTE_API_KEY) {
    return { data: null, error: "AI insights are temporarily unavailable (No API Key).", modelUsed: "none" };
  }

  // Define models to try in order
  const modelsToTry = [DEFAULT_AI_MODEL, FALLBACK_AI_MODEL];
  let lastError = "";

  for (const model of modelsToTry) {
    try {
      const payload: any = {
        model: model,
        stream: false,
        messages: []
      };

      if (systemInstruction) {
        payload.messages.push({ role: "system", content: systemInstruction });
      }
      payload.messages.push({ role: "user", content: userPrompt });

      // Add structured output if schema is provided
      if (jsonSchema) {
        payload.response_format = {
          type: "json_schema",
          json_schema: {
            name: "structured_output",
            schema: jsonSchema,
            strict: false // Some providers don't support strict: true yet
          }
        };
      }

      const response = await fetch(`${OMNIROUTE_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OMNIROUTE_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      const textResponse = await response.text();
      let data: any;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        // SSE parsing fallback for buggy proxies
        if (textResponse.includes("data: ")) {
          const lines = textResponse.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content) {
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
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      const reply = data.choices?.[0]?.message?.content;
      if (!reply) {
        throw new Error("Invalid response format (missing choices)");
      }

      // If jsonSchema was provided, we must parse the reply
      let parsedData = reply;
      if (jsonSchema) {
        let cleanJson = reply.replace(/```json/gi, "").replace(/```/g, "").trim();
        try {
          parsedData = JSON.parse(cleanJson);
        } catch (parseErr) {
          console.warn("Failed to parse JSON response directly. Returning raw string.");
        }
      }

      return {
        data: parsedData as T,
        modelUsed: model
      };
    } catch (err: any) {
      console.warn(`[OmniRoute] Model ${model} failed: ${err.message}. ${model === DEFAULT_AI_MODEL ? 'Trying fallback...' : ''}`);
      lastError = err.message;
      // Continue to next model
    }
  }

  console.error("[OmniRoute] All AI models failed.");
  return {
    data: null,
    error: lastError || "All AI models failed.",
    modelUsed: "none"
  };
}
