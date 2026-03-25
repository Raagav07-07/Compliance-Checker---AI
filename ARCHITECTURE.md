# AI Compliance Checker - Agentic Architecture

## Overview

This document describes the multi-agent architecture for the AI-powered Compliance Checking System. The system uses **6 specialized agents** orchestrated by a **Master Workflow** built on the Mastra AI framework.

## System Architecture

```
                              Document Upload
                                     |
                                     v
    +------------------------------------------------------------------+
    |                    COMPLIANCE WORKFLOW                            |
    |              (Mastra Workflow - Master Orchestrator)              |
    +------------------------------------------------------------------+
         |              |              |              |              |
         v              v              v              v              v
    +---------+   +---------+   +-----------+   +---------+   +------------+
    |CLASSIFIER|   | CHUNKER |   | RETRIEVER |   | SCORER  |   |RECOMMENDER |
    |  Agent   |   |  Agent  |   |   Agent   |   |  Agent  |   |   Agent    |
    +---------+   +---------+   +-----------+   +---------+   +------------+
         |              |              |              |              |
         v              v              v              v              v
      Category       Chunks        Policies      Violations    Recommendations
                                                      |
                                                      v
                                              +------------+
                                              | AGGREGATOR |
                                              |   Agent    |
                                              +------------+
                                                      |
                                                      v
                                              Final Compliance
                                                   Report
```

## Agent Specifications

### 1. Classifier Agent

**Purpose**: Automatically identify document category without manual user input

**Why It's Needed**:
- Reduces friction in upload flow
- Ensures consistent categorization
- Prevents human miscategorization errors
- Enables fully automated compliance processing

**Input Schema**:
```typescript
{
  documentText: string;  // Raw document text (first 2000 chars for efficiency)
}
```

**Output Schema**:
```typescript
{
  category: "IT" | "RETAIL" | "CUSTOM";
  confidence: number;        // 0-1 confidence score
  reasoning: string;         // Explanation for classification
  keywords: string[];        // Key terms that influenced decision
}
```

**Behavior**:
- Analyzes document content, headings, and terminology
- Returns confidence score (0-1)
- If confidence < 0.85, system prompts user for manual selection
- Logs classification reasoning for audit trail

**LLM Model**: Google Gemini 1.5 Flash (fast, cost-effective)

---

### 2. Chunker Agent

**Purpose**: Break documents into semantically meaningful, analyzable segments

**Why It's Needed**:
- Large documents exceed LLM context windows
- Smaller chunks enable focused analysis
- Overlap ensures context preservation across boundaries
- Enables parallel processing capability

**Input Schema**:
```typescript
{
  documentText: string;
  chunkSize?: number;      // Default: 600 characters
  chunkOverlap?: number;   // Default: 100 characters
}
```

**Output Schema**:
```typescript
{
  chunks: Array<{
    index: number;
    text: string;
    startPosition: number;
    endPosition: number;
  }>;
  totalChunks: number;
  averageChunkSize: number;
}
```

**Behavior**:
- Uses LangChain's RecursiveCharacterTextSplitter
- Maintains semantic boundaries where possible
- Tracks position metadata for reference back to original
- Configurable chunk size and overlap

**Implementation**: LangChain TextSplitter (no LLM needed)

---

### 3. Retriever Agent

**Purpose**: Find relevant policy documents for each chunk using semantic search

**Why It's Needed**:
- RAG-based context retrieval improves accuracy
- Semantic search finds conceptually related policies
- Category filtering ensures domain relevance
- Provides evidence base for compliance decisions

**Input Schema**:
```typescript
{
  chunkText: string;
  category: string;
  topK?: number;           // Default: 4 results
}
```

**Output Schema**:
```typescript
{
  policies: Array<{
    id: string;
    text: string;
    distance: number;      // Similarity score
    policyId: string;
    chunkIndex: number;
  }>;
  retrievalTimeMs: number;
}
```

**Behavior**:
- Embeds query chunk using Hugging Face BGE model
- Searches Chroma vector store with category filter
- Returns top-K most similar policy clauses
- Includes distance scores for confidence assessment

**Implementation**: 
- Embedding: Hugging Face BGE-small-en-v1.5
- Vector Store: Chroma DB

---

### 4. Scorer Agent

**Purpose**: Analyze document chunks against policies and assign violation scores

**Why It's Needed**:
- Core compliance assessment logic
- Quantifies risk with numeric scores (0-100)
- Identifies specific policy violations
- Categorizes severity for prioritization

**Input Schema**:
```typescript
{
  chunkText: string;
  chunkIndex: number;
  policies: string[];
}
```

**Output Schema**:
```typescript
{
  status: "COMPLIANT" | "VIOLATION" | "NEEDS_REVIEW";
  violationScore: number;    // 0-100 (100 = fully compliant)
  severity: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  violations: Array<{
    id: string;
    description: string;
    policyClause: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    evidence: string;
  }>;
  reasoning: string;
}
```

**Scoring Algorithm** (Severity-Weighted):
```
Base Score: 100
- CRITICAL violation: -40 points
- HIGH violation: -30 points  
- MEDIUM violation: -15 points
- LOW violation: -5 points

Final Score = max(0, 100 - total_deductions)
```

**Severity Thresholds**:
- 90-100: COMPLIANT (Green)
- 70-89: LOW risk (Yellow)
- 50-69: MEDIUM risk (Orange)
- 25-49: HIGH risk (Red)
- 0-24: CRITICAL risk (Dark Red)

**LLM Model**: Google Gemini 1.5 Flash with JSON output

---

### 5. Recommender Agent

**Purpose**: Generate actionable recommendations to fix identified violations

**Why It's Needed**:
- Transforms violations into actionable steps
- Prioritizes by severity and impact
- Provides effort estimates for planning
- Includes policy references for compliance teams

**Input Schema**:
```typescript
{
  violations: Array<{
    id: string;
    description: string;
    policyClause: string;
    severity: string;
    chunkIndex: number;
  }>;
  chunkText: string;
  category: string;
}
```

**Output Schema**:
```typescript
{
  recommendations: Array<{
    id: string;
    violationId: string;
    action: string;           // Step-by-step fix
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    effort: "LOW" | "MEDIUM" | "HIGH";
    expectedImpact: string;
    policyReference: string;
    riskIfIgnored: string;
  }>;
}
```

**Behavior**:
- Groups related violations for consolidated recommendations
- Prioritizes by severity (CRITICAL first)
- Provides specific, actionable steps
- Estimates implementation effort
- Warns about non-compliance risks

**LLM Model**: Google Gemini 1.5 Flash with JSON output

---

### 6. Aggregator Agent

**Purpose**: Compile all analysis results into comprehensive compliance report

**Why It's Needed**:
- Consolidates per-chunk analysis into unified view
- Calculates overall compliance score
- Creates executive summary
- Organizes recommendations by priority
- Generates audit-ready documentation

**Input Schema**:
```typescript
{
  documentMetadata: {
    name: string;
    category: string;
    confidence: number;
    analyzedAt: string;
  };
  chunkAnalysis: Array<{
    chunkIndex: number;
    status: string;
    violationScore: number;
    severity: string;
    violations: any[];
    recommendations: any[];
    policies: string[];
  }>;
}
```

**Output Schema**:
```typescript
{
  reportId: string;
  
  // Executive Summary
  overallComplianceScore: number;  // Weighted average
  status: "COMPLIANT" | "AT_RISK" | "NON_COMPLIANT";
  executiveSummary: string;
  
  // Breakdown
  totalChunks: number;
  compliantChunks: number;
  violationChunks: number;
  needsReviewChunks: number;
  
  // Violation Summary
  violationsByGrade: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  // All Recommendations (deduplicated, prioritized)
  recommendations: Array<Recommendation>;
  
  // Detailed Analysis
  detailedAnalysis: Array<ChunkAnalysis>;
  
  // Audit Trail
  processingTimeMs: number;
  analyzedAt: string;
  expiresAt: string;
}
```

**Overall Status Calculation**:
- COMPLIANT: Score >= 90, no CRITICAL/HIGH violations
- AT_RISK: Score 50-89, or has HIGH violations
- NON_COMPLIANT: Score < 50, or has CRITICAL violations

**LLM Model**: Google Gemini 1.5 Flash (for executive summary generation)

---

## Workflow Orchestration

### Compliance Workflow (Main)

```
START
  |
  v
[Classifier Agent] --> category, confidence
  |
  |-- confidence < 0.85? --> Return for manual selection
  |
  v
[Chunker Agent] --> chunks[]
  |
  v
FOR EACH chunk:
  |
  +--[Retriever Agent] --> policies[]
  |         |
  |         v
  +--[Scorer Agent] --> violations, score
  |         |
  |         v
  +--[Recommender Agent] --> recommendations[]
  |
  v
[Aggregator Agent] --> Final Report
  |
  v
[Store in MongoDB]
  |
  v
RETURN Report
```

### Execution Modes

**Sequential (Default)**:
- Process chunks one at a time
- Lower API costs
- Predictable resource usage
- ~10-30 seconds for typical document

**Parallel (Optional)**:
- Process multiple chunks concurrently
- 3-5x faster execution
- Higher API costs
- Better for batch processing

---

## Data Flow

```
                    Raw Document Text
                           |
                           v
              +------------------------+
              |   Classifier Agent     |
              +------------------------+
                           |
                    category: "IT"
                    confidence: 0.92
                           |
                           v
              +------------------------+
              |    Chunker Agent       |
              +------------------------+
                           |
                    chunks[0..n]
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
    +---------+      +---------+      +---------+
    | Chunk 0 |      | Chunk 1 |      | Chunk N |
    +---------+      +---------+      +---------+
          |                |                |
          v                v                v
    [Retriever]      [Retriever]      [Retriever]
          |                |                |
    policies[]       policies[]       policies[]
          |                |                |
          v                v                v
    [Scorer]         [Scorer]         [Scorer]
          |                |                |
    violations       violations       violations
    score: 85        score: 60        score: 100
          |                |                |
          v                v                v
    [Recommender]    [Recommender]    [Recommender]
          |                |                |
    recs[]           recs[]           recs[]
          |                |                |
          +----------------+----------------+
                           |
                           v
              +------------------------+
              |   Aggregator Agent     |
              +------------------------+
                           |
                           v
              +------------------------+
              |   Compliance Report    |
              |                        |
              | Score: 81/100          |
              | Status: AT_RISK        |
              | Violations: 3          |
              | Recommendations: 5     |
              +------------------------+
```

---

## Technology Stack

### Core Framework
- **Mastra AI**: Agent orchestration, workflow management, observability
- **Next.js 16**: React framework with API routes

### AI/ML
- **Google Gemini 1.5 Flash**: LLM for classification, scoring, recommendations
- **Hugging Face BGE-small-en-v1.5**: Text embeddings

### Storage
- **MongoDB Atlas**: Document storage, compliance reports, audit logs
- **Chroma DB**: Vector embeddings for policy retrieval

### Document Processing
- **LangChain TextSplitters**: Document chunking
- **pdf-ts**: PDF text extraction

---

## API Endpoints

### Compliance Analysis
```
POST /api/compliance/check
Body: { documentText: string, category?: string }
Response: ComplianceReport
```

### Report Retrieval
```
GET /api/reports/:id
Response: ComplianceReport

GET /api/compliance/history
Query: { category?, limit?, offset? }
Response: ComplianceReport[]
```

### Agent Status
```
GET /api/agents/status
Response: { agents: AgentStatus[] }
```

---

## Configuration

### Environment Variables
```env
# AI Models
GEMINI_API_KEY=your_gemini_api_key
hf_token=your_huggingface_token

# Database
MONGODB_URI=your_mongodb_uri

# Agent Configuration
CLASSIFIER_CONFIDENCE_THRESHOLD=0.85
PROCESSING_MODE=sequential
REPORT_RETENTION_DAYS=90

# Mastra
MASTRA_LOG_LEVEL=info
MASTRA_ENABLE_OBSERVABILITY=true
```

---

## Security Considerations

1. **API Key Protection**: All API keys stored in environment variables
2. **Input Validation**: Zod schemas validate all agent inputs
3. **Output Sanitization**: LLM outputs validated against schemas
4. **Rate Limiting**: API endpoints protected against abuse
5. **Audit Logging**: All compliance checks logged with timestamps

---

## Monitoring & Observability

### Mastra Built-in Features
- Agent execution tracing
- Workflow step monitoring
- Error tracking and alerting
- Performance metrics

### Custom Metrics
- Compliance score distribution
- Average processing time
- Violation frequency by category
- Recommendation acceptance rate

---

## Future Enhancements

1. **Multi-language Support**: Document analysis in multiple languages
2. **Custom Policy Training**: Fine-tune embeddings on organization policies
3. **Real-time Monitoring**: Continuous compliance monitoring dashboard
4. **Integration APIs**: Connect with GRC (Governance, Risk, Compliance) tools
5. **Voice Agents**: Voice-based compliance queries using Mastra Voice

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-09 | Initial agentic architecture with 6 agents |

---

*This architecture document is maintained alongside the codebase and should be updated when significant changes are made to the agent system.*
