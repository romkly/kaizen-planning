import "server-only";

import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

type GoalProgressResult = {
  goalId: string;
  progress: number;
  completed: boolean;
};

/**
 * Recalculates one goal and all descendants below it.
 *
 * Leaf goals use their completed state:
 * completed = true  -> 100%
 * completed = false -> 0%
 *
 * Parent goals use the average progress of their direct children.
 */
export async function calculateGoalProgress(
  goalId: string,
  userId: string,
  visited = new Set<string>(),
): Promise<GoalProgressResult> {
  await connectToDatabase();

  if (visited.has(goalId)) {
    throw new Error("Circular goal hierarchy detected");
  }

  visited.add(goalId);

  const goal = await Goal.findOne({
    _id: goalId,
    userId,
  }).select("_id completed completedAt progress");

  if (!goal) {
    throw new Error("Goal not found");
  }

  const children = await Goal.find({
    userId,
    parentGoalId: goalId,
  }).select("_id");

  // Leaf goal: progress depends on its own completed state.
  if (children.length === 0) {
    const completed = Boolean(goal.completed);
    const progress = completed ? 100 : 0;

    await Goal.updateOne(
      {
        _id: goalId,
        userId,
      },
      {
        $set: {
          progress,
          completedAt: completed
            ? goal.completedAt ?? new Date()
            : null,
        },
      },
    );

    return {
      goalId,
      progress,
      completed,
    };
  }

  // Parent goal: progress is calculated from its children.
  const childProgressValues: number[] = [];

  for (const child of children) {
    const childResult = await calculateGoalProgress(
      String(child._id),
      userId,
      new Set(visited),
    );

    childProgressValues.push(childResult.progress);
  }

  const totalProgress = childProgressValues.reduce(
    (sum, value) => sum + value,
    0,
  );

  const progress = Math.round(
    totalProgress / childProgressValues.length,
  );

  const completed = progress === 100;

  await Goal.updateOne(
    {
      _id: goalId,
      userId,
    },
    {
      $set: {
        progress,
        completed,
        completedAt: completed
          ? goal.completedAt ?? new Date()
          : null,
      },
    },
  );

  return {
    goalId,
    progress,
    completed,
  };
}

/**
 * Recalculates the selected goal and then walks upward through
 * all of its parents.
 */
export async function recalculateGoalAndAncestors(
  goalId: string,
  userId: string,
): Promise<void> {
  await connectToDatabase();

  let currentGoalId: string | null = goalId;
  const visited = new Set<string>();

  while (currentGoalId) {
    if (visited.has(currentGoalId)) {
      throw new Error("Circular goal hierarchy detected");
    }

    visited.add(currentGoalId);

    await calculateGoalProgress(currentGoalId, userId);

    const currentGoal = (await Goal.findOne({
        _id: currentGoalId,
        userId,
      })
        .select("parentGoalId")
        .lean()
        .exec()) as {
        parentGoalId: mongoose.Types.ObjectId | null;
      } | null;
      
      if (!currentGoal?.parentGoalId) {
        currentGoalId = null;
        continue;
      }
      
      currentGoalId = currentGoal.parentGoalId.toString();
  }
}

/**
 * Used after changing a goal's parent.
 *
 * Both the previous parent and the new parent must be recalculated,
 * because the number of children in each branch has changed.
 */
export async function recalculateAfterReparenting({
  goalId,
  previousParentGoalId,
  newParentGoalId,
  userId,
}: {
  goalId: string;
  previousParentGoalId: string | null;
  newParentGoalId: string | null;
  userId: string;
}): Promise<void> {
  await recalculateGoalAndAncestors(goalId, userId);

  if (
    previousParentGoalId &&
    previousParentGoalId !== newParentGoalId
  ) {
    await recalculateGoalAndAncestors(
      previousParentGoalId,
      userId,
    );
  }

  if (
    newParentGoalId &&
    newParentGoalId !== previousParentGoalId
  ) {
    await recalculateGoalAndAncestors(
      newParentGoalId,
      userId,
    );
  }
}