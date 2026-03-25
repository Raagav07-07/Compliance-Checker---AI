// ============================================
// Classifier Agent - Auto-detect Document Category
// ============================================

import { generateText } from "../langchainHf";
import {
  ClassifierInput,
  ClassifierOutput,
  DocumentCategory,
} from "../types";


/**
 * Classifier Agent Logic
 * Analyzes document content to automatically determine the category
 * Returns category with confidence score
 */
export async function classifyDocument(
  input: ClassifierInput
): Promise<ClassifierOutput> {
  // Use first 3000 chars for efficiency
  const sampleText = input.documentText.substring(0, 3000);

  const prompt = `You are a document classification expert. Analyze the following document excerpt and classify it into one of these categories:

1. **IT** - Information Technology policies, cybersecurity, data protection, software usage, network security, IT governance, system access, etc.

2. **RETAIL** - Retail business policies, customer service, sales policies, inventory management, store operations, pricing policies, returns/refunds, etc.

3. **CUSTOM** - Any other domain that doesn't fit IT or RETAIL categories (HR policies, finance, legal, healthcare, manufacturing, etc.)

Document Excerpt:
"""
${sampleText}
"""

Analyze the document and respond in the following JSON format ONLY (no markdown, no code blocks):
{
  "category": "IT" | "RETAIL" | "CUSTOM",
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation of why this category was chosen",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Important:
- confidence should be between 0.0 and 1.0
- Pick the most specific category that applies
- List 3-5 keywords that influenced your decision`;

  try {
    const responseText = await generateText(prompt);

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse classifier response as JSON");
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate and normalize the response
    const validCategories: DocumentCategory[] = ["IT", "RETAIL", "CUSTOM"];
    const category = validCategories.includes(result.category)
      ? result.category
      : "CUSTOM";

    const confidence = Math.min(1, Math.max(0, parseFloat(result.confidence) || 0.5));

    return {
      category: category as DocumentCategory,
      confidence,
      reasoning: result.reasoning || "Classification based on document content analysis",
      keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 5) : [],
    };
  } catch (error) {
    console.error("Classifier Agent Error:", error);
    // Return default with low confidence on error
    return {
      category: "CUSTOM",
      confidence: 0.3,
      reasoning: "Unable to classify document, defaulting to CUSTOM category",
      keywords: [],
    };
  }
}

/**
 * Check if classification confidence meets threshold
 */
export function isConfidentClassification(
  output: ClassifierOutput,
  threshold: number = 0.85
): boolean {
  return output.confidence >= threshold;
}
