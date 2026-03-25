// ============================================
// Mastra Tool - Document Chunking
// ============================================

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { chunk } from "@/lib/chunkText";

/**
 * Document Chunking Tool
 * Splits a document into manageable chunks for analysis
 */
export const documentChunkingTool = createTool({
  id: "document-chunking-tool",
  description:
    "Splits a document into smaller chunks for analysis. Uses recursive character text splitting with configurable size and overlap.",
  inputSchema: z.object({
    documentText: z.string().describe("The full document text to chunk"),
    chunkSize: z.number().optional().default(600).describe("Target chunk size in characters"),
    chunkOverlap: z.number().optional().default(100).describe("Overlap between chunks"),
  }),
  outputSchema: z.object({
    chunks: z.array(
      z.object({
        index: z.number(),
        text: z.string(),
        startPosition: z.number(),
        endPosition: z.number(),
      })
    ),
    totalChunks: z.number(),
    averageChunkSize: z.number(),
  }),
  execute: async ({ documentText, chunkSize = 600, chunkOverlap = 100 }) => {
    try {
      const chunkTexts = await chunk(documentText, chunkSize, chunkOverlap);

      // Calculate positions (approximate)
      let currentPosition = 0;
      const chunks = chunkTexts.map((text, index) => {
        const startPosition = currentPosition;
        const endPosition = startPosition + text.length;
        currentPosition = endPosition - chunkOverlap; // Account for overlap
        
        return {
          index,
          text,
          startPosition,
          endPosition,
        };
      });

      const totalLength = chunks.reduce((sum, c) => sum + c.text.length, 0);
      const averageChunkSize = chunks.length > 0 ? Math.round(totalLength / chunks.length) : 0;

      return {
        chunks,
        totalChunks: chunks.length,
        averageChunkSize,
      };
    } catch (error) {
      console.error("Document Chunking Error:", error);
      // Return single chunk on error
      return {
        chunks: [
          {
            index: 0,
            text: documentText,
            startPosition: 0,
            endPosition: documentText.length,
          },
        ],
        totalChunks: 1,
        averageChunkSize: documentText.length,
      };
    }
  },
});
