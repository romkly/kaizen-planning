"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

export async function getMonthlyGoals() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  await connectToDatabase();

  const goals = await Goal.find({
    userId: session.user.id,

    // Only goals that have been placed into a yearly plan
    "planning.year.year": {
      $exists: true,
    },
  })
    .select(
      [
        "_id",
        "title",
        "description",
        "category",
        "priorityType",
        "parentGoalId",
        "icon",
        "color",
        "deadline",
        "estimatedHours",
        "notes",
        "progress",
        "completed",
        "completedAt",
        "placement",
        "order",
        "planning",
      ].join(" "),
    )
    .sort({
      "planning.year.order": 1,
      createdAt: 1,
    })
    .lean();

  return JSON.parse(JSON.stringify(goals));
}