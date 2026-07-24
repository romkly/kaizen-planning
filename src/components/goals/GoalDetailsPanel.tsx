"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import type { VisionGoal } from "@/components/goals/VisionGoalCard";
import {
  GOAL_CATEGORIES,
  GOAL_LEVELS,
  GOAL_PRIORITY_TYPES,
} from "@/constants/goals";
import { updateGoal } from "@/server/actions/update-goal";

type GoalDetailsPanelProps = {
  goal: VisionGoal | null;
  onClose: () => void;
  onSaved: (goal: VisionGoal) => void;
};

type FormState = {
  title: string;
  description: string;
  icon: string;
  color: string;
  deadline: string;
  estimatedHours: string;
  notes: string;
  category: string;
  priorityType: string;
  level: string;
};

function toDateInputValue(
  value?: string | null,
) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function createFormState(
  goal: VisionGoal,
): FormState {
  return {
    title: goal.title,
    description: goal.description ?? "",
    icon: goal.icon || "🎯",
    color: goal.color || "#52525b",
    deadline: toDateInputValue(goal.deadline),
    estimatedHours:
      goal.estimatedHours?.toString() ?? "",
    notes: goal.notes ?? "",
    category: goal.category,
    priorityType: goal.priorityType,
    level: goal.level,
  };
}

export function GoalDetailsPanel({
  goal,
  onClose,
  onSaved,
}: GoalDetailsPanelProps) {
  const [form, setForm] =
    useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] =
    useTransition();

  useEffect(() => {
    if (!goal) {
      setForm(null);
      return;
    }

    setForm(createFormState(goal));
    setError("");
  }, [goal]);

  useEffect(() => {
    if (!goal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
      document.body.style.overflow = "";
    };
  }, [goal, onClose]);

  if (!goal || !form) {
    return null;
  }

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  }

  function handleSave() {
    setError("");

    const estimatedHours =
      form?.estimatedHours.trim() === ""
        ? null
        : Number(form?.estimatedHours);

    if (
      estimatedHours !== null &&
      (!Number.isFinite(estimatedHours) ||
        estimatedHours < 0)
    ) {
      setError(
        "Estimated hours must be a positive number",
      );
      return;
    }

    startTransition(async () => {
      const result = await updateGoal(goal?._id ?? "", {
        title: form?.title,
        description: form?.description,
        icon: form?.icon,
        color: form?.color,
        deadline: form?.deadline || null,
        estimatedHours,
        notes: form?.notes,
        category: form?.category as
          | (typeof GOAL_CATEGORIES)[number]
          | null,
        priorityType: form?.priorityType as
          | (typeof GOAL_PRIORITY_TYPES)[number]
          | null,
        level: form?.level as
          (typeof GOAL_LEVELS)[number],
      });

      if (!result.success) {
        setError(
          result.error ?? "Failed to save goal",
        );
        return;
      }

      onSaved(result.goal as VisionGoal);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-zinc-800 bg-[#0b0b0d] shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-[#0b0b0d]/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Goal details
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Edit your goal
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-xl text-zinc-400 transition hover:border-white hover:text-white"
            aria-label="Close goal details"
          >
            ×
          </button>
        </header>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-[90px_1fr] gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-300">
                Icon
              </span>

              <input
                value={form.icon}
                onChange={(event) =>
                  updateField(
                    "icon",
                    event.target.value,
                  )
                }
                maxLength={10}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-center text-2xl outline-none transition focus:border-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-300">
                Title
              </span>

              <input
                value={form.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value,
                  )
                }
                maxLength={360}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-white"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-300">
              Description
            </span>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              maxLength={2000}
              rows={4}
              className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-white"
              placeholder="Describe the outcome you want to achieve..."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-300">
                Level
              </span>

              <select
                value={form.level}
                onChange={(event) =>
                  updateField(
                    "level",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-white"
              >
                {GOAL_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-300">
                Priority
              </span>

              <select
                value={form.priorityType}
                onChange={(event) =>
                  updateField(
                    "priorityType",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-white"
              >
                {GOAL_PRIORITY_TYPES.map(
                  (priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-300">
              Category
            </span>

            <select
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-white"
            >
              {GOAL_CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category.replaceAll("-", " / ")}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-300">
                Color
              </span>

              <div className="flex gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) =>
                    updateField(
                      "color",
                      event.target.value,
                    )
                  }
                  className="h-12 w-14 cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 p-1"
                />

                <input
                  value={form.color}
                  onChange={(event) =>
                    updateField(
                      "color",
                      event.target.value,
                    )
                  }
                  className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm uppercase outline-none transition focus:border-white"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-zinc-300">
                Deadline
              </span>

              <input
                type="date"
                value={form.deadline}
                onChange={(event) =>
                  updateField(
                    "deadline",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-white"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-300">
              Estimated hours
            </span>

            <input
              type="number"
              min="0"
              step="0.5"
              value={form.estimatedHours}
              onChange={(event) =>
                updateField(
                  "estimatedHours",
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-white"
              placeholder="For example: 40"
            />
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-300">
                Progress
              </span>

              <span className="text-sm text-zinc-500">
                {goal.progress ?? 0}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${goal.progress ?? 0}%`,
                  backgroundColor: form.color,
                }}
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-600">
              Progress will be calculated from completed
              subgoals.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-zinc-300">
              Notes
            </span>

            <textarea
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value,
                )
              }
              maxLength={10000}
              rows={7}
              className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none transition focus:border-white"
              placeholder="Ideas, context, reminders, links..."
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-zinc-800 bg-[#0b0b0d]/95 px-6 py-5 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition hover:border-white hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              isPending || form.title.trim() === ""
            }
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save changes"}
          </button>
        </footer>
      </aside>
    </div>
  );
}