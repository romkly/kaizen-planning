"use client";

import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { GoalItem } from "@/validators/goal";

type YearlyGoalCardProps = {
  goal: GoalItem;
  source: "vision" | "year";
  overlay?: boolean;
};

type CardContentProps = {
  goal: GoalItem;
};

function CardContent({ goal }: CardContentProps) {
  return (
    <div className="flex items-start gap-3">
      {goal.icon ? (
        <span className="shrink-0 text-lg">
          {goal.icon}
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <h3
          className={`
            break-words text-sm font-semibold text-zinc-100
            ${goal.completed ? "line-through" : ""}
          `}
        >
          {goal.title}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-zinc-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, goal.progress ?? 0),
                )}%`,
              }}
            />
          </div>

          <span className="shrink-0 text-xs text-zinc-500">
            {goal.progress ?? 0}%
          </span>
        </div>
      </div>

      <span className="shrink-0 select-none text-sm text-zinc-600">
        ⋮⋮
      </span>
    </div>
  );
}

export function YearlyGoalCard({
  goal,
  source,
  overlay = false,
}: YearlyGoalCardProps) {
  const sortable = useSortable({
    id: `year:${goal._id}`,
    disabled: source !== "year" || overlay,
    data: {
      type: "year-goal",
      goalId: goal._id,
      source,
      status: goal.planning?.year?.status,
    },
  });

  const draggable = useDraggable({
    id: `vision:${goal._id}`,
    disabled: source !== "vision" || overlay,
    data: {
      type: "vision-goal",
      goalId: goal._id,
      source,
    },
  });

  /*
   * DragOverlay must not receive transforms, refs or listeners
   * from useSortable/useDraggable.
   */
  if (overlay) {
    return (
      <article
        className={`
          w-[260px] rounded-xl border border-zinc-600
          bg-zinc-900 p-3 shadow-2xl
          ${goal.completed ? "opacity-70" : ""}
        `}
      >
        <CardContent goal={goal} />
      </article>
    );
  }

  const activeHook =
    source === "year" ? sortable : draggable;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = activeHook;

  const style: React.CSSProperties =
  source === "year"
    ? {
        transform: CSS.Transform.toString(transform),
        transition: sortable.transition,
      }
    : {
        // Vision cards stay in their original position.
        // DragOverlay renders the moving copy.
        transform: undefined,
        transition: undefined,
      };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        w-full touch-none rounded-xl border border-zinc-800
        bg-zinc-900 p-3 transition-colors
        hover:border-zinc-600
        cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-30" : ""}
        ${goal.completed ? "opacity-70" : ""}
      `}
    >
      <CardContent goal={goal} />
    </article>
  );
}