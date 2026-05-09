import { NextRequest, NextResponse } from "next/server";
import { processDocument } from "@/lib/rag";
import { createVectorStore } from "@/lib/qdrant";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && file.type !== "text/plain") {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process and chunk the document
    const docs = await processDocument(buffer, file.name, file.type);

    if (docs.length === 0) {
      return NextResponse.json({ error: "No text could be extracted from the document" }, { status: 400 });
    }

    // Generate a unique collection name for this document upload
    // In a real app, this might be tied to a user ID + document ID
    const collectionName = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store in Qdrant
    await createVectorStore(docs, collectionName);

    return NextResponse.json({
      success: true,
      collectionName,
      message: "Document processed and stored successfully",
      chunks: docs.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Upload Error:", err);
    return NextResponse.json(
      { error: err.message || "An error occurred during upload" },
      { status: 500 }
    );
  }
}
