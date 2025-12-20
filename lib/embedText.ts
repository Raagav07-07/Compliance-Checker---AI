export async function embedText(texts: string[]): Promise<number[][]> {
    const resp = await fetch(process.env.api_url!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.hf_token}`
        },
        body: JSON.stringify({ inputs: texts })
    });
    const data = await resp.json();
    if(Array.isArray(data) && Array.isArray(data[0])) return data
     if (Array.isArray(data) && data[0]?.embedding) {
    return data.map((d: any) => d.embedding);
  }
      throw new Error("Unexpected embedding response format");}