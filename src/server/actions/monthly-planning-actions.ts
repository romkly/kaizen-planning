"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  Goal,
  MONTHLY_GOAL_STATUSES,
  type MonthlyGoalStatus,
} from "@/models/Goal";

type MonthlyGoalPositionUpdate = {
  goalId: string;
  year: number;
  month: number;
  status: MonthlyGoalStatus;
  order: number;
};

function isValidMonth(month: number) {
  return (
    Number.isInteger(month) &&
    month >= 0 &&
    month <= 11
  );
}

function isValidYear(year: number) {
  return (
    Number.isInteger(year) &&
    year >= 1900 &&
    year <= 3000
  );
}

function isValidStatus(
  status: string,
): status is MonthlyGoalStatus {
  return (
    MONTHLY_GOAL_STATUSES as readonly string[]
  ).includes(status);
}

export async function saveMonthlyGoalPositions(
  updates: MonthlyGoalPositionUpdate[],
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

  const invalidUpdate = updates.some(
    (update) =>
      !update.goalId ||
      !isValidYear(update.year) ||
      !isValidMonth(update.month) ||
      !isValidStatus(update.status) ||
      !Number.isInteger(update.order) ||
      update.order < 0,
  );

  if (invalidUpdate) {
    return {
      success: false as const,
      error: "Invalid monthly goal position",
    };
  }

  await connectToDatabase();

  /*
   * Verify that every goal belongs to the logged-in user
   * and is assigned to the same yearly plan.
   */
  const goalIds = [
    ...new Set(
      updates.map((update) => update.goalId),
    ),
  ];

  const goals = await Goal.find({
    _id: {
      $in: goalIds,
    },
    userId: session.user.id,
  })
    .select("_id planning.year")
    .lean();

  if (goals.length !== goalIds.length) {
    return {
      success: false as const,
      error: "One or more goals could not be found",
    };
  }

  const goalById = new Map(
    goals.map((goal) => [
      String(goal._id),
      goal,
    ]),
  );

  const invalidYearAssignment = updates.some(
    (update) => {
      const goal = goalById.get(update.goalId);

      return (
        !goal?.planning?.year ||
        goal.planning.year.year !== update.year
      );
    },
  );

  if (invalidYearAssignment) {
    return {
      success: false as const,
      error:
        "A goal must belong to the selected yearly plan before it can be added to a month",
    };
  }

  const operations = updates.map((update) => ({
    updateOne: {
      filter: {
        _id: update.goalId,
        userId: session.user.id,
        "planning.year.year": update.year,
      },

      update: {
        $set: {
          "planning.month": {
            year: update.year,
            month: update.month,
            status: update.status,
            order: update.order,
          },
        },
      },
    },
  }));

  await Goal.bulkWrite(operations);

  revalidatePath("/month");

  return {
    success: true as const,
  };
}

export async function removeGoalFromMonth(
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

  if (!goalId) {
    return {
      success: false as const,
      error: "Goal ID is required",
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
        "planning.month": "",
      },
    },
  );

  if (result.matchedCount === 0) {
    return {
      success: false as const,
      error: "Goal not found",
    };
  }

  revalidatePath("/month");

  return {
    success: true as const,
  };
}