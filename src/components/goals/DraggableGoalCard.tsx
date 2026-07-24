"use client";

import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";

type DraggableGoalCardProps = {
  goal: {
    _id: string;
    title: string;
    category: string | null;
  };
};

export function DraggableGoalCard({
  goal,
}: DraggableGoalCardProps) {
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
      category: goal.category,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        cursor-grab touch-none rounded-xl border border-zinc-700
        bg-zinc-900 px-4 py-3 text-sm font-medium text-white
        shadow-md transition hover:border-zinc-500
        active:cursor-grabbing
        ${isDragging ? "z-50 opacity-50" : ""}
      `}
    >
      {goal.title}
    </div>
  );
}