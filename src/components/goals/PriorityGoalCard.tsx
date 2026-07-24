"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type GoalPriority = "must" | "want";

type PriorityGoalCardProps = {
  goal: {
    _id: string;
    title: string;
    category: string;
    priorityType: GoalPriority | null;
  };
};

export function PriorityGoalCard({
  goal,
}: PriorityGoalCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: goal._id,
    data: {
      goalId: goal._id,
      priorityType: goal.priorityType,
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
        cursor-grab touch-none rounded-xl border border-zinc-700
        bg-zinc-900 px-4 py-3 shadow-md transition
        hover:border-zinc-500 active:cursor-grabbing
        ${isDragging ? "z-50 opacity-40" : ""}
      `}
    >
      <p className="text-sm font-semibold text-white">{goal.title}</p>

      <p className="mt-2 text-xs capitalize text-zinc-500">
        {goal.category.replaceAll("-", " / ")}
      </p>
    </article>
  );
}