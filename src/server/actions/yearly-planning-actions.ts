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

type YearlyGoalUpdate = {
  goalId: string;
  year: number;
  status: YearlyGoalStatus;
  order: number;
};

export async function saveYearlyGoalPositions(
  updates: YearlyGoalUpdate[],
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false as const,
      error: "Unauthorized",
    };
  }

  if (updates.length === 0) {
    return {
      success: true as const,
    };
  }

  const validStatuses: YearlyGoalStatus[] = [
    "todo",
    "planned",
    "in-progress",
    "done",
  ];

  const invalidUpdate = updates.some(
    (update) =>
      !update.goalId ||
      !Number.isInteger(update.year) ||
      !Number.isInteger(update.order) ||
      update.order < 0 ||
      !validStatuses.includes(update.status),
  );

  if (invalidUpdate) {
    return {
      success: false as const,
      error: "Invalid yearly goal position",
    };
  }

  await connectToDatabase();

  const operations = updates.map((update) => ({
    updateOne: {
      filter: {
        _id: update.goalId,
        userId: session.user.id,
      },
      update: {
        $set: {
          "planning.year": {
            year: update.year,
            status: update.status,
            order: update.order,
          },
        },
      },
    },
  }));

  await Goal.bulkWrite(operations);

  revalidatePath("/year");

  return {
    success: true as const,
  };
}

export async function removeGoalFromYear(
  goalId: string,
) {
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