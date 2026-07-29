"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

export async function getYearlyGoals() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  await connectToDatabase();

  const goals = await Goal.find({
    userId: session.user.id,
    category: { $ne: null },
    priorityType: { $ne: null },
  })
    .select(
      [
        "_id",
        "title",
        "description",
        "icon",
        "color",
        "category",
        "priorityType",
        "parentGoalId",
        "completed",
        "progress",
        "planning",
        "placement",
        "order",
      ].join(" "),
    )
    .sort({
      createdAt: 1,
    })
    .lean();

  return JSON.parse(JSON.stringify(goals));
}