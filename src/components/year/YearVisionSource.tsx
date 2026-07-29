"use client";

import { useDroppable } from "@dnd-kit/core";

import type { GoalItem } from "@/validators/goal";

import { YearlyGoalCard } from "./YearlyGoalCard";

type YearVisionSourceProps = {
  goals: GoalItem[];
  selectedYear: number;
};

export function YearVisionSource({
  goals,
  selectedYear,
}: YearVisionSourceProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "year-remove-zone",
    data: {
      type: "year-remove-zone",
    },
  });

  const availableGoals = goals.filter(
    (goal) =>
      goal.planning?.year?.year !== selectedYear,
  );

  return (
    <aside
      ref={setNodeRef}
      className={`
        rounded-2xl border p-4 transition
        ${
          isOver
            ? "border-red-400/70 bg-red-950/20"
            : "border-zinc-800 bg-zinc-950"
        }
      `}
    >
      <header className="mb-4">
        <h2 className="font-semibold text-zinc-100">
          Vision goals
        </h2>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Drag a goal into the {selectedYear} plan. Drop a
          scheduled goal back here to remove it.
        </p>
      </header>

      <div className="space-y-3">
        {availableGoals.map((goal) => (
          <YearlyGoalCard
            key={goal._id}
            goal={goal}
            source="vision"
          />
        ))}

        {availableGoals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-10 text-center text-xs text-zinc-600">
            All available Vision goals are already scheduled
            for {selectedYear}.
          </div>
        ) : null}
      </div>
    </aside>
  );
}