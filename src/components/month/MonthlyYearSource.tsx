"use client";

import { useDroppable } from "@dnd-kit/core";

import type { GoalItem } from "@/validators/goal";

import { MonthlyGoalCard } from "./MonthlyGoalCard";

type MonthlyYearSourceProps = {
  goals: GoalItem[];
  selectedYear: number;
  selectedMonth: number;
};

export function MonthlyYearSource({
  goals,
  selectedYear,
  selectedMonth,
}: MonthlyYearSourceProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "month-remove-zone",
    data: {
      type: "month-remove-zone",
    },
  });

  const availableGoals = goals.filter(
    (goal) =>
      !(
        goal.planning?.month?.year ===
          selectedYear &&
        goal.planning?.month?.month ===
          selectedMonth
      ),
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
          Yearly goals
        </h2>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Drag a yearly goal into this month. Drop a monthly
          goal back here to remove it from the selected month.
        </p>
      </header>

      <div className="space-y-3">
        {availableGoals.map((goal) => (
          <MonthlyGoalCard
            key={goal._id}
            goal={goal}
            source="year"
          />
        ))}

        {availableGoals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-10 text-center text-xs text-zinc-600">
            All yearly goals are already scheduled for this
            month.
          </div>
        ) : null}
      </div>
    </aside>
  );
}