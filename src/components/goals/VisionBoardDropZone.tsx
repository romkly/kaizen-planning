"use client";

import { useDroppable } from "@dnd-kit/core";

import type { VisionGoal } from "@/components/goals/VisionGoalCard";
import { VisionGoalTree } from "@/components/goals/VisionGoalTree";

type VisionBoardDropZoneProps = {
  goals: VisionGoal[];
  onOpenDetails: (goal: VisionGoal) => void;
  onToggleCompleted: (goal: VisionGoal) => void;
};

export function VisionBoardDropZone({
  goals,
  onOpenDetails,
  onToggleCompleted,
}: VisionBoardDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "vision-board-root",
    data: {
      type: "vision-root",
    },
  });

  const rootGoals = goals.filter(
    (goal) => goal.parentGoalId === null,
  );

  return (
    <section
      ref={setNodeRef}
      className={`
        mt-6 min-h-[600px] rounded-2xl border p-5 transition
        ${
          isOver
            ? "border-white bg-zinc-900"
            : "border-zinc-800 bg-zinc-950"
        }
      `}
    >
      <header className="mb-6 border-b border-zinc-800 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Your Life Vision
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Drop onto the board for a top-level goal,
              or onto another goal to create a subgoal.
            </p>
          </div>

          <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-400">
            {goals.length}
          </span>
        </div>
      </header>

      {rootGoals.length > 0 ? (
        <div className="grid items-start gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {rootGoals.map((goal) => (
            <VisionGoalTree
              key={goal._id}
              goal={goal}
              allGoals={goals}
              onOpenDetails={onOpenDetails}
              onToggleCompleted={onToggleCompleted}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
          <div>
            <p className="text-lg font-semibold text-zinc-400">
              Your Vision Board is empty
            </p>

            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
              Drag a prioritized goal from the queue
              and drop it anywhere in this area.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}