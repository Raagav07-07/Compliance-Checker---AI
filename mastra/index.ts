// ============================================
// Mastra Instance - Main Configuration
// ============================================

import { Mastra } from "@mastra/core";

// Import agents
import {
  classifierAgent,
  scorerAgent,
  recommenderAgent,
  aggregatorAgent,
} from "./agents";

// Import workflows
import { complianceWorkflow } from "./workflows";

/**
 * Main Mastra instance
 * Registers all agents and workflows for the compliance checking system
 */
export const mastra = new Mastra({
  agents: {
    classifierAgent,
    scorerAgent,
    recommenderAgent,
    aggregatorAgent,
  },
  workflows: {
    complianceWorkflow,
  },
});

// ============================================
// Helper Functions
// ============================================

/**
 * Get classifier agent
 */
export function getClassifierAgent() {
  return mastra.getAgent("classifierAgent");
}

/**
 * Get scorer agent
 */
export function getScorerAgent() {
  return mastra.getAgent("scorerAgent");
}

/**
 * Get recommender agent
 */
export function getRecommenderAgent() {
  return mastra.getAgent("recommenderAgent");
}

/**
 * Get aggregator agent
 */
export function getAggregatorAgent() {
  return mastra.getAgent("aggregatorAgent");
}

/**
 * Get compliance workflow
 */
export function getComplianceWorkflow() {
  return mastra.getWorkflow("complianceWorkflow");
}

/**
 * Run the compliance check workflow
 */
export async function runComplianceAnalysis(
  documentText: string,
  documentName?: string,
  category?: string
) {
  const workflow = getComplianceWorkflow();
  const run = await workflow.createRun();

  const result = await run.start({
    inputData: {
      documentText,
      documentName,
      category,
    },
  });

  return result;
}

// Export for external use
export default mastra;
