# AI Compliance Checker

An intelligent, multi-agent compliance checking system built with **Next.js**, **Mastra AI**, and **RAG (Retrieval-Augmented Generation)**. Upload documents, automatically detect categories, analyze against company policies, and receive detailed violation scores with actionable recommendations.

## Features

- **Multi-Agent Architecture**: 6 specialized AI agents working together
- **Auto-Classification**: Automatically detects document category (IT, RETAIL, CUSTOM)
- **RAG-Powered Analysis**: Semantic search retrieves relevant policies for accurate analysis
- **Violation Scoring**: Severity-weighted scoring algorithm (0-100 scale)
- **Actionable Recommendations**: Step-by-step fixes prioritized by severity
- **Comprehensive Reports**: Executive summaries with detailed breakdowns
- **Audit Trail**: All analyses stored with configurable retention
- **Modern Stack**: Next.js 16, TypeScript, MongoDB, Chroma DB

## Architecture

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

### Agents

| Agent | Purpose | Output |
|-------|---------|--------|
| **Classifier** | Auto-detect document category | Category + confidence score |
| **Chunker** | Split document into segments | Analyzable chunks |
| **Retriever** | Find relevant policies (RAG) | Policy matches with similarity |
| **Scorer** | Identify violations & score | Violation score (0-100) |
| **Recommender** | Generate fix recommendations | Prioritized action items |
| **Aggregator** | Compile final report | Executive summary + details |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **AI Orchestration**: Mastra AI
- **LLM**: Google Gemini 1.5 Flash
- **Embeddings**: Hugging Face BGE-small-en-v1.5
- **Vector Store**: Chroma DB
- **Database**: MongoDB Atlas
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **MongoDB Atlas** account (free tier available)
- **Google Gemini API** key (get from [Google AI Studio](https://aistudio.google.com))
- **Hugging Face** API token (for embeddings - get from [huggingface.co](https://huggingface.co/settings/tokens))
- **Docker** (optional, for ChromaDB - Docker Desktop recommended)

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd compliance-checker
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
# MongoDB
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"

# Google Gemini API
GEMINI_API_KEY="your_gemini_api_key_here"

# Hugging Face Token (for embeddings)
hf_token="hf_xxxxxxxxxxxxxxxxxx"

# Optional: ChromaDB Server URL
# If not set, ChromaDB will run in in-memory mode (data lost on restart)
# CHROMA_SERVER_URL="http://localhost:8000"
```

#### 4. Start ChromaDB (Vector Database)

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Standalone Python Server**
```bash
pip install chromadb
chroma run --path ./chroma-data --port 8000
```

**Option C: Skip for now (uses in-memory, data not persisted)**
- Just proceed to step 5; the app will use ephemeral mode

#### 5. Run the Development Server
```bash
npm run dev
```

The application will start at `http://localhost:3000`

#### 6. Initialize Database (Optional - First Time Only)
If you want to pre-populate sample policies:
```bash
curl -X POST http://localhost:3000/api/init-db
```

---

## 🚀 Using the Application

### Home Page
- **URL**: `http://localhost:3000`
- View system status and architecture overview

### 1. Upload Policies
- **URL**: `http://localhost:3000/policies`
- Upload company policies (PDF or text)
- Select document category: IT, RETAIL, or CUSTOM
- Index policies for RAG retrieval

**API Endpoint**: `POST /api/policy`
```json
{
  "file": "policy.pdf",
  "name": "Security Policy v2",
  "category": "IT"
}
```

### 2. Run Compliance Check
- **URL**: `http://localhost:3000/compliance`
- Paste document text to analyze
- Select category (auto-detects if not provided)
- Generates compliance report with violations and recommendations

**API Endpoint**: `POST /api/compliance/check`
```json
{
  "documentText": "Your document content here...",
  "documentName": "Employee Handbook",
  "category": "IT"
}
```

**Response**:
```json
{
  "success": true,
  "report": {
    "id": "report-uuid",
    "score": 75,
    "status": "AT_RISK",
    "summary": "Executive summary...",
    "violations": {
      "critical": 2,
      "high": 5,
      "medium": 12,
      "low": 8
    },
    "recommendations": [...],
    "statistics": {
      "totalChunks": 25,
      "compliantChunks": 18,
      "violationChunks": 7
    }
  }
}
```

### 3. View Compliance Reports
- **URL**: `http://localhost:3000/reports`
- Browse all compliance analysis reports
- Filter by category and status
- View detailed violation breakdowns
- Pagination support

**API Endpoint**: `GET /api/reports?page=1&limit=10&category=IT&status=AT_RISK`

### 4. View Analysis History
- **URL**: `http://localhost:3000/history`
- Timeline of all analyses performed
- Statistics and trends
- Filter by category and date range

**API Endpoint**: `GET /api/compliance/history?days=30&limit=20&category=IT`

### 5. Manage System
- **URL**: `http://localhost:3000/system`
- Database status
- ChromaDB connection
- MongoDB diagnostics
- Vector store health

---

## 📡 API Endpoints Reference

### Policy Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/policy` | List all policies |
| `POST` | `/api/policy` | Upload new policy |
| `PATCH` | `/api/policy/{id}/deactivate` | Deactivate a policy |
| `POST` | `/api/policy/{id}/index` | Index policy in vector store |

### Compliance Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/compliance/check` | Run compliance analysis |
| `GET` | `/api/compliance/history` | Get analysis history |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports` | List all reports |
| `GET` | `/api/reports/{id}` | Get report details |

### Testing  
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/test-db` | Test MongoDB connection |
| `POST` | `/api/test-rag` | Test RAG pipeline |
| `POST` | `/api/init-db` | Initialize sample data |

---

## 🛠️ Development & Debugging

### Useful Development Commands
```bash
# Run with Turbopack (faster)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Start ChromaDB separately
docker-compose up -d chromadb

# View ChromaDB logs
docker-compose logs -f chromadb

# Stop services
docker-compose down
```

### Environment Variables Reference
```env
# Required
MONGODB_URI=mongodb://...          # MongoDB connection string
GEMINI_API_KEY=sk_xxxxx            # Google Gemini API key
hf_token=hf_xxxxx                  # Hugging Face token

# Optional
CHROMA_SERVER_URL=http://localhost:8000  # ChromaDB server
NODE_ENV=development               # development or production
```

### Common Issues & Solutions

**Problem**: `Hydration mismatch` error in browser
- **Solution**: Page uses `suppressHydrationWarning` on root layout - this is expected behavior

**Problem**: `policies.map is not a function`
- **Solution**: Fixed - API now safely returns array with fallback

**Problem**: ChromaDB connection failed
- **Solution**: 
  1. Check if Docker is running: `docker ps`
  2. Start with: `docker-compose up -d`
  3. Or remove `CHROMA_SERVER_URL` from `.env` to use in-memory mode

**Problem**: MongoDB connection timeout
- **Solution**: 
  1. Check your IP is whitelisted in MongoDB Atlas
  2. Verify connection string format
  3. Test with: `curl -X POST http://localhost:3000/api/test-db`

**Problem**: Gemini API errors
- **Solution**:
  1. Verify API key is valid and has billing enabled
  2. Check rate limits
  3. Test with smaller documents first

---

## 📊 Report Structure

Each compliance report includes:

```json
{
  "id": "unique-report-id",
  "score": 0-100,
  "status": "COMPLIANT|AT_RISK|NON_COMPLIANT",
  "overallComplianceScore": 75,
  "executiveSummary": "...",
  "documentMetadata": {
    "name": "Document name",
    "category": "IT|RETAIL|CUSTOM",
    "confidence": 0.95
  },
  "violations": {
    "critical": 2,
    "high": 5,
    "medium": 12,
    "low": 8
  },
  "recommendations": [
    {
      "id": "rec-1",
      "action": "Action to take",
      "priority": "HIGH|MEDIUM|LOW",
      "effort": "QUICK|MODERATE|EXTENSIVE",
      "expectedImpact": "Description of impact"
    }
  ],
  "statistics": {
    "totalChunks": 25,
    "compliantChunks": 18,
    "violationChunks": 7,
    "needsReviewChunks": 3
  },
  "timing": {
    "processingTimeMs": 2500,
    "workflowTimeMs": 3000,
    "analyzedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 📚 Architecture Deep Dive

The system uses a **6-Agent Orchestration** pattern:

1. **Classifier Agent** - Auto-detect document category
2. **Chunker Agent** - Break documents into segments
3. **Retriever Agent** - Find relevant policies (RAG)
4. **Scorer Agent** - Identify violations & score severity
5. **Recommender Agent** - Generate fixes
6. **Aggregator Agent** - Compile final report

All agents are orchestrated through Mastra Workflow engine for reliable, multi-step analysis.

---

## 🔒 Security Notes

- Never commit `.env.local` - it's in `.gitignore`
- API keys should rotate quarterly
- MongoDB credentials require IP whitelisting
- Consider reading policy text separately for sensitive documents
  
---

## 📝 License

Proprietary - AI Compliance Checker System
    api_url="https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5"
    # Optional: Chroma server (recommended for persistence)
    CHROMA_SERVER_URL="http://localhost:8000"
    ```

4. **Start ChromaDB (recommended)**
    ```bash
    docker-compose up -d
    ```
    Or see `CHROMA_SETUP.md` for more options.

5. **Start the development server**
    ```bash
    npm run dev
    ```

6. **Initialize the database**
    ```bash
    # Visit once after first boot
    http://localhost:3000/api/init-db
    ```

7. **Open the application**
    ```
    http://localhost:3000
    ```

## Usage

### 1. Upload Policies

First, upload your company policies that documents will be checked against:

1. Navigate to `/api/upload` or use the upload page
2. Select domain category (IT, RETAIL, CUSTOM)
3. Upload PDF/DOCX policy documents
4. Index policies via the Policies page (`/policies`)

### 2. Run Compliance Check

**Via API:**
```bash
curl -X POST http://localhost:3000/api/compliance/check \
  -H "Content-Type: application/json" \
  -d '{
    "documentText": "Your document content here...",
    "documentName": "Employee Handbook v2",
    "category": "IT"  // Optional - auto-detected if omitted
  }'
```

**Via UI:**
1. Navigate to `/compliance`
2. Paste or upload document text
3. Optionally select category (or let AI auto-detect)
4. Click "Run Analysis"

### 3. View Results

The compliance report includes:

- **Overall Score**: 0-100 compliance rating
- **Status**: COMPLIANT / AT_RISK / NON_COMPLIANT
- **Executive Summary**: AI-generated overview
- **Violation Breakdown**: Count by severity (Critical, High, Medium, Low)
- **Recommendations**: Prioritized action items with effort estimates
- **Detailed Analysis**: Per-chunk breakdown with evidence

## API Reference

### Compliance Check

```
POST /api/compliance/check
```

**Request Body:**
```json
{
  "documentText": "string (required)",
  "documentName": "string (optional)",
  "category": "IT | RETAIL | CUSTOM (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "id": "rpt_abc123",
    "score": 75,
    "status": "AT_RISK",
    "summary": "The document shows moderate compliance risk...",
    "metadata": {
      "name": "Document Name",
      "category": "IT",
      "confidence": 0.92
    },
    "statistics": {
      "totalChunks": 5,
      "compliantChunks": 3,
      "violationChunks": 2
    },
    "violations": {
      "critical": 0,
      "high": 1,
      "medium": 2,
      "low": 1
    },
    "recommendations": [
      {
        "id": "rec_xyz",
        "action": "Update password policy to require 12+ characters",
        "priority": "HIGH",
        "effort": "LOW",
        "expectedImpact": "Improved security posture"
      }
    ]
  }
}
```

### Reports

```
GET /api/reports              # List all reports
GET /api/reports/:id          # Get specific report
DELETE /api/reports/:id       # Delete report
GET /api/compliance/history   # Get analysis history with stats
```

### System

```
GET /api/init-db              # Initialize MongoDB collections
GET /api/test-db              # Verify MongoDB connectivity
POST /api/test-rag            # Test retrieval using a query (FormData)
```

## Frontend Surfaces

Every API surface has a matching UI page:

```
/                        # Overview dashboard
/api/upload              # Policy upload UI
/policies                # Policy list + indexing
/compliance              # Compliance check UI
/reports                 # Reports list + detail viewer
/history                 # Compliance history + stats
/system                  # Init DB, test DB, endpoint info
/test-rag                # Retrieval smoke test
```

### Policy Management

```
GET /api/policy               # List policies
POST /api/policy              # Upload policy (FormData)
POST /api/policy/:id/index    # Index policy to vector store
PATCH /api/policy/:id/deactivate  # Deactivate policy
```

## Scoring Algorithm

The violation score uses a **severity-weighted deduction** algorithm:

| Severity | Point Deduction |
|----------|-----------------|
| CRITICAL | -40 points |
| HIGH | -30 points |
| MEDIUM | -15 points |
| LOW | -5 points |

**Formula:** `Score = max(0, 100 - total_deductions)`

**Status Thresholds:**
- **COMPLIANT**: Score >= 90, no CRITICAL/HIGH violations
- **AT_RISK**: Score 50-89, or has HIGH violations
- **NON_COMPLIANT**: Score < 50, or has CRITICAL violations

## Project Structure

```
compliance-checker/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── compliance/
│   │   │   ├── check/           # Main compliance analysis endpoint
│   │   │   └── history/         # Analysis history endpoint
│   │   ├── policy/              # Policy management
│   │   └── reports/             # Report retrieval
│   ├── compliance/              # Compliance check UI
│   ├── policies/                # Policy management UI
│   └── page.tsx                 # Home page
│
├── mastra/                      # Mastra AI Configuration
│   ├── agents/                  # Agent definitions
│   │   ├── classifierAgent.ts
│   │   ├── scorerAgent.ts
│   │   ├── recommenderAgent.ts
│   │   └── aggregatorAgent.ts
│   ├── workflows/               # Workflow orchestration
│   │   └── complianceWorkflow.ts
│   ├── tools/                   # Mastra tools
│   └── index.ts                 # Mastra instance
│
├── lib/                         # Core logic
│   ├── agents/                  # Agent implementation logic
│   │   ├── classifierAgent.ts
│   │   ├── scorerAgent.ts
│   │   ├── recommenderAgent.ts
│   │   └── aggregatorAgent.ts
│   ├── types/                   # TypeScript definitions
│   ├── utils/                   # Utility functions
│   ├── chunkText.ts             # Text chunking
│   ├── embedText.ts             # Embedding generation
│   ├── mongodb.ts               # Database connection
│   └── policyVectorStore.ts     # Vector store management
│
├── ARCHITECTURE.md              # Detailed architecture docs
├── .env.example                 # Environment template
└── package.json
```

## Configuration

### Agent Configuration

Edit `lib/types/index.ts` to customize:

```typescript
export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  classifierConfidenceThreshold: 0.85,  // Auto-classify threshold
  processingMode: "sequential",          // or "parallel"
  reportRetentionDays: 90,               // Auto-delete after
  chunkSize: 600,                         // Characters per chunk
  chunkOverlap: 100,                      // Overlap between chunks
  retrieverTopK: 4,                       // Policies per chunk
};
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `hf_token` | Hugging Face API token | Yes |
| `api_url` | HF embedding model URL (BGE) | Yes |
| `HF_LLM_MODEL` | HF LLM model (default: meta-llama/Llama-3.3-70B-Instruct) | No |
| `CLASSIFIER_CONFIDENCE_THRESHOLD` | Auto-classify threshold | No (0.85) |
| `PROCESSING_MODE` | sequential or parallel | No (sequential) |
| `REPORT_RETENTION_DAYS` | Days to keep reports | No (90) |

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## Extending the System

### Adding New Document Categories

1. Update `lib/types/index.ts`:
   ```typescript
   export type DocumentCategory = "IT" | "RETAIL" | "CUSTOM" | "HEALTHCARE";
   ```

2. Update classifier agent instructions in `lib/agents/classifierAgent.ts`

3. Upload policies for the new category

### Adding New Agents

1. Create agent logic in `lib/agents/newAgent.ts`
2. Create Mastra wrapper in `mastra/agents/newAgent.ts`
3. Register in `mastra/index.ts`
4. Add to workflow in `mastra/workflows/complianceWorkflow.ts`

### Custom Scoring Algorithm

Edit `lib/utils/scoring.ts` to modify the scoring logic.

## Troubleshooting

### "Hugging Face text generation failed"
Ensure `hf_token` is valid and the model is accessible in your account.

### "No policies found"
1. Upload policies via `/api/upload`
2. Index policies via `/policies` page
3. Ensure category matches between document and policies

### "Vector store connection failed"
Chroma DB runs locally. Ensure `./chroma-data` directory is writable.

### Low Classification Confidence
If auto-classification frequently fails:
- Provide category manually in API call
- Lower `CLASSIFIER_CONFIDENCE_THRESHOLD`
- Upload more diverse policies for training

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Mastra AI](https://mastra.ai) - Agent orchestration framework
- [Google Gemini](https://ai.google.dev) - LLM provider
- [Hugging Face](https://huggingface.co) - Embedding models
- [Chroma](https://www.trychroma.com) - Vector database
- [Next.js](https://nextjs.org) - React framework

---

Built with AI-powered compliance checking in mind.
