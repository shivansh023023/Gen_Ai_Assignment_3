import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/lib/qdrant";
import { getLLM } from "@/lib/gemini";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

export async function POST(req: NextRequest) {
  try {
    const { messages, collectionName } = await req.json();

    if (!collectionName) {
      return NextResponse.json({ error: "No collectionName provided" }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const currentMessage = messages[messages.length - 1].content;

    // 1. Setup Qdrant retrieval
    const vectorStore = await getVectorStore(collectionName);
    const retriever = vectorStore.asRetriever(4); // Top K=4

    // 2. Retrieve relevant chunks
    const relevantDocs = await retriever.invoke(currentMessage);
    
    // Extract metadata for the client to show citations
    const sources = relevantDocs.map((doc) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
    }));

    // 3. Setup LLM and Prompt
    const llm = getLLM(true);

    const systemTemplate = `You are a helpful and precise assistant. Use the following pieces of retrieved context to answer the user's question. 
If you don't know the answer or if the answer is not found in the context, just say: "I could not find this information in the uploaded document."
DO NOT hallucinate or use outside knowledge. Answer ONLY based on the provided context.

Context:
{context}

Question: {question}

Answer:`;

    const prompt = PromptTemplate.fromTemplate(systemTemplate);

    // Format context
    const contextString = relevantDocs.map((doc, idx) => `[Chunk ${idx + 1}]:\n${doc.pageContent}`).join("\n\n");

    const chain = RunnableSequence.from([
      {
        context: () => contextString,
        question: (input: string) => input,
      },
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    // 4. Stream Response
    const stream = await chain.stream(currentMessage);

    // We convert the AsyncGenerator into a ReadableStream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        // Send a custom header or first chunk with sources if needed
        // For simplicity, we just stream the text, and return sources in headers
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    const response = new NextResponse(readableStream);
    response.headers.set("x-sources", Buffer.from(JSON.stringify(sources)).toString("base64"));
    
    return response;

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Chat API Error:", err);
    return NextResponse.json(
      { error: err.message || "An error occurred during chat processing" },
      { status: 500 }
    );
  }
}
