"use server";

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/auth";
import {
  GOAL_CATEGORIES,
  GOAL_LEVELS,
  GOAL_PRIORITY_TYPES,
} from "@/constants/goals";
import { connectToDatabase } from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

const optionalDateSchema = z
  .union([
    z.string().date(),
    z.literal(""),
    z.null(),
  ])
  .optional();

const updateGoalSchema = z
  .object({
    title: z.string().trim().min(1).max(360).optional(),

    description: z.string().trim().max(2000).optional(),

    icon: z.string().trim().max(10).optional(),

    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color")
      .optional(),

    deadline: optionalDateSchema,

    estimatedHours: z
      .number()
      .min(0)
      .max(100000)
      .nullable()
      .optional(),

    notes: z.string().max(10000).optional(),

    category: z.enum(GOAL_CATEGORIES).nullable().optional(),

    priorityType: z.enum(GOAL_PRIORITY_TYPES).nullable().optional(),

    level: z.enum(GOAL_LEVELS).optional(),

    parentGoalId: z.string().nullable().optional(),

    completed: z.boolean().optional(),

    placement: z
      .object({
        visionBoard: z.boolean().optional(),
        yearlyKanban: z.boolean().optional(),
        monthlyKanban: z.boolean().optional(),
        dailyKanban: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput,
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

  const validated = updateGoalSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false as const,
      error:
        validated.error.issues[0]?.message ??
        "Invalid goal update",
    };
  }

  if (
    validated.data.parentGoalId &&
    !mongoose.Types.ObjectId.isValid(
      validated.data.parentGoalId,
    )
  ) {
    return {
      success: false as const,
      error: "Invalid parent goal ID",
    };
  }

  await connectToDatabase();

  const updateData: Record<string, unknown> = {};

  if (validated.data.title !== undefined) {
    updateData.title = validated.data.title;
  }

  if (validated.data.description !== undefined) {
    updateData.description = validated.data.description;
  }

  if (validated.data.icon !== undefined) {
    updateData.icon = validated.data.icon || "🎯";
  }

  if (validated.data.color !== undefined) {
    updateData.color = validated.data.color;
  }

  if (validated.data.deadline !== undefined) {
    updateData.deadline = validated.data.deadline
      ? new Date(validated.data.deadline)
      : null;
  }

  if (validated.data.estimatedHours !== undefined) {
    updateData.estimatedHours =
      validated.data.estimatedHours;
  }

  if (validated.data.notes !== undefined) {
    updateData.notes = validated.data.notes;
  }

  if (validated.data.category !== undefined) {
    updateData.category = validated.data.category;
  }

  if (validated.data.priorityType !== undefined) {
    updateData.priorityType =
      validated.data.priorityType;
  }

  if (validated.data.level !== undefined) {
    updateData.level = validated.data.level;
  }

  if (validated.data.parentGoalId !== undefined) {
    updateData.parentGoalId =
      validated.data.parentGoalId;
  }

  if (validated.data.completed !== undefined) {
    updateData.completed = validated.data.completed;
    updateData.completedAt = validated.data.completed
      ? new Date()
      : null;
  }

  if (validated.data.placement) {
    for (const [key, value] of Object.entries(
      validated.data.placement,
    )) {
      updateData[`placement.${key}`] = value;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return {
      success: false as const,
      error: "No changes were provided",
    };
  }

  const updatedGoal = await Goal.findOneAndUpdate(
    {
      _id: goalId,
      userId: session.user.id,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!updatedGoal) {
    return {
      success: false as const,
      error: "Goal not found",
    };
  }

  return {
    success: true as const,
    goal: JSON.parse(JSON.stringify(updatedGoal)),
  };
}