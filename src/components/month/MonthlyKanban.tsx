"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  removeGoalFromMonth,
  saveMonthlyGoalPositions,
} from "@/server/actions/monthly-planning-actions";

import type {
  GoalItem,
  MonthlyGoalStatus,
} from "@/validators/goal";

import { MonthlyGoalCard } from "./MonthlyGoalCard";
import { MonthlyKanbanColumn } from "./MonthlyKanbanColumn";
import { MonthlyYearSource } from "./MonthlyYearSource";

type MonthlyKanbanProps = {
  initialGoals: GoalItem[];
  initialYear: number;
  initialMonth: number;
};

const columns: Array<{
  status: MonthlyGoalStatus;
  title: string;
  description: string;
}> = [
  {
    status: "todo",
    title: "To Do",
    description: "Goals available for this month.",
  },
  {
    status: "planned",
    title: "Planned",
    description: "Goals committed to the monthly plan.",
  },
  {
    status: "in-progress",
    title: "In Progress",
    description: "Goals currently receiving active work.",
  },
  {
    status: "today",
    title: "Today",
    description: "Goals that need attention today.",
  },
  {
    status: "done",
    title: "Done",
    description: "Goals completed during this month.",
  },
];

const validStatuses: MonthlyGoalStatus[] = [
  "todo",
  "planned",
  "in-progress",
  "today",
  "done",
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MonthlyKanban({
  initialGoals,
  initialYear,
  initialMonth,
}: MonthlyKanbanProps) {
  const router = useRouter();

  const isDemoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const [goals, setGoals] =
    useState<GoalItem[]>(initialGoals);

  const [selectedYear, setSelectedYear] =
    useState(initialYear);

  const [selectedMonth, setSelectedMonth] =
    useState(initialMonth);

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
    setGoals(initialGoals);
  }, [initialGoals]);

  const yearlyGoals = useMemo(
    () =>
      goals.filter(
        (goal) =>
          goal.planning?.year?.year === selectedYear,
      ),
    [goals, selectedYear],
  );

  const monthlyGoals = useMemo(
    () =>
      goals.filter(
        (goal) =>
          goal.planning?.month?.year === selectedYear &&
          goal.planning?.month?.month === selectedMonth,
      ),
    [goals, selectedYear, selectedMonth],
  );

  const activeGoal = useMemo(
    () =>
      goals.find(
        (goal) => goal._id === activeGoalId,
      ) ?? null,
    [goals, activeGoalId],
  );

  function getGoalIdFromDragId(id: string) {
    return id
      .replace(/^month:/, "")
      .replace(/^year-source:/, "");
  }

  function getColumnGoals(
    currentGoals: GoalItem[],
    status: MonthlyGoalStatus,
  ) {
    return currentGoals
      .filter(
        (goal) =>
          goal.planning?.month?.year === selectedYear &&
          goal.planning?.month?.month === selectedMonth &&
          goal.planning?.month?.status === status,
      )
      .sort(
        (firstGoal, secondGoal) =>
          (firstGoal.planning?.month?.order ?? 0) -
          (secondGoal.planning?.month?.order ?? 0),
      );
  }

  function normalizeMonthlyOrders(
    currentGoals: GoalItem[],
  ) {
    let normalizedGoals = [...currentGoals];

    for (const column of columns) {
      const columnGoals = getColumnGoals(
        normalizedGoals,
        column.status,
      );

      const orderByGoalId = new Map(
        columnGoals.map((goal, index) => [
          goal._id,
          index,
        ]),
      );

      normalizedGoals = normalizedGoals.map(
        (goal) => {
          const newOrder = orderByGoalId.get(
            goal._id,
          );

          if (newOrder === undefined) {
            return goal;
          }

          return {
            ...goal,
            planning: {
              ...goal.planning,
              month: {
                year: selectedYear,
                month: selectedMonth,
                status: column.status,
                order: newOrder,
              },
            },
          };
        },
      );
    }

    return normalizedGoals;
  }

  function createPositionUpdates(
    currentGoals: GoalItem[],
  ) {
    return currentGoals
      .filter(
        (goal) =>
          goal.planning?.month?.year === selectedYear &&
          goal.planning?.month?.month === selectedMonth &&
          goal.planning?.month !== null &&
          goal.planning?.month !== undefined,
      )
      .map((goal) => ({
        goalId: goal._id,
        year: selectedYear,
        month: selectedMonth,
        status: goal.planning!.month!.status,
        order: goal.planning!.month!.order,
      }));
  }

  function changeMonth(amount: number) {
    let nextMonth = selectedMonth + amount;
    let nextYear = selectedYear;

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }

    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    setError(null);
  }

  function changeYear(amount: number) {
    setSelectedYear(
      (currentYear) => currentYear + amount,
    );

    setError(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveGoalId(null);

    if (!over) {
      return;
    }

    const goalId =
      String(
        active.data.current?.goalId ?? "",
      ).trim() ||
      getGoalIdFromDragId(String(active.id));

    if (!goalId) {
      return;
    }

    const source =
      active.data.current?.source as
        | "year"
        | "month"
        | undefined;

    const overId = String(over.id);
    const previousGoals = goals;

    setError(null);

    /*
     * Remove a goal from the selected month.
     */
    if (overId === "month-remove-zone") {
      if (source !== "month") {
        return;
      }

      const goalsWithoutMonth = goals.map(
        (goal) =>
          goal._id === goalId
            ? {
                ...goal,
                planning: {
                  ...goal.planning,
                  month: null,
                },
              }
            : goal,
      );

      const updatedGoals =
        normalizeMonthlyOrders(goalsWithoutMonth);

      setGoals(updatedGoals);

      startTransition(async () => {
        const removeResult =
          await removeGoalFromMonth(goalId);

        if (!removeResult.success) {
          setGoals(previousGoals);
          setError(
            removeResult.error ??
              "Failed to remove goal from month",
          );
          return;
        }

        const saveResult =
          await saveMonthlyGoalPositions(
            createPositionUpdates(updatedGoals),
          );

        if (!saveResult.success) {
          setGoals(previousGoals);
          setError(
            saveResult.error ??
              "Failed to update monthly order",
          );
          return;
        }

        if (!isDemoMode) {
          router.refresh();
        }
      });

      return;
    }

    let targetStatus:
      | MonthlyGoalStatus
      | null = null;

    let targetGoalId: string | null = null;

    /*
     * Dropped directly onto a column.
     */
    if (overId.startsWith("month-column:")) {
      const possibleStatus = overId.replace(
        "month-column:",
        "",
      ) as MonthlyGoalStatus;

      if (validStatuses.includes(possibleStatus)) {
        targetStatus = possibleStatus;
      }
    }

    /*
     * Dropped onto another monthly goal.
     */
    if (overId.startsWith("month:")) {
      targetGoalId =
        getGoalIdFromDragId(overId);

      const targetGoal = goals.find(
        (goal) => goal._id === targetGoalId,
      );

      const possibleStatus =
        targetGoal?.planning?.month?.status;

      if (
        possibleStatus &&
        validStatuses.includes(possibleStatus)
      ) {
        targetStatus = possibleStatus;
      }
    }

    if (!targetStatus) {
      return;
    }

    const confirmedTargetStatus = targetStatus;

    const draggedGoal = goals.find(
      (goal) => goal._id === goalId,
    );

    if (!draggedGoal) {
      return;
    }

    /*
     * A goal can only be scheduled for a month belonging
     * to the same year as its yearly plan.
     */
    if (
      draggedGoal.planning?.year?.year !== selectedYear
    ) {
      setError(
        "This goal is not assigned to the selected yearly plan.",
      );
      return;
    }

    const sourceStatus =
      draggedGoal.planning?.month?.year ===
        selectedYear &&
      draggedGoal.planning?.month?.month ===
        selectedMonth
        ? draggedGoal.planning.month.status
        : null;

    let updatedGoals = [...goals];

    /*
     * Reorder inside the same monthly column.
     */
    if (
      sourceStatus === confirmedTargetStatus &&
      targetGoalId &&
      targetGoalId !== goalId
    ) {
      const columnGoals = getColumnGoals(
        goals,
        confirmedTargetStatus,
      );

      const oldIndex = columnGoals.findIndex(
        (goal) => goal._id === goalId,
      );

      const newIndex = columnGoals.findIndex(
        (goal) => goal._id === targetGoalId,
      );

      if (
        oldIndex === -1 ||
        newIndex === -1 ||
        oldIndex === newIndex
      ) {
        return;
      }

      const reorderedColumn = arrayMove(
        columnGoals,
        oldIndex,
        newIndex,
      );

      const orderByGoalId = new Map(
        reorderedColumn.map((goal, index) => [
          goal._id,
          index,
        ]),
      );

      updatedGoals = goals.map((goal) => {
        const newOrder = orderByGoalId.get(
          goal._id,
        );

        if (newOrder === undefined) {
          return goal;
        }

        return {
          ...goal,
          planning: {
            ...goal.planning,
            month: {
              year: selectedYear,
              month: selectedMonth,
              status: confirmedTargetStatus,
              order: newOrder,
            },
          },
        };
      });
    } else {
      /*
       * Move from the yearly source or another monthly column.
       */
      const targetColumnGoals = getColumnGoals(
        goals,
        confirmedTargetStatus,
      ).filter((goal) => goal._id !== goalId);

      let insertionIndex =
        targetColumnGoals.length;

      if (targetGoalId) {
        const hoveredIndex =
          targetColumnGoals.findIndex(
            (goal) =>
              goal._id === targetGoalId,
          );

        if (hoveredIndex !== -1) {
          insertionIndex = hoveredIndex;
        }
      }

      const movedGoal: GoalItem = {
        ...draggedGoal,
        planning: {
          ...draggedGoal.planning,
          month: {
            year: selectedYear,
            month: selectedMonth,
            status: confirmedTargetStatus,
            order: insertionIndex,
          },
        },
      };

      const reorderedTargetColumn = [
        ...targetColumnGoals.slice(
          0,
          insertionIndex,
        ),
        movedGoal,
        ...targetColumnGoals.slice(
          insertionIndex,
        ),
      ];

      const targetOrderByGoalId = new Map(
        reorderedTargetColumn.map(
          (goal, index) => [
            goal._id,
            index,
          ],
        ),
      );

      updatedGoals = goals.map((goal) => {
        if (goal._id === goalId) {
          return {
            ...movedGoal,
            planning: {
              ...movedGoal.planning,
              month: {
                year: selectedYear,
                month: selectedMonth,
                status:
                  confirmedTargetStatus,
                order:
                  targetOrderByGoalId.get(
                    goalId,
                  ) ?? 0,
              },
            },
          };
        }

        const newTargetOrder =
          targetOrderByGoalId.get(goal._id);

        if (newTargetOrder === undefined) {
          return goal;
        }

        return {
          ...goal,
          planning: {
            ...goal.planning,
            month: {
              year: selectedYear,
              month: selectedMonth,
              status:
                confirmedTargetStatus,
              order: newTargetOrder,
            },
          },
        };
      });

      updatedGoals =
        normalizeMonthlyOrders(updatedGoals);
    }

    setGoals(updatedGoals);

    startTransition(async () => {
      const result =
        await saveMonthlyGoalPositions(
          createPositionUpdates(updatedGoals),
        );

      if (!result.success) {
        setGoals(previousGoals);
        setError(
          result.error ??
            "Failed to update monthly plan",
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
      collisionDetection={closestCenter}
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
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-100">
              {monthNames[selectedMonth]}{" "}
              {selectedYear}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Select which yearly goals should receive your
              attention during this month.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeYear(-1)}
                className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
                aria-label="Previous year"
              >
                −
              </button>

              <div className="min-w-24 rounded-lg border border-zinc-800 px-4 py-2 text-center text-sm font-semibold text-zinc-100">
                {selectedYear}
              </div>

              <button
                type="button"
                onClick={() => changeYear(1)}
                className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
                aria-label="Next year"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
                aria-label="Previous month"
              >
                ←
              </button>

              <div className="min-w-32 rounded-lg border border-zinc-800 px-4 py-2 text-center text-sm font-semibold text-zinc-100">
                {monthNames[selectedMonth]}
              </div>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
                aria-label="Next month"
              >
                →
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <MonthlyYearSource
            goals={yearlyGoals}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
            {columns.map((column) => (
              <MonthlyKanbanColumn
                key={column.status}
                status={column.status}
                title={column.title}
                description={column.description}
                goals={monthlyGoals
                  .filter(
                    (goal) =>
                      goal.planning?.month
                        ?.status ===
                      column.status,
                  )
                  .sort(
                    (
                      firstGoal,
                      secondGoal,
                    ) =>
                      (firstGoal.planning
                        ?.month?.order ?? 0) -
                      (secondGoal.planning
                        ?.month?.order ?? 0),
                  )}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeGoal ? (
          <div className="w-64">
            <MonthlyGoalCard
              goal={activeGoal}
              source="month"
              overlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}