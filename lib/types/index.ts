// ============================================
// AI Compliance Checker - Type Definitions
// ============================================

// Document Categories
export type DocumentCategory = "IT" | "RETAIL" | "CUSTOM";

// Severity Levels
export type SeverityLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Compliance Status
export type ComplianceStatus = "COMPLIANT" | "VIOLATION" | "NEEDS_REVIEW";

// Overall Report Status
export type ReportStatus = "COMPLIANT" | "AT_RISK" | "NON_COMPLIANT";

// Priority Levels
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Effort Levels
export type EffortLevel = "LOW" | "MEDIUM" | "HIGH";

// ============================================
// Classifier Agent Types
// ============================================

export interface ClassifierInput {
  documentText: string;
}

export interface ClassifierOutput {
  category: DocumentCategory;
  confidence: number;
  reasoning: string;
  keywords: string[];
}

// ============================================
// Chunker Agent Types
// ============================================

export interface ChunkerInput {
  documentText: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface ChunkMetadata {
  index: number;
  text: string;
  startPosition: number;
  endPosition: number;
}

export interface ChunkerOutput {
  chunks: ChunkMetadata[];
  totalChunks: number;
  averageChunkSize: number;
}

// ============================================
// Retriever Agent Types
// ============================================

export interface RetrieverInput {
  chunkText: string;
  category: string;
  topK?: number;
}

export interface RetrievedPolicy {
  id: string;
  text: string;
  distance: number;
  policyId: string;
  chunkIndex: number;
}

export interface RetrieverOutput {
  policies: RetrievedPolicy[];
  retrievalTimeMs: number;
}

// ============================================
// Scorer Agent Types
// ============================================

export interface ScorerInput {
  chunkText: string;
  chunkIndex: number;
  policies: string[];
}

export interface Violation {
  id: string;
  description: string;
  policyClause: string;
  severity: Exclude<SeverityLevel, "NONE">;
  evidence: string;
}

export interface ScorerOutput {
  status: ComplianceStatus;
  violationScore: number;
  severity: SeverityLevel;
  violations: Violation[];
  reasoning: string;
}

// ============================================
// Recommender Agent Types
// ============================================

export interface RecommenderInput {
  violations: Array<Violation & { chunkIndex: number }>;
  chunkText: string;
  category: string;
}

export interface Recommendation {
  id: string;
  violationId: string;
  action: string;
  priority: PriorityLevel;
  effort: EffortLevel;
  expectedImpact: string;
  policyReference: string;
  riskIfIgnored: string;
}

export interface RecommenderOutput {
  recommendations: Recommendation[];
}

// ============================================
// Aggregator Agent Types
// ============================================

export interface DocumentMetadata {
  name: string;
  category: DocumentCategory;
  confidence: number;
  analyzedAt: string;
}

export interface ChunkAnalysisResult {
  chunkIndex: number;
  chunkText: string;
  status: ComplianceStatus;
  violationScore: number;
  severity: SeverityLevel;
  violations: Violation[];
  recommendations: Recommendation[];
  retrievedPolicies: string[];
}

export interface AggregatorInput {
  documentMetadata: DocumentMetadata;
  chunkAnalysis: ChunkAnalysisResult[];
}

export interface ViolationsByGrade {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ComplianceReport {
  reportId: string;
  
  // Document Info
  documentMetadata: DocumentMetadata;
  
  // Executive Summary
  overallComplianceScore: number;
  status: ReportStatus;
  executiveSummary: string;
  
  // Statistics
  totalChunks: number;
  compliantChunks: number;
  violationChunks: number;
  needsReviewChunks: number;
  
  // Violation Breakdown
  violationsByGrade: ViolationsByGrade;
  
  // All Recommendations (deduplicated, prioritized)
  recommendations: Recommendation[];
  
  // Detailed Analysis
  detailedAnalysis: ChunkAnalysisResult[];
  
  // Audit Trail
  processingTimeMs: number;
  analyzedAt: string;
  expiresAt: string;
  workflowRunId?: string;
}

// ============================================
// Workflow Types
// ============================================

export interface ComplianceWorkflowInput {
  documentText: string;
  documentName?: string;
  category?: DocumentCategory;
}

export interface ComplianceWorkflowOutput {
  success: boolean;
  report?: ComplianceReport;
  error?: string;
  requiresManualClassification?: boolean;
  suggestedCategory?: DocumentCategory;
  confidence?: number;
}

// ============================================
// MongoDB Schema Types
// ============================================

export interface StoredComplianceReport extends ComplianceReport {
  _id?: string;
  documentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API Request/Response Types
// ============================================

export interface ComplianceCheckRequest {
  documentText: string;
  documentName?: string;
  category?: DocumentCategory;
}

export interface ComplianceCheckResponse {
  success: boolean;
  report?: ComplianceReport;
  error?: string;
  requiresManualClassification?: boolean;
  suggestedCategory?: DocumentCategory;
  confidence?: number;
}

export interface ReportListResponse {
  reports: StoredComplianceReport[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// Configuration Types
// ============================================

export interface AgentConfig {
  classifierConfidenceThreshold: number;
  processingMode: "sequential" | "parallel";
  reportRetentionDays: number;
  chunkSize: number;
  chunkOverlap: number;
  retrieverTopK: number;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  classifierConfidenceThreshold: 0.85,
  processingMode: "sequential",
  reportRetentionDays: 90,
  chunkSize: 600,
  chunkOverlap: 100,
  retrieverTopK: 4,
};

// ============================================
// Scoring Constants
// ============================================

export const SEVERITY_SCORES: Record<Exclude<SeverityLevel, "NONE">, number> = {
  CRITICAL: 40,
  HIGH: 30,
  MEDIUM: 15,
  LOW: 5,
};

export const STATUS_THRESHOLDS = {
  COMPLIANT_MIN_SCORE: 90,
  AT_RISK_MIN_SCORE: 50,
  // Below 50 is NON_COMPLIANT
};
