import FileUploader from "@/components/file-uploader";
import { BookOpenText } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="z-10 max-w-3xl w-full items-center justify-center flex flex-col font-sans">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <BookOpenText className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Notebook<span className="text-primary">RAG</span>
          </h1>
        </div>
        
        <p className="text-center text-lg text-muted-foreground mb-12 max-w-xl">
          Upload any PDF or TXT document and instantly start asking questions. Our RAG engine extracts insights and provides accurate, grounded answers.
        </p>

        <div className="w-full max-w-xl">
          <FileUploader />
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-2">1. Upload</h3>
            <p>Drag and drop your document. We support PDF and TXT formats up to 10MB.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">2. Process</h3>
            <p>Our engine automatically chunks and generates vector embeddings via OpenAI.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">3. Chat</h3>
            <p>Ask questions and get instant, grounded answers with citations.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
