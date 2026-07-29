"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

export type YearlyGoalStatus =
  | "todo"
  | "planned"
  | "in-progress"
  | "done";

type UpdateYearlyPlanningInput = {
  year: number;
  status: YearlyGoalStatus;
  order?: number;
};

export async function updateYearlyPlanning(
  goalId: string,
  input: UpdateYearlyPlanningInput,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false as const,
      error: "Unauthorized",
    };
  }

  if (!Number.isInteger(input.year)) {
    return {
      success: false as const,
      error: "Invalid year",
    };
  }

  await connectToDatabase();

  const goal = await Goal.findOne({
    _id: goalId,
    userId: session.user.id,
  });

  if (!goal) {
    return {
      success: false as const,
      error: "Goal not found",
    };
  }

  goal.set("planning.year", {
    year: input.year,
    status: input.status,
    order: input.order ?? 0,
  });

  await goal.save();

  revalidatePath("/year");

  return {
    success: true as const,
  };
}

export async function removeGoalFromYear(goalId: string) {
  if (process.env.DEMO_MODE === "true") {
    return {
      success: true as const,
    };
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false as const,
      error: "Unauthorized",
    };
  }

  await connectToDatabase();

  const result = await Goal.updateOne(
    {
      _id: goalId,
      userId: session.user.id,
    },
    {
      $unset: {
        "planning.year": "",
      },
    },
  );

  if (result.matchedCount === 0) {
    return {
      success: false as const,
      error: "Goal not found",
    };
  }

  revalidatePath("/year");

  return {
    success: true as const,
  };
}