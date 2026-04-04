"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getProjects, createProject, updateProject, deleteProject, getMe } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, FolderOpen, LogOut } from "lucide-react";
import { ProjectCard, type Project } from "@/components/project-card";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [projectsData, me] = await Promise.all([getProjects(), getMe()]);
      setProjects(projectsData);
      setUsername(me.username);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (dialogMode === "create") {
        const data = await createProject(name, description || undefined);
        setProjects((prev) => [
          ...prev,
          { id: data.id, name: data.name, description: data.description },
        ]);
        setName("");
        setDescription("");
        setDialogOpen(false);
        toast.success("Project created");
        return;
      }

      if (!editingId) throw new Error("No project selected");
      const data = await updateProject(editingId, {
        name,
        description: description.trim() === "" ? null : description,
      });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: data.name, description: data.description }
            : p
        )
      );
      setDialogOpen(false);
      toast.success("Project updated");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : dialogMode === "create"
            ? "Failed to create project"
            : "Failed to update project"
      );
    }
  }

  async function handleDelete(id: string) {
    const prev = projects;
    setProjects(projects.filter((p) => p.id !== id));
    try {
      await deleteProject(id);
      toast.success("Project deleted");
    } catch (err) {
      setProjects(prev);
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function openCreateDialog() {
    setError("");
    setDialogMode("create");
    setEditingId(null);
    setName("");
    setDescription("");
    setDialogOpen(true);
  }

  function openEditDialog(project: Project) {
    setError("");
    setDialogMode("edit");
    setEditingId(project.id);
    setName(project.name);
    setDescription(project.description || "");
    setDialogOpen(true);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">PM Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{username}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" /> New project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === "create" ? "Create project" : "Edit project"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input
                  placeholder="Project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                />
                <Input
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">
                    {dialogMode === "create" ? "Create" : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No projects yet</p>
            <p className="text-sm">Create one to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onEdit={openEditDialog}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
