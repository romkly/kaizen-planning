"use server";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { recalculateGoalAndAncestors } from "@/server/actions/goal-progress";
import { Goal } from "@/models/Goal";

export async function setGoalCompleted(
  goalId: string,
  completed: boolean,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false as const,
      error: "Unauthorized",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    return {
      success: false as const,
      error: "Invalid goal ID",
    };
  }

  await connectToDatabase();

  const goal = await Goal.findOne({
    _id: goalId,
    userId: session.user.id,
  }).select("_id completed");

  if (!goal) {
    return {
      success: false as const,
      error: "Goal not found",
    };
  }

  const childCount = await Goal.countDocuments({
    userId: session.user.id,
    parentGoalId: goalId,
  });

  if (childCount > 0) {
    return {
      success: false as const,
      error:
        "Parent goals are completed automatically from their subgoals",
    };
  }

  await Goal.updateOne(
    {
      _id: goalId,
      userId: session.user.id,
    },
    {
      $set: {
        completed,
        completedAt: completed ? new Date() : null,
        progress: completed ? 100 : 0,
      },
    },
  );

  await recalculateGoalAndAncestors(
    goalId,
    session.user.id,
  );

  return {
    success: true as const,
  };
}