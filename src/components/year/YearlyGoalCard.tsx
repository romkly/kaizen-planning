"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { GoalItem } from "@/validators/goal";

type YearlyGoalCardProps = {
  goal: GoalItem;
  source: "vision" | "year";
};

export function YearlyGoalCard({
  goal,
  source,
}: YearlyGoalCardProps) {
  const draggableId = `${source}:${goal._id}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: draggableId,
    data: {
      goalId: goal._id,
      source,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        cursor-grab touch-none rounded-xl border border-zinc-800
        bg-zinc-900 p-3 transition
        hover:border-zinc-600 active:cursor-grabbing
        ${isDragging ? "z-50 opacity-40" : ""}
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
                className="h-full rounded-full bg-zinc-300 transition-all"
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
      </div>
    </article>
  );
}