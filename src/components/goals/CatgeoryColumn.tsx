"use client";

import { useDroppable } from "@dnd-kit/core";
import { DraggableGoalCard } from "@/components/goals/DraggableGoalCard";

type Goal = {
  _id: string;
  title: string;
  category: string | null;
};

type CategoryColumnProps = {
  id: string;
  title: string;
  description: string;
  goals: Goal[];
};

export function CategoryColumn({
  id,
  title,
  description,
  goals,
}: CategoryColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <section
      ref={setNodeRef}
      className={`
        flex min-h-80 flex-col rounded-2xl border p-4 transition
        ${
          isOver
            ? "border-white bg-zinc-900"
            : "border-zinc-800 bg-zinc-950"
        }
      `}
    >
      <header className="mb-4 border-b border-zinc-800 pb-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-bold text-white">{title}</h2>

          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
            {goals.length}
          </span>
        </div>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          {description}
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {goals.map((goal) => (
          <DraggableGoalCard key={goal._id} goal={goal} />
        ))}

        {goals.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-800 p-5 text-center text-xs text-zinc-600">
            Drop goals here
          </div>
        )}
      </div>
    </section>
  );
}