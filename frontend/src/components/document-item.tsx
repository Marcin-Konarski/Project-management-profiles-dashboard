"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  File,
  FileImage,
  FileVideo,
  FileArchive,
} from "lucide-react";
import { DocumentNameDialog } from "@/components/document-name-dialog";

export interface Document {
  id: string;
  name: string;
  size: number | null;
  content_type: string | null;
  status: string;
  created_at: string;
  uploaded_at: string | null;
}

const imageExts = new Set(["jpg", "jpeg", "png", "gif", "svg", "webp"]);
const videoExts = new Set(["mp4", "mov", "avi", "webm"]);
const archiveExts = new Set(["zip", "rar", "7z", "tar", "gz"]);
const textExts = new Set(["pdf", "doc", "docx", "txt", "md"]);

function renderFileIcon(name: string, className: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (imageExts.has(ext)) return <FileImage className={className} />;
  if (videoExts.has(ext)) return <FileVideo className={className} />;
  if (archiveExts.has(ext)) return <FileArchive className={className} />;
  if (textExts.has(ext)) return <FileText className={className} />;
  return <File className={className} />;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentItemProps {
  doc: Document;
  onDownload: (docId: string) => void;
  onDelete: (docId: string) => void;
  onRename: (docId: string, name: string) => Promise<void> | void;
}

export function DocumentItem({
  doc,
  onDownload,
  onDelete,
  onRename,
}: DocumentItemProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const icon = renderFileIcon(doc.name, "h-5 w-5 shrink-0 text-muted-foreground");

  return (
    <>
      <div
        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => setDetailOpen(true)}
      >
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{doc.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatSize(doc.size)}
            {doc.status === "pending" && "Uploading..."}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDownload(doc.id);
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DocumentNameDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit document"
        initialName={doc.name}
        onSubmit={(name) => onRename(doc.id, name)}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document details</DialogTitle>
          </DialogHeader>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium text-right truncate ml-4">{doc.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{doc.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Size</dt>
              <dd className="font-medium">{formatSize(doc.size) || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Content type</dt>
              <dd className="font-medium">{doc.content_type || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">
                {new Date(doc.created_at).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Uploaded</dt>
              <dd className="font-medium">
                {doc.uploaded_at
                  ? new Date(doc.uploaded_at).toLocaleString()
                  : "-"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-medium font-mono text-xs">{doc.id}</dd>
            </div>
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
}
