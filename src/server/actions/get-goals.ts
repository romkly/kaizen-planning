"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

export async function getBrainstormGoals() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  await connectToDatabase();

  const goals = await Goal.find({
    userId: session.user.id,
  })
    .select("_id title")
    .sort({
      "order.brainstorm": 1,
      createdAt: -1,
    })
    .lean();

  return JSON.parse(JSON.stringify(goals));
}