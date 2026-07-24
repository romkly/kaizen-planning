"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";
import { createGoalSchema } from "@/validators/goal";

export async function createGoal(input: unknown) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const validated = createGoalSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid input",
    };
  }

  await connectToDatabase();

  const goal = await Goal.create({
    userId: session.user.id,
    title: validated.data.title,
    level: "lifetime",
  });

  return {
    success: true,
    goal: JSON.parse(JSON.stringify(goal)),
  };
}

export async function deleteGoal(goalId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  await connectToDatabase();

  await Goal.findOneAndDelete({
    _id: goalId,
    userId: session.user.id,
  });

  return {
    success: true,
  };
}

export async function updateGoalTitle(goalId: string, title: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const validated = createGoalSchema.safeParse({ title });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid input",
    };
  }

  await connectToDatabase();

  await Goal.findOneAndUpdate(
    {
      _id: goalId,
      userId: session.user.id,
    },
    {
      title: validated.data.title,
    },
  );

  return {
    success: true,
  };
}
