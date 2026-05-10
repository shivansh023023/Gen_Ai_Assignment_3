# NotebookRAG - Complete RAG Application

A production-ready Retrieval-Augmented Generation (RAG) application built with Next.js 14, LangChain, OpenAI, and Qdrant. Upload a document (PDF or TXT) and interact with it using a ChatGPT-like interface

## 🚀 Features

- **Drag and Drop Upload**: Simple and intuitive interface for uploading documents.
- **Document Chunking**: Uses \`RecursiveCharacterTextSplitter\` for optimal context retrieval.
- **Vector Embeddings**: Embeddings generated using OpenAI's \`text-embedding-3-small\`.
- **Vector Database**: Scalable vector storage using Qdrant.
- **Grounded Responses**: The LLM is strictly prompted to answer *only* based on the retrieved context to prevent hallucination.
- **Source Citations**: View exactly which chunks and pages were used to generate the answer.
- **Streaming UI**: Real-time streaming responses in a modern dark-mode enabled interface (shadcn/ui).

## 🏗️ Architecture & Chunking Strategy

1. **Processing Pipeline (\`/api/upload\`)**:
   - Files are parsed (\`pdf-parse\` for PDFs) and converted to text.
   - Text is split into chunks using **Recursive Character Text Splitting** (\`chunkSize: 1000\`, \`chunkOverlap: 200\`). This ensures paragraphs and sentences are kept together contextually.
   - Metadata (filename, chunk index) is attached.
   - Embeddings are generated and pushed to a dynamically created Qdrant collection.

2. **Retrieval & Generation Pipeline (\`/api/chat\`)**:
   - The user query is vectorized.
   - **Semantic Search** retrieves the top K=4 chunks from Qdrant.
   - LangChain constructs a prompt merging the chunks and the question.
   - \`gpt-4o-mini\` generates the answer and streams it back to the client.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI/LLM orchestration**: LangChain
- **Embeddings**: OpenAI SDK.
- **Vector DB**: Qdrant Cloud.

## 💻 Local Setup

1. **Clone the repository** (or download the files).
2. **Install dependencies**:
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`
   *(Note: \`--legacy-peer-deps\` may be required due to LangChain peer dependency overlaps).*
3. **Set up Environment Variables**:
   Copy \`.env.example\` to \`.env\` and add your API keys:
   \`\`\`bash
   OPENAI_API_KEY=your_openai_api_key
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_api_key
   \`\`\`
4. **Run the Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ☁️ Deployment on Vercel

This app is designed to be instantly deployable on Vercel with zero configuration changes.

1. Push your code to a GitHub repository.
2. Go to your Vercel Dashboard and click **Add New > Project**.
3. Import your GitHub repository.
4. Add the required Environment Variables (\`OPENAI_API_KEY\`, \`QDRANT_URL\`, \`QDRANT_API_KEY\`).
5. Click **Deploy**.

*No Docker, no complex build scripts. The API routes will run on Vercel's Edge/Serverless functions automatically.*
