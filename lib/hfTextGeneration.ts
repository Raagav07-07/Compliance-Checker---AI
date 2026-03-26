type HfTextResponse =
  | Array<{ generated_text?: string }>
  | { generated_text?: string }
  | { error?: string };

export async function generateText(prompt: string): Promise<string> {
  const hfToken = process.env.hf_token;
  const model = process.env.HF_LLM_MODEL || "meta-llama/Llama-3.3-70B-Instruct";
  const endpoint =
    process.env.HF_LLM_ENDPOINT ||
    `https://api-inference.huggingface.co/models/${model}`;

  if (!endpoint) {
    throw new Error("Missing HF_LLM_ENDPOINT or HF_LLM_MODEL configuration");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (hfToken) {
    headers.Authorization = `Bearer ${hfToken}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 700,
        temperature: 0.2,
        return_full_text: false,
      },
    }),
  });

  let data: HfTextResponse;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Hugging Face text generation returned invalid JSON");
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data && "error" in data && data.error
        ? data.error
        : `Hugging Face text generation failed (${response.status})`;
    throw new Error(errorMessage);
  }

  if (Array.isArray(data)) {
    const text = data[0]?.generated_text?.trim();
    if (text) return text;
  }

  if (typeof data === "object" && data && "generated_text" in data) {
    const text = data.generated_text?.trim();
    if (text) return text;
  }

  throw new Error("Unexpected Hugging Face text generation response");
}
