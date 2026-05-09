import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
// removed pdf-parse import from top level

export const processDocument = async (fileBuffer: Buffer, fileName: string, mimeType: string): Promise<Document[]> => {
  let text = "";

  if (mimeType === "application/pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(fileBuffer);
    text = pdfData.text;
  } else if (mimeType === "text/plain") {
    text = fileBuffer.toString("utf-8");
  } else {
    throw new Error("Unsupported file type");
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const rawDocs = [new Document({ pageContent: text, metadata: { source: fileName } })];
  const chunkedDocs = await splitter.splitDocuments(rawDocs);

  // Add chunk index to metadata
  return chunkedDocs.map((doc, index) => {
    return new Document({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        chunk_index: index,
      },
    });
  });
};
