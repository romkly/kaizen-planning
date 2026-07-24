"use server";

import { GOAL_PRIORITY_TYPES } from "@/constants/goals";
import { updateGoal } from "@/server/actions/update-goal";

type GoalPriority = (typeof GOAL_PRIORITY_TYPES)[number];

export async function updateGoalPriority(
  goalId: string,
  priorityType: GoalPriority | null,
) {
  return updateGoal(goalId, {
    priorityType,
  });
}