"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";
import { GoalDetailsPanel } from "@/components/goals/GoalDetailsPanel";
import { VisionBoardDropZone } from "@/components/goals/VisionBoardDropZone";
import type { VisionGoal } from "@/components/goals/VisionGoalCard";
import { VisionQueue } from "@/components/goals/VisionQueue";
import { updateVisionGoal } from "@/server/actions/vision-actions";
import { setGoalCompleted } from "@/server/actions/goal-completion-actions";

type VisionBoardProps = {
  initialGoals: VisionGoal[];
};

export function VisionBoard({
  initialGoals,
}: VisionBoardProps) {
  const [isMounted, setIsMounted] =
    useState(false);
  const [goals, setGoals] =
    useState(initialGoals);
  const [activeGoal, setActiveGoal] =
    useState<VisionGoal | null>(null);
  const [selectedGoal, setSelectedGoal] =
    useState<VisionGoal | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] =
    useTransition();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setGoals(initialGoals);
  }, [initialGoals]);

  const closeDetails = useCallback(() => {
    setSelectedGoal(null);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  function handleDragStart(
    event: DragStartEvent,
  ) {
    const goal = goals.find(
      (candidate) =>
        candidate._id === String(event.active.id),
    );

    setActiveGoal(goal ?? null);
  }

  function handleDragCancel() {
    setActiveGoal(null);
  }

  function handleToggleCompleted(goal: VisionGoal) {
    setError("");
  
    const newCompletedState = !goal.completed;
    const previousGoals = goals;
  
    setGoals((currentGoals) =>
      currentGoals.map((currentGoal) =>
        currentGoal._id === goal._id
          ? {
              ...currentGoal,
              completed: newCompletedState,
              progress: newCompletedState ? 100 : 0,
            }
          : currentGoal,
      ),
    );
  
    startTransition(async () => {
      const result = await setGoalCompleted(
        goal._id,
        newCompletedState,
      );
  
      if (!result.success) {
        setGoals(previousGoals);
        setError(
          result.error ??
            "Failed to update goal completion",
        );
        return;
      }
  
      router.refresh();
    });
  }

  function handleGoalSaved(
    updatedGoal: VisionGoal,
  ) {
    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal._id === updatedGoal._id
          ? {
              ...goal,
              ...updatedGoal,
              placement: {
                ...goal.placement,
                ...updatedGoal.placement,
              },
            }
          : goal,
      ),
    );
  }

  function handleDragEnd(
    event: DragEndEvent,
  ) {
    setActiveGoal(null);
    setError("");

    const goalId = String(event.active.id);
    const overId = event.over
      ? String(event.over.id)
      : null;

    if (!overId) return;

    const selected = goals.find(
      (goal) => goal._id === goalId,
    );

    if (!selected) return;

    let isOnVisionBoard = true;
    let parentGoalId: string | null = null;

    if (overId === "vision-queue") {
      isOnVisionBoard = false;
    } else if (overId === "vision-board-root") {
      parentGoalId = null;
    } else if (
      overId.startsWith("goal-drop-")
    ) {
      parentGoalId = overId.replace(
        "goal-drop-",
        "",
      );

      if (parentGoalId === goalId) {
        return;
      }
    } else {
      return;
    }

    if (
      selected.placement.visionBoard ===
        isOnVisionBoard &&
      selected.parentGoalId === parentGoalId
    ) {
      return;
    }

    const previousGoals = goals;

    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal._id === goalId
          ? {
              ...goal,
              parentGoalId,
              placement: {
                ...goal.placement,
                visionBoard:
                  isOnVisionBoard,
              },
            }
          : goal,
      ),
    );

    startTransition(async () => {
      const result = await updateVisionGoal(goalId, {
        isOnVisionBoard,
        parentGoalId,
      });
    
      if (!result.success) {
        setGoals(previousGoals);
        setError(
          result.error ?? "Failed to update Vision Board",
        );
        return;
      }
    
      router.refresh();
    });
  }

  if (!isMounted) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center text-zinc-500">
        Loading Vision Board...
      </div>
    );
  }

  const queueGoals = goals.filter(
    (goal) =>
      !goal.placement.visionBoard,
  );

  const visionGoals = goals.filter(
    (goal) => goal.placement.visionBoard,
  );

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <VisionQueue goals={queueGoals} />

        {error && (
          <p className="mt-4 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        {isPending && (
          <p className="mt-4 text-center text-sm text-zinc-500">
            Saving Vision Board...
          </p>
        )}

        <VisionBoardDropZone
          goals={visionGoals}
          onOpenDetails={setSelectedGoal}
          onToggleCompleted={handleToggleCompleted}
        />

        <DragOverlay>
          {activeGoal ? (
            <article className="max-w-sm rounded-xl border border-white bg-zinc-900 px-4 py-3 shadow-2xl">
              <p className="font-semibold text-white">
                {activeGoal.icon || "🎯"}{" "}
                {activeGoal.title}
              </p>

              <p className="mt-2 text-xs capitalize text-zinc-500">
                {activeGoal.category.replaceAll(
                  "-",
                  " / ",
                )}
              </p>
            </article>
          ) : null}
        </DragOverlay>
      </DndContext>

      <GoalDetailsPanel
        goal={selectedGoal}
        onClose={closeDetails}
        onSaved={handleGoalSaved}
      />
    </>
  );
}