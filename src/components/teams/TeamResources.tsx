"use client";

import { useState, useTransition } from "react";
import {
  ExternalLink,
  FileText,
  Palette,
  GitBranch,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createTeamResource,
  deleteTeamResource,
  type ResourceType,
  type TeamResource,
} from "@/app/actions/resources";

const resourceTypes: ResourceType[] = [
  "GitHub",
  "Figma",
  "Google Docs",
  "Other",
];

interface TeamResourcesProps {
  teamId: string;
  initialResources: TeamResource[];
}

function ResourceIcon({ type }: { type: ResourceType }) {
  if (type === "GitHub") {
    return <GitBranch className="h-4 w-4" />;
  }

  if (type === "Figma") {
    return <Palette className="h-4 w-4" />;
  }

  if (type === "Google Docs") {
    return <FileText className="h-4 w-4" />;
  }

  return <Link2 className="h-4 w-4" />;
}

export default function TeamResources({
  teamId,
  initialResources,
}: TeamResourcesProps) {
  const [resources, setResources] = useState(initialResources);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ResourceType>("GitHub");
  const [isPending, startTransition] = useTransition();

  const addResource = () => {
    if (!title.trim()) {
      toast.error("Enter a resource title.");
      return;
    }

    if (!url.trim()) {
      toast.error("Enter a resource URL.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createTeamResource({
          teamId,
          title,
          url,
          type,
        });

        setResources((current) => [result.resource, ...current]);
        setTitle("");
        setUrl("");
        setType("GitHub");
        toast.success("Resource added.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add resource."
        );
      }
    });
  };

  const removeResource = (resource: TeamResource) => {
    startTransition(async () => {
      try {
        await deleteTeamResource({
          resourceId: resource.id,
          teamId,
        });

        setResources((current) =>
          current.filter((item) => item.id !== resource.id)
        );

        toast.success("Resource deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete resource."
        );
      }
    });
  };

  return (
    <section className="mt-8">
      <div className="mb-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground">
            Shared Resources
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Team Links</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep important project links together for your team.
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border bg-card p-5 shadow-sm md:grid-cols-[1fr_1.5fr_180px_auto]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Resource title"
            maxLength={120}
            disabled={isPending}
            className="rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />

          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://..."
            type="url"
            disabled={isPending}
            className="rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as ResourceType)
            }
            disabled={isPending}
            className="rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          >
            {resourceTypes.map((resourceType) => (
              <option key={resourceType} value={resourceType}>
                {resourceType}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={addResource}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add
          </button>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
          <Link2 className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-medium">No resources yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add GitHub repositories, Figma files, Google Docs, or other
            project links.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource) => (
            <article
              key={resource.id}
              className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                    <ResourceIcon type={resource.type} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="break-words font-medium">
                      {resource.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {resource.type}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeResource(resource)}
                  disabled={isPending}
                  className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label={`Delete ${resource.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
              >
                <span className="min-w-0 flex-1 truncate">
                  {resource.url}
                </span>
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
