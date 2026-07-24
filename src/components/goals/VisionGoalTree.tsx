"use client";

import { useState } from "react";

import {
  type VisionGoal,
  VisionGoalCard,
} from "@/components/goals/VisionGoalCard";

type VisionGoalTreeProps = {
  goal: VisionGoal;
  allGoals: VisionGoal[];
  onOpenDetails: (goal: VisionGoal) => void;
  onToggleCompleted: (goal: VisionGoal) => void;
};

export function VisionGoalTree({
  goal,
  allGoals,
  onOpenDetails,
  onToggleCompleted,
}: VisionGoalTreeProps) {
  const [isExpanded, setIsExpanded] =
    useState(true);

  const children = allGoals.filter(
    (candidate) =>
      candidate.parentGoalId === goal._id,
  );

  return (
    <VisionGoalCard
      goal={goal}
      hasChildren={children.length > 0}
      isExpanded={isExpanded}
      onToggle={() =>
        setIsExpanded((current) => !current)
      }
      onOpenDetails={onOpenDetails}
      onToggleCompleted={onToggleCompleted}
    >
      {children.map((child) => (
        <VisionGoalTree
          key={child._id}
          goal={child}
          allGoals={allGoals}
          onOpenDetails={onOpenDetails}
          onToggleCompleted={onToggleCompleted}
        />
      ))}
    </VisionGoalCard>
  );
}