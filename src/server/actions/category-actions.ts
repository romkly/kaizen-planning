"use server";

import { GOAL_CATEGORIES } from "@/constants/goals";
import { updateGoal } from "@/server/actions/update-goal";

type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export async function updateGoalCategory(
  goalId: string,
  category: GoalCategory | null,
) {
  return updateGoal(goalId, {
    category,
  });
}