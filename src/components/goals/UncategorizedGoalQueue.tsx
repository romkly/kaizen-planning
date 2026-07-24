"use client";

import { useDroppable } from "@dnd-kit/core";
import { DraggableGoalCard } from "@/components/goals/DraggableGoalCard";

type Goal = {
  _id: string;
  title: string;
  category: string | null;
};

type UncategorizedGoalQueueProps = {
  goals: Goal[];
};

export function UncategorizedGoalQueue({
  goals,
}: UncategorizedGoalQueueProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "uncategorized",
  });

  return (
    <section
      ref={setNodeRef}
      className={`
        rounded-2xl border p-5 transition
        ${
          isOver
            ? "border-white bg-zinc-900"
            : "border-zinc-800 bg-zinc-950"
        }
      `}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Uncategorized goals
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Drag each goal into the category that fits it best.
          </p>
        </div>

        <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-400">
          {goals.length}
        </span>
      </div>

      {goals.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {goals.map((goal) => (
            <DraggableGoalCard key={goal._id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-10 text-center text-sm text-zinc-600">
          All goals have been categorized. Drop a goal here to remove
          its category.
        </div>
      )}
    </section>
  );
}