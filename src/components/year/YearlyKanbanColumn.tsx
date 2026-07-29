"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type {
  GoalItem,
  YearlyGoalStatus,
} from "@/validators/goal";

import { YearlyGoalCard } from "./YearlyGoalCard";

type YearlyKanbanColumnProps = {
  status: YearlyGoalStatus;
  title: string;
  description: string;
  goals: GoalItem[];
};

export function YearlyKanbanColumn({
  status,
  title,
  description,
  goals,
}: YearlyKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `year-column:${status}`,
    data: {
      type: "year-column",
      status,
    },
  });

  const sortableIds = goals.map(
    (goal) => `year:${goal._id}`,
  );

  return (
    <section
      ref={setNodeRef}
      className={`
        min-h-[520px] rounded-2xl border p-4 transition
        ${
          isOver
            ? "border-zinc-400 bg-zinc-900/80"
            : "border-zinc-800 bg-zinc-950"
        }
      `}
    >
      <header className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-zinc-100">
            {title}
          </h2>

          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
            {goals.length}
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {description}
        </p>
      </header>

      <SortableContext
        items={sortableIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {goals.map((goal) => (
            <YearlyGoalCard
              key={goal._id}
              goal={goal}
              source="year"
            />
          ))}

          {goals.length === 0 ? (
            <div
              className={`
                flex min-h-32 items-center justify-center
                rounded-xl border border-dashed px-4
                text-center text-xs
                ${
                  isOver
                    ? "border-zinc-500 text-zinc-300"
                    : "border-zinc-800 text-zinc-600"
                }
              `}
            >
              Drop goals here
            </div>
          ) : null}
        </div>
      </SortableContext>
    </section>
  );
}