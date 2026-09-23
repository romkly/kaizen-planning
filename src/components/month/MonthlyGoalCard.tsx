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

  /*
   * DragOverlay is only a visual copy.
   * It must not receive DnD transforms,
   * refs or listeners.
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
    source === "month" ? sortable : draggable;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = activeHook;

  /*
   * Monthly cards need sortable transform.
   *
   * Year-source cards must stay in their original
   * position because DragOverlay renders the moving copy.
   */
  const style: React.CSSProperties =
    source === "month"
      ? {
          transform: CSS.Transform.toString(transform),
          transition: sortable.transition,
        }
      : {
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