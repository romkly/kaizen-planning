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

type UnassignedPriorityQueueProps = {
  goals: Goal[];
};

export function UnassignedPriorityQueue({
  goals,
}: UnassignedPriorityQueueProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "unassigned-priority",
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
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Goals without priority
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Decide which goals are essential and which are optional.
          </p>
        </div>

        <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-400">
          {goals.length}
        </span>
      </header>

      {goals.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {goals.map((goal) => (
            <PriorityGoalCard key={goal._id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-10 text-center text-sm text-zinc-600">
          Every categorized goal has a priority.
        </div>
      )}
    </section>
  );
}