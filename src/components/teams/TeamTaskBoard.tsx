"use client";

import { useState, useTransition } from "react";
import { Check, Circle, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createTeamTask,
  deleteTeamTask,
  updateTeamTask,
  type TeamTask,
  type TaskStatus,
} from "@/app/actions/tasks";

const columns: {
  status: TaskStatus;
  label: string;
}[] = [
  { status: "todo", label: "To Do" },
  { status: "doing", label: "In Progress" },
  { status: "done", label: "Done" },
];

interface TeamTaskBoardProps {
  teamId: string;
  initialTasks: TeamTask[];
}

export default function TeamTaskBoard({
  teamId,
  initialTasks,
}: TeamTaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  const addTask = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("Enter a task title.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createTeamTask({
          teamId,
          title: trimmedTitle,
        });

        setTasks((current) => [result.task, ...current]);
        setTitle("");
        toast.success("Task created.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create task."
        );
      }
    });
  };

  const moveTask = (task: TeamTask, status: TaskStatus) => {
    if (task.status === status) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateTeamTask({
          taskId: task.id,
          teamId,
          status,
        });

        setTasks((current) =>
          current.map((item) =>
            item.id === task.id ? result.task : item
          )
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update task."
        );
      }
    });
  };

  const removeTask = (task: TeamTask) => {
    startTransition(async () => {
      try {
        await deleteTeamTask({
          taskId: task.id,
          teamId,
        });

        setTasks((current) =>
          current.filter((item) => item.id !== task.id)
        );

        toast.success("Task deleted.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete task."
        );
      }
    });
  };

  return (
    <section className="mt-8">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addTask();
              }
            }}
            placeholder="Add a new task..."
            maxLength={120}
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            disabled={isPending}
          />
        </div>

        <button
          type="button"
          onClick={addTask}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Task
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.status
          );

          return (
            <div
              key={column.status}
              className="min-h-[320px] rounded-2xl border bg-muted/30 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{column.label}</h2>
                  <p className="text-xs text-muted-foreground">
                    {columnTasks.length}{" "}
                    {columnTasks.length === 1 ? "task" : "tasks"}
                  </p>
                </div>

                <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed bg-background/50 p-6 text-center text-sm text-muted-foreground">
                    No tasks here
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-xl border bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words font-medium">
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="mt-1 break-words text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeTask(task)}
                          disabled={isPending}
                          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {column.status !== "todo" && (
                          <button
                            type="button"
                            onClick={() =>
                              moveTask(
                                task,
                                column.status === "done" ? "doing" : "todo"
                              )
                            }
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                          >
                            <Circle className="h-3.5 w-3.5" />
                            {column.status === "done"
                              ? "Move to Doing"
                              : "Move to To Do"}
                          </button>
                        )}

                        {column.status !== "done" && (
                          <button
                            type="button"
                            onClick={() =>
                              moveTask(
                                task,
                                column.status === "todo" ? "doing" : "done"
                              )
                            }
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                          >
                            {column.status === "todo" ? (
                              <>
                                <Circle className="h-3.5 w-3.5" />
                                Move to Doing
                              </>
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Mark Done
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
