"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FileUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf" && file.type !== "text/plain") {
      toast.error("Only PDF and TXT files are supported");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();
      toast.success("Document processed successfully!");
      
      // Navigate to chat interface with the collection ID
      router.push(`/chat?collection=${data.collectionName}&filename=${encodeURIComponent(file.name)}`);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 ease-in-out",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        isUploading && "pointer-events-none opacity-60"
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center text-primary">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="text-sm font-medium">Processing document...</p>
          <p className="text-xs text-muted-foreground mt-2">Chunking and generating embeddings.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-sm text-muted-foreground">PDF or TXT (Max 10MB)</p>
        </div>
      )}
    </div>
  );
}
