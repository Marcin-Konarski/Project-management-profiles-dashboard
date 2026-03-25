"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getProject,
  getMe,
  uploadDocument,
  uploadFileToS3,
  getDocumentContentUrl,
  deleteDocument,
  addMembers,
  removeMember,
} from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { MemberList } from "@/components/member-list";
import { DocumentList } from "@/components/document-list";
import type { Document } from "@/components/document-item";
import type { Member } from "@/components/member-list";

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  documents: Document[];
  members: Member[];
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [data, me] = await Promise.all([getProject(projectId), getMe()]);
      setProject(data);
      setCurrentUserId(me.id);
    } catch {
      router.push("/projects");
    }
  }, [projectId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = project?.owner_id === currentUserId;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const doc = await uploadDocument(projectId, file.name);
      setProject((prev) =>
        prev
          ? {
              ...prev,
              documents: [
                ...prev.documents,
                {
                  id: doc.id,
                  name: doc.name,
                  size: null,
                  content_type: null,
                  status: "pending",
                  created_at: doc.created_at,
                  uploaded_at: null,
                },
              ],
            }
          : prev,
      );
      await uploadFileToS3(doc.presigned_url, file);
      toast.success("Document uploaded");
      setTimeout(() => load(), 5000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(docId: string) {
    try {
      const { url } = await getDocumentContentUrl(projectId, docId);
      window.open(url, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  }

  async function handleDeleteDoc(docId: string) {
    if (!project) return;
    const prevDocs = project.documents;
    setProject({
      ...project,
      documents: project.documents.filter((d) => d.id !== docId),
    });
    try {
      await deleteDocument(projectId, docId);
      toast.success("Document deleted");
    } catch (err) {
      setProject((prev) => (prev ? { ...prev, documents: prevDocs } : prev));
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleAddMember(username: string) {
    const updatedMembers = await addMembers(projectId, [username]);
    setProject((prev) =>
      prev ? { ...prev, members: updatedMembers } : prev,
    );
    toast.success("Member added");
  }

  async function handleRemoveMember(userId: string) {
    if (!project) return;
    const prevMembers = project.members;
    setProject({
      ...project,
      members: project.members.filter((m) => m.id !== userId),
    });
    try {
      await removeMember(projectId, userId);
      toast.success("Member removed");
    } catch (err) {
      setProject((prev) => (prev ? { ...prev, members: prevMembers } : prev));
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  if (!project) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <MemberList
          members={project.members}
          isOwner={isOwner}
          onAdd={handleAddMember}
          onRemove={handleRemoveMember}
        />
        <DocumentList
          documents={project.documents}
          uploading={uploading}
          onUpload={handleUpload}
          onDownload={handleDownload}
          onDelete={handleDeleteDoc}
        />
      </main>
    </div>
  );
}
