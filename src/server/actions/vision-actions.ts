"use server";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import { revalidatePath } from "next/cache";
import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { recalculateAfterReparenting } from "@/server/actions/goal-progress";

type VisionUpdateInput = {
  isOnVisionBoard: boolean;
  parentGoalId?: string | null;
};

export async function updateVisionGoal(
  goalId: string,
  input: VisionUpdateInput,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return {
      success: false,
      error: "Invalid goal ID",
    };
  }

  if (
    input.parentGoalId &&
    !mongoose.Types.ObjectId.isValid(input.parentGoalId)
  ) {
    return {
      success: false,
      error: "Invalid parent goal ID",
    };
  }

  if (goalId === input.parentGoalId) {
    return {
      success: false,
      error: "A goal cannot be its own parent",
    };
  }

  await connectToDatabase();

  const goal = await Goal.findOne({
    _id: goalId,
    userId: session.user.id,
  });

  if (!goal) {
    return {
      success: false,
      error: "Goal not found",
    };
  }

  if (input.parentGoalId) {
    const parentGoal = await Goal.findOne({
      _id: input.parentGoalId,
      userId: session.user.id,
      "placement.visionBoard": true,
    });

    if (!parentGoal) {
      return {
        success: false,
        error: "Parent goal not found on the Vision Board",
      };
    }

    const createsCycle = await wouldCreateCircularReference(
      goalId,
      input.parentGoalId,
      session.user.id,
    );

    if (createsCycle) {
      return {
        success: false,
        error: "This change would create a circular goal hierarchy",
      };
    }
  }

  const previousParentGoalId = goal.parentGoalId
    ? String(goal.parentGoalId)
    : null;

  const newParentGoalId =
    input.isOnVisionBoard && input.parentGoalId
      ? input.parentGoalId
      : null;

  goal.placement.visionBoard = input.isOnVisionBoard;
  goal.parentGoalId = newParentGoalId;

  await goal.save();

  await recalculateAfterReparenting({
    goalId,
    previousParentGoalId,
    newParentGoalId,
    userId: session.user.id,
  });

  revalidatePath("/vision");

  return {
    success: true,
  };
}

async function wouldCreateCircularReference(
  goalId: string,
  proposedParentId: string,
  userId: string,
) {
  let currentGoalId: string | null = proposedParentId;
  const visited = new Set<string>();

  while (currentGoalId) {
    if (currentGoalId === goalId) {
      return true;
    }

    if (visited.has(currentGoalId)) {
      return true;
    }

    visited.add(currentGoalId);

    const currentGoal: {
        parentGoalId: mongoose.Types.ObjectId | null;
      } | null = await Goal.findOne({
        _id: currentGoalId,
        userId,
      })
        .select("parentGoalId")
        .lean<{
          parentGoalId: mongoose.Types.ObjectId | null;
        }>();
      
      if (!currentGoal?.parentGoalId) {
        return false;
      }
      
      currentGoalId = String(currentGoal.parentGoalId);
  }

  return false;
}