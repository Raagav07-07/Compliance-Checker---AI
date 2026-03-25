// ============================================
// Mastra Tool - Policy Retrieval
// ============================================

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { embedText } from "@/lib/embedText";
import { getCreateCollection } from "@/lib/policyVectorStore";

/**
 * Policy Retrieval Tool
 * Retrieves relevant policies from the vector store based on semantic similarity
 */
export const policyRetrievalTool = createTool({
  id: "policy-retrieval-tool",
  description:
    "Retrieves relevant policy documents from the vector database based on semantic similarity to the input text. Use this to find policies that may apply to a document chunk.",
  inputSchema: z.object({
    queryText: z.string().describe("The text to search for relevant policies"),
    category: z.string().describe("The document category (IT, RETAIL, CUSTOM)"),
    topK: z.number().optional().default(4).describe("Number of results to return"),
  }),
  outputSchema: z.object({
    policies: z.array(z.string()).describe("Retrieved policy texts"),
    ids: z.array(z.string()).describe("Policy chunk IDs"),
    distances: z.array(z.number()).describe("Similarity distances"),
    retrievalTimeMs: z.number().describe("Time taken for retrieval"),
  }),
  execute: async ({ queryText, category, topK = 4 }) => {
    const startTime = Date.now();

    try {
      // Generate embedding for query
      const queryEmbedding = await embedText([queryText]);

      // Get collection and query
      const collection = await getCreateCollection();
      const results = await collection.query({
        queryEmbeddings: queryEmbedding,
        nResults: topK,
        where: { category },
      });

      // Extract results
      const policies = (results.documents?.[0] || []).filter(
        (doc: string | null): doc is string => doc !== null
      );
      const ids = results.ids?.[0] || [];
      const distances = results.distances?.[0] || [];

      return {
        policies,
        ids,
        distances,
        retrievalTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error("Policy Retrieval Error:", error);
      return {
        policies: [],
        ids: [],
        distances: [],
        retrievalTimeMs: Date.now() - startTime,
      };
    }
  },
});
