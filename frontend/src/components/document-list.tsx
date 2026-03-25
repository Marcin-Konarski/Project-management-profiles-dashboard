"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { DocumentItem, type Document } from "@/components/document-item";

interface DocumentListProps {
  documents: Document[];
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownload: (docId: string) => void;
  onDelete: (docId: string) => void;
}

export function DocumentList({
  documents,
  uploading,
  onUpload,
  onDownload,
  onDelete,
}: DocumentListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onUpload}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No documents yet</p>
          <p className="text-sm">Upload a file to get started</p>
        </div>
      ) : (
        <div className="space-y-1">
          {documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
