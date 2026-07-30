"use client";

import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { GoalItem } from "@/validators/goal";

type MonthlyGoalCardProps = {
  goal: GoalItem;
  source: "year" | "month";
  overlay?: boolean;
};

export function MonthlyGoalCard({
  goal,
  source,
  overlay = false,
}: MonthlyGoalCardProps) {
  const sortable = useSortable({
    id: `month:${goal._id}`,
    disabled: source !== "month" || overlay,
    data: {
      type: "month-goal",
      goalId: goal._id,
      source,
      status: goal.planning?.month?.status,
    },
  });

  const draggable = useDraggable({
    id: `year-source:${goal._id}`,
    disabled: source !== "year" || overlay,
    data: {
      type: "year-source-goal",
      goalId: goal._id,
      source,
    },
  });

  const activeHook =
    source === "month" ? sortable : draggable;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = activeHook;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      source === "month"
        ? sortable.transition
        : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        touch-none rounded-xl border border-zinc-800
        bg-zinc-900 p-3 transition-colors
        hover:border-zinc-600
        ${
          overlay
            ? "cursor-grabbing shadow-2xl"
            : "cursor-grab active:cursor-grabbing"
        }
        ${isDragging ? "opacity-30" : ""}
        ${goal.completed ? "opacity-70" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        {goal.icon ? (
          <span className="text-lg">
            {goal.icon}
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <h3
            className={`
              text-sm font-semibold text-zinc-100
              ${goal.completed ? "line-through" : ""}
            `}
          >
            {goal.title}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-300"
                style={{
                  width: `${goal.progress ?? 0}%`,
                }}
              />
            </div>

            <span className="text-xs text-zinc-500">
              {goal.progress ?? 0}%
            </span>
          </div>
        </div>

        <span className="select-none text-sm text-zinc-600">
          ⋮⋮
        </span>
      </div>
    </article>
  );
}