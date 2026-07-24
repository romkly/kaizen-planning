"use client";

import { useDroppable } from "@dnd-kit/core";

import { PriorityGoalCard } from "@/components/goals/PriorityGoalCard";

type GoalPriority = "must" | "want";

type Goal = {
  _id: string;
  title: string;
  category: string;
  priorityType: GoalPriority | null;
};

type PriorityColumnProps = {
  id: GoalPriority;
  title: string;
  description: string;
  goals: Goal[];
};

export function PriorityColumn({
  id,
  title,
  description,
  goals,
}: PriorityColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <section
      ref={setNodeRef}
      className={`
        flex min-h-[500px] flex-col rounded-2xl border p-5 transition
        ${
          isOver
            ? "border-white bg-zinc-900"
            : "border-zinc-800 bg-zinc-950"
        }
      `}
    >
      <header className="border-b border-zinc-800 pb-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>

          <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-400">
            {goals.length}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </header>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        {goals.map((goal) => (
          <PriorityGoalCard key={goal._id} goal={goal} />
        ))}

        {goals.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-600">
            Drop goals here
          </div>
        )}
      </div>
    </section>
  );
}