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
  saveYearlyGoalPositions,
} from "@/server/actions/yearly-planning-actions";

import type {
  GoalItem,
  YearlyGoalStatus,
} from "@/validators/goal";

import {
  arrayMove,
} from "@dnd-kit/sortable";

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

  function getGoalIdFromDragId(id: string) {
    return id.replace(/^year:/, "").replace(
      /^vision:/,
      "",
    );
  }
  
  function getColumnGoals(
    currentGoals: GoalItem[],
    status: YearlyGoalStatus,
  ) {
    return currentGoals
      .filter(
        (goal) =>
          goal.planning?.year?.year === selectedYear &&
          goal.planning?.year?.status === status,
      )
      .sort(
        (firstGoal, secondGoal) =>
          (firstGoal.planning?.year?.order ?? 0) -
          (secondGoal.planning?.year?.order ?? 0),
      );
  }
  
  function normalizeYearlyOrders(
    currentGoals: GoalItem[],
  ) {
    const normalizedGoals = [...currentGoals];
  
    for (const column of columns) {
      const columnGoals = getColumnGoals(
        normalizedGoals,
        column.status,
      );
  
      columnGoals.forEach((columnGoal, index) => {
        const goalIndex = normalizedGoals.findIndex(
          (goal) => goal._id === columnGoal._id,
        );
  
        if (goalIndex === -1) {
          return;
        }
  
        normalizedGoals[goalIndex] = {
          ...normalizedGoals[goalIndex],
          planning: {
            ...normalizedGoals[goalIndex].planning,
            year: {
              year: selectedYear,
              status: column.status,
              order: index,
            },
          },
        };
      });
    }
  
    return normalizedGoals;
  }
  
  function createPositionUpdates(
    currentGoals: GoalItem[],
  ) {
    return currentGoals
      .filter(
        (goal) =>
          goal.planning?.year?.year === selectedYear &&
          goal.planning.year,
      )
      .map((goal) => ({
        goalId: goal._id,
        year: selectedYear,
        status: goal.planning!.year!.status,
        order: goal.planning!.year!.order,
      }));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
  
    setActiveGoalId(null);
  
    if (!over) {
      return;
    }
  
    const goalId =
      String(active.data.current?.goalId ?? "") ||
      getGoalIdFromDragId(String(active.id));
  
    const source =
      active.data.current?.source as
        | "vision"
        | "year"
        | undefined;
  
    const overId = String(over.id);
    const previousGoals = goals;
  
    setError(null);
  
    if (overId === "year-remove-zone") {
      if (source !== "year") {
        return;
      }
  
      const updatedGoals = normalizeYearlyOrders(
        goals.map((goal) =>
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
  
      setGoals(updatedGoals);
  
      startTransition(async () => {
        const removeResult =
          await removeGoalFromYear(goalId);
  
        if (!removeResult.success) {
          setGoals(previousGoals);
          setError(
            removeResult.error ??
              "Failed to remove goal from year",
          );
          return;
        }
  
        const saveResult =
          await saveYearlyGoalPositions(
            createPositionUpdates(updatedGoals),
          );
  
        if (!saveResult.success) {
          setGoals(previousGoals);
          setError(
            saveResult.error ??
              "Failed to update yearly order",
          );
          return;
        }
  
        if (!isDemoMode) {
          router.refresh();
        }
      });
  
      return;
    }
  
    let targetStatus: YearlyGoalStatus | null = null;
    let targetGoalId: string | null = null;
  
    if (overId.startsWith("year-column:")) {
      targetStatus = overId.replace(
        "year-column:",
        "",
      ) as YearlyGoalStatus;
    }
  
    if (overId.startsWith("year:")) {
      targetGoalId = getGoalIdFromDragId(overId);
  
      const targetGoal = goals.find(
        (goal) => goal._id === targetGoalId,
      );
  
      targetStatus =
        targetGoal?.planning?.year?.status ?? null;
    }
  
    if (!targetStatus) {
      return;
    }
  
    const validStatuses: YearlyGoalStatus[] = [
      "todo",
      "planned",
      "in-progress",
      "done",
    ];
  
    if (!validStatuses.includes(targetStatus)) {
      return;
    }
  
    let updatedGoals = goals.map((goal) => {
      if (goal._id !== goalId) {
        return goal;
      }
  
      return {
        ...goal,
        planning: {
          ...goal.planning,
          year: {
            year: selectedYear,
            status: targetStatus,
            order: 0,
          },
        },
      };
    });
  
    const targetColumnGoals = getColumnGoals(
      updatedGoals,
      targetStatus,
    );
  
    const oldIndex = targetColumnGoals.findIndex(
      (goal) => goal._id === goalId,
    );
  
    const targetIndex = targetGoalId
      ? targetColumnGoals.findIndex(
          (goal) => goal._id === targetGoalId,
        )
      : targetColumnGoals.length - 1;
  
    if (
      oldIndex !== -1 &&
      targetIndex !== -1 &&
      oldIndex !== targetIndex
    ) {
      const reorderedColumn = arrayMove(
        targetColumnGoals,
        oldIndex,
        targetIndex,
      );
  
      updatedGoals = updatedGoals.map((goal) => {
        const reorderedIndex =
          reorderedColumn.findIndex(
            (columnGoal) =>
              columnGoal._id === goal._id,
          );
  
        if (reorderedIndex === -1) {
          return goal;
        }
  
        return {
          ...goal,
          planning: {
            ...goal.planning,
            year: {
              year: selectedYear,
              status: targetStatus,
              order: reorderedIndex,
            },
          },
        };
      });
    }
  
    updatedGoals =
      normalizeYearlyOrders(updatedGoals);
  
    setGoals(updatedGoals);
  
    startTransition(async () => {
      const result = await saveYearlyGoalPositions(
        createPositionUpdates(updatedGoals),
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
              overlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}