"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getProject, uploadDocument, uploadFileToS3,
  getDocumentContentUrl, deleteDocument,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft, Upload, FileText, MoreVertical, Trash2, Download, File,
  FileImage, FileVideo, FileArchive,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  size: number | null;
  content_type: string | null;
  status: string;
  created_at: string;
  uploaded_at: string | null;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  documents: Document[];
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || "")) return FileImage;
  if (["mp4", "mov", "avi", "webm"].includes(ext || "")) return FileVideo;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) return FileArchive;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext || "")) return FileText;
  return File;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getProject(projectId);
      setProject(data);
    } catch {
      router.push("/projects");
    }
  }, [projectId, router]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await uploadDocument(projectId, file.name);
      await uploadFileToS3(doc.presigned_url, file);
      // Wait briefly for Lambda to confirm the upload
      setTimeout(() => load(), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDownload(docId: string) {
    try {
      const { url } = await getDocumentContentUrl(projectId, docId);
      window.open(url, "_blank");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Download failed");
    }
  }

  async function handleDelete(docId: string) {
    try {
      await deleteDocument(projectId, docId);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (!project) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm text-muted-foreground">
            {project.documents.length} document{project.documents.length !== 1 ? "s" : ""}
          </h2>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
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

        {project.documents.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No documents yet</p>
            <p className="text-sm">Upload a file to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {project.documents.map((doc) => {
              const Icon = fileIcon(doc.name);
              return (
                <div
                  key={doc.id}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(doc.size)}
                      {doc.status === "pending" && " - pending upload"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(doc.id)}>
                        <Download className="h-4 w-4 mr-2" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
