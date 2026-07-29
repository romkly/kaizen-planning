"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  removeGoalFromYear,
  updateYearlyPlanning,
} from "@/server/actions/yearly-planning-actions";

import type {
  GoalItem,
  YearlyGoalStatus,
} from "@/validators/goal";

import { YearlyGoalCard } from "./YearlyGoalCard";
import { YearlyKanbanColumn } from "./YearlyKanbanColumn";
import { YearVisionSource } from "./YearVisionSource";

type YearlyKanbanProps = {
  initialGoals: GoalItem[];
  initialYear: number;
};

const columns: Array<{
  status: YearlyGoalStatus;
  title: string;
  description: string;
}> = [
  {
    status: "todo",
    title: "To Do",
    description: "Goals you may work on this year.",
  },
  {
    status: "planned",
    title: "Planned",
    description: "Goals committed to the yearly plan.",
  },
  {
    status: "in-progress",
    title: "In Progress",
    description: "Goals currently receiving active work.",
  },
  {
    status: "done",
    title: "Done",
    description: "Goals completed during this year.",
  },
];

export function YearlyKanban({
  initialGoals,
  initialYear,
}: YearlyKanbanProps) {
  const router = useRouter();

  const isDemoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const [goals, setGoals] =
    useState<GoalItem[]>(initialGoals);

  const [selectedYear, setSelectedYear] =
    useState(initialYear);

  const [activeGoalId, setActiveGoalId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  useEffect(() => {
    if (!isDemoMode) {
      setGoals(initialGoals);
    }
  }, [initialGoals, isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      return;
    }

    const storedGoals = localStorage.getItem(
      "kaizen-demo-goals",
    );

    if (!storedGoals) {
      return;
    }

    try {
      const parsedGoals = JSON.parse(
        storedGoals,
      ) as GoalItem[];

      setGoals(parsedGoals);
    } catch {
      localStorage.removeItem(
        "kaizen-demo-goals",
      );
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      return;
    }

    localStorage.setItem(
      "kaizen-demo-goals",
      JSON.stringify(goals),
    );
  }, [goals, isDemoMode]);

  const visionGoals = useMemo(
    () =>
      goals.filter(
        (goal) =>
          goal.category !== null &&
          goal.priorityType !== null &&
          goal.placement?.visionBoard !== false,
      ),
    [goals],
  );

  const yearlyGoals = useMemo(
    () =>
      goals.filter(
        (goal) =>
          goal.planning?.year?.year === selectedYear,
      ),
    [goals, selectedYear],
  );

  const activeGoal = useMemo(
    () =>
      goals.find(
        (goal) => goal._id === activeGoalId,
      ) ?? null,
    [goals, activeGoalId],
  );

  function changeYear(amount: number) {
    setSelectedYear((currentYear) =>
      currentYear + amount
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveGoalId(null);

    if (!over) {
      return;
    }

    const goalId =
      String(active.data.current?.goalId ?? "")
        .trim();

    if (!goalId) {
      return;
    }

    const overId = String(over.id);

    const previousGoals = goals;

    setError(null);

    if (overId === "year-remove-zone") {
      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal._id === goalId
            ? {
                ...goal,
                planning: {
                  ...goal.planning,
                  year: null,
                },
              }
            : goal,
        ),
      );

      startTransition(async () => {
        const result =
          await removeGoalFromYear(goalId);

        if (!result.success) {
          setGoals(previousGoals);
          setError(
            result.error ??
              "Failed to remove goal from year",
          );
          return;
        }

        if (!isDemoMode) {
          router.refresh();
        }
      });

      return;
    }

    if (!overId.startsWith("year-column:")) {
      return;
    }

    const status = overId.replace(
      "year-column:",
      "",
    ) as YearlyGoalStatus;

    if (
      ![
        "todo",
        "planned",
        "in-progress",
        "done",
      ].includes(status)
    ) {
      return;
    }

    const columnGoals = goals.filter(
      (goal) =>
        goal.planning?.year?.year ===
          selectedYear &&
        goal.planning?.year?.status === status,
    );

    const order = columnGoals.length;

    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal._id === goalId
          ? {
              ...goal,
              planning: {
                ...goal.planning,
                year: {
                  year: selectedYear,
                  status,
                  order,
                },
              },
            }
          : goal,
      ),
    );

    startTransition(async () => {
      const result = await updateYearlyPlanning(
        goalId,
        {
          year: selectedYear,
          status,
          order,
        },
      );

      if (!result.success) {
        setGoals(previousGoals);
        setError(
          result.error ??
            "Failed to update yearly plan",
        );
        return;
      }

      if (!isDemoMode) {
        router.refresh();
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        const goalId =
          event.active.data.current?.goalId;

        setActiveGoalId(
          goalId ? String(goalId) : null,
        );
      }}
      onDragCancel={() => {
        setActiveGoalId(null);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Yearly planning
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-100">
              Year {selectedYear}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Choose which Vision goals deserve your
              attention this year.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeYear(-1)}
              className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
            >
              ←
            </button>

            <div className="min-w-24 rounded-lg border border-zinc-800 px-4 py-2 text-center text-sm font-semibold text-zinc-100">
              {selectedYear}
            </div>

            <button
              type="button"
              onClick={() => changeYear(1)}
              className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
            >
              →
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <YearVisionSource
            goals={visionGoals}
            selectedYear={selectedYear}
          />

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {columns.map((column) => (
              <YearlyKanbanColumn
                key={column.status}
                status={column.status}
                title={column.title}
                description={column.description}
                goals={yearlyGoals
                  .filter(
                    (goal) =>
                      goal.planning?.year?.status ===
                      column.status,
                  )
                  .sort(
                    (firstGoal, secondGoal) =>
                      (firstGoal.planning?.year
                        ?.order ?? 0) -
                      (secondGoal.planning?.year
                        ?.order ?? 0),
                  )}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeGoal ? (
          <div className="w-64">
            <YearlyGoalCard
              goal={activeGoal}
              source="year"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}