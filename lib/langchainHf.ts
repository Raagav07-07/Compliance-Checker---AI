import "server-only";

import { HuggingFaceInference } from "@langchain/community/llms/hf";

let llmClient: HuggingFaceInference | null = null;

function getClient() {
  if (llmClient) return llmClient;

  const apiKey = process.env.HF_TOKEN || process.env.hf_token;
  if (!apiKey) {
    throw new Error("Missing Hugging Face token (HF_TOKEN or hf_token)");
  }

  const model =
    process.env.HF_LLM_MODEL || "meta-llama/Llama-3.1-8B-Instruct";

  llmClient = new HuggingFaceInference({
    apiKey,
    model,
    temperature: 0.2,
    maxNewTokens: 700,
  });

  return llmClient;
}

export async function generateText(prompt: string): Promise<string> {
  const client = getClient();
  const response = await client.invoke(prompt);

  if (typeof response === "string") {
    return response;
  }

  return JSON.stringify(response);
}
