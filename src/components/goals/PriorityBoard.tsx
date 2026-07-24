"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useTransition,
} from "react";

import { PriorityColumn } from "@/components/goals/PriorityColumn";
import { UnassignedPriorityQueue } from "@/components/goals/UnassignedPriorityQueue";
import { updateGoalPriority } from "@/server/actions/priority-actions";

type GoalPriority = "must" | "want";

type Goal = {
  _id: string;
  title: string;
  category: string;
  priorityType: GoalPriority | null;
};

type PriorityBoardProps = {
  initialGoals: Goal[];
};

export function PriorityBoard({
  initialGoals,
}: PriorityBoardProps) {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [goals, setGoals] = useState(initialGoals);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const draggedGoal = goals.find(
      (goal) => goal._id === String(event.active.id),
    );

    setActiveGoal(draggedGoal ?? null);
  }

  function handleDragCancel() {
    setActiveGoal(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveGoal(null);
    setError("");

    const goalId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;

    if (!overId) return;

    const selectedGoal = goals.find((goal) => goal._id === goalId);

    if (!selectedGoal) return;

    const newPriority: GoalPriority | null =
      overId === "unassigned-priority"
        ? null
        : (overId as GoalPriority);

    if (
      newPriority !== null &&
      newPriority !== "must" &&
      newPriority !== "want"
    ) {
      return;
    }

    if (selectedGoal.priorityType === newPriority) return;

    const previousGoals = goals;

    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal._id === goalId
          ? {
              ...goal,
              priorityType: newPriority,
            }
          : goal,
      ),
    );

    startTransition(async () => {
      const result = await updateGoalPriority(goalId, newPriority);

      if (!result.success) {
        setGoals(previousGoals);
        setError(result.error ?? "Failed to save priority");
        return;
      }

      router.refresh();
    });
  }

  if (!isMounted) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center text-zinc-500">
        Loading priority board...
      </div>
    );
  }

  const unassignedGoals = goals.filter(
    (goal) => goal.priorityType === null,
  );

  const mustGoals = goals.filter(
    (goal) => goal.priorityType === "must",
  );

  const wantGoals = goals.filter(
    (goal) => goal.priorityType === "want",
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <UnassignedPriorityQueue goals={unassignedGoals} />

      {error && (
        <p className="mt-4 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      {isPending && (
        <p className="mt-4 text-center text-sm text-zinc-500">
          Saving changes...
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PriorityColumn
          id="must"
          title="Must"
          description="Essential goals that directly affect your responsibilities, stability or long-term direction."
          goals={mustGoals}
        />

        <PriorityColumn
          id="want"
          title="Want"
          description="Goals that improve your life but are not currently essential."
          goals={wantGoals}
        />
      </div>

      <DragOverlay>
        {activeGoal ? (
          <div className="max-w-sm rounded-xl border border-white bg-zinc-900 px-4 py-3 shadow-2xl">
            <p className="text-sm font-semibold text-white">
              {activeGoal.title}
            </p>

            <p className="mt-2 text-xs capitalize text-zinc-500">
              {activeGoal.category.replaceAll("-", " / ")}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}