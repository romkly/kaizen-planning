"use client";

import {
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export type VisionGoal = {
  _id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  deadline?: string | null;
  estimatedHours?: number | null;
  notes?: string;
  progress?: number;
  category: string;
  priorityType: "must" | "want";
  level: string;
  parentGoalId: string | null;
  completed?: boolean;
  placement: {
    visionBoard: boolean;
  };
};

type VisionGoalCardProps = {
  goal: VisionGoal;
  children?: React.ReactNode;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenDetails: (goal: VisionGoal) => void;
  onToggleCompleted: (goal: VisionGoal) => void;
};

export function VisionGoalCard({
  goal,
  children,
  hasChildren,
  isExpanded,
  onToggle,
  onOpenDetails,
  onToggleCompleted,
}: VisionGoalCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: goal._id,
    data: {
      type: "vision-goal",
      goalId: goal._id,
    },
  });

  const {
    setNodeRef: setDroppableRef,
    isOver,
  } = useDroppable({
    id: `goal-drop-${goal._id}`,
    data: {
      type: "goal-parent",
      goalId: goal._id,
    },
  });

  const setNodeRef = (
    node: HTMLDivElement | null,
  ) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const progress = Math.min(
    100,
    Math.max(0, goal.progress ?? 0),
  );

  return (
    <div className="relative">
      <article
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          group relative overflow-hidden rounded-2xl border
          bg-zinc-950 p-4 transition active:cursor-grabbing
          ${
            isOver
              ? "border-white bg-zinc-900"
              : "border-zinc-800 hover:border-zinc-600"
          }
          ${isDragging ? "z-50 opacity-40" : ""}
          ${goal.completed ? "opacity-70" : ""}
        `}
      >
        <div
          className="absolute inset-y-0 left-0 w-1"
          style={{
            backgroundColor:
              goal.color ?? "#52525b",
          }}
        />

        <div className="flex items-start gap-3">
          {hasChildren ? (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-sm text-zinc-400 transition hover:border-white hover:text-white"
              aria-label={
                isExpanded
                  ? "Collapse subgoals"
                  : "Expand subgoals"
              }
            >
              {isExpanded ? "−" : "+"}
            </button>
          ) : (
            <div className="h-7 w-7 shrink-0" />
          )}

          <div className="min-w-0 flex-1">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl">
                  {goal.icon || "🎯"}
                </span>

                <span
                  className={`
                    rounded-full border px-2 py-0.5
                    text-[11px] font-semibold uppercase
                    ${
                      goal.priorityType === "must"
                        ? "border-white text-white"
                        : "border-zinc-700 text-zinc-400"
                    }
                  `}
                >
                  {goal.priorityType}
                </span>

                <span className="text-xs capitalize text-zinc-500">
                  {goal.category.replaceAll("-", " / ")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onOpenDetails(goal);
              }}
              className="mt-3 block w-full text-left"
            >
              <h3
                className={`
                  break-words font-semibold transition hover:text-zinc-300
                  ${
                    goal.completed
                      ? "text-zinc-500 line-through"
                      : "text-white"
                  }
                `}
              >
                {goal.title}
              </h3>

              {goal.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                  {goal.description}
                </p>
              )}
            </button>

            <button
              type="button"
              disabled={hasChildren}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();

                if (!hasChildren) {
                  onToggleCompleted(goal);
                }
              }}
              title={
                hasChildren
                  ? "Parent progress is calculated from subgoals"
                  : goal.completed
                    ? "Mark as incomplete"
                    : "Mark as completed"
              }
              className={`
                flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border
                text-sm transition
                ${
                  goal.completed
                    ? "border-green-500 bg-green-500 text-black"
                    : "border-zinc-700 text-zinc-500"
                }
                ${
                  hasChildren
                    ? "cursor-not-allowed opacity-40"
                    : "hover:border-white hover:text-white"
                }
              `}
            >
              {goal.completed ? "✓" : ""}
            </button>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-600">
                <span className="capitalize">
                  {goal.level}
                </span>

                <span>{progress}%</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    backgroundColor:
                      goal.color ?? "#a1a1aa",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {isOver && (
          <div className="pointer-events-none absolute inset-x-4 bottom-2 text-center text-xs text-zinc-400">
            Make this a subgoal
          </div>
        )}
      </article>

      {hasChildren && isExpanded && (
        <div className="ml-6 mt-3 space-y-3 border-l border-zinc-800 pl-5">
          {children}
        </div>
      )}
    </div>
  );
}