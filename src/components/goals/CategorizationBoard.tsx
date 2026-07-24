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
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { CategoryColumn } from "@/components/goals/CatgeoryColumn";
import { UncategorizedGoalQueue } from "@/components/goals/UncategorizedGoalQueue";
import { updateGoalCategory } from "@/server/actions/category-actions";

type GoalCategory =
  | "self-development"
  | "business-work"
  | "family"
  | "hobby-personal"
  | "public-affairs";

type Goal = {
  _id: string;
  title: string;
  category: GoalCategory | null;
};

type CategorizationBoardProps = {
  initialGoals: Goal[];
};

const categoryDefinitions: Array<{
  id: GoalCategory;
  title: string;
  description: string;
}> = [

  {
    id: "self-development",
    title: "Self-development",
    description:
      "Health, education, discipline, confidence and personal growth.",
  },
  {
    id: "business-work",
    title: "Business / Work",
    description:
      "Career, income, projects, entrepreneurship and professional skills.",
  },
  {
    id: "family",
    title: "Family",
    description:
      "Relationships, family life, home and people close to you.",
  },
  {
    id: "hobby-personal",
    title: "Hobby / Personal",
    description:
      "Travel, entertainment, creativity, hobbies and personal experiences.",
  },
  {
    id: "public-affairs",
    title: "Public Affairs",
    description:
      "Community, contribution, social impact and helping other people.",
  },
];

export function CategorizationBoard({
  initialGoals,
}: CategorizationBoardProps) {
  const router = useRouter();

  const [goals, setGoals] = useState(initialGoals); 
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const [isMounted, setIsMounted] = useState(false);

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

    const newCategory: GoalCategory | null =
      overId === "uncategorized"
        ? null
        : (overId as GoalCategory);

    if (selectedGoal.category === newCategory) return;

    const previousGoals = goals;

    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal._id === goalId
          ? {
              ...goal,
              category: newCategory,
            }
          : goal,
      ),
    );

    startTransition(async () => {
      const result = await updateGoalCategory(goalId, newCategory);

      if (!result.success) {
        setGoals(previousGoals);
        setError(result.error ?? "Failed to update category");
        return;
      }

      router.refresh();
    });
  }

  const uncategorizedGoals = goals.filter(
    (goal) => goal.category === null,
  );

  if (!isMounted) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center text-zinc-500">
        Loading categorization board...
      </div>
    );
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <UncategorizedGoalQueue goals={uncategorizedGoals} />

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

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {categoryDefinitions.map((category) => (
            <CategoryColumn
              key={category.id}
              id={category.id}
              title={category.title}
              description={category.description}
              goals={goals.filter(
                (goal) => goal.category === category.id,
              )}
            />
          ))}
        </div>

        <DragOverlay>
          {activeGoal ? (
            <div className="max-w-xs rounded-xl border border-white bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
              {activeGoal.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}