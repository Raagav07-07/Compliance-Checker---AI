type EmbeddingResponse = number[][] | Array<{ embedding: number[] }>;

export async function embedText(texts: string[]): Promise<number[][]> {
  const apiUrl = process.env.api_url;
  const hfToken = process.env.hf_token;

  if (!apiUrl) {
    throw new Error("Missing embedding configuration: api_url");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (hfToken) {
    headers.Authorization = `Bearer ${hfToken}`;
  }

  const resp = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ inputs: texts }),
  });

  let data: EmbeddingResponse | { error?: string } | { message?: string };
  try {
    data = await resp.json();
  } catch (error) {
    throw new Error("Embedding request returned invalid JSON");
  }

  if (!resp.ok) {
    const errorMessage =
      (typeof data === "object" && data && "error" in data && data.error) ||
      (typeof data === "object" && data && "message" in data && data.message) ||
      `Embedding request failed (${resp.status})`;
    throw new Error(errorMessage as string);
  }

  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data as number[][];
  }

  if (Array.isArray(data) && (data[0] as { embedding?: number[] })?.embedding) {
    return (data as Array<{ embedding: number[] }>).map((item) => item.embedding);
  }

  throw new Error("Unexpected embedding response format");
}
