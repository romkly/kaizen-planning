"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { VisionGoal } from "@/components/goals/VisionGoalCard";

type VisionQueueProps = {
  goals: VisionGoal[];
};

function QueueGoalCard({ goal }: { goal: VisionGoal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: goal._id,
    data: {
      type: "queue-goal",
      goalId: goal._id,
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
        bg-zinc-900 px-4 py-3 transition hover:border-zinc-500
        active:cursor-grabbing
        ${isDragging ? "z-50 opacity-40" : ""}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          {goal.title}
        </p>

        <span className="shrink-0 text-[10px] font-semibold uppercase text-zinc-500">
          {goal.priorityType}
        </span>
      </div>

      <p className="mt-2 text-xs capitalize text-zinc-600">
        {goal.category.replaceAll("-", " / ")}
      </p>
    </article>
  );
}

export function VisionQueue({ goals }: VisionQueueProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "vision-queue",
    data: {
      type: "vision-queue",
    },
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
            Goal queue
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Drag goals onto your Vision Board.
          </p>
        </div>

        <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-400">
          {goals.length}
        </span>
      </header>

      {goals.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {goals.map((goal) => (
            <QueueGoalCard key={goal._id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 px-5 py-10 text-center text-sm text-zinc-600">
          Every prioritized goal is currently on the Vision Board.
          Drop a goal here to remove it from the board.
        </div>
      )}
    </section>
  );
}