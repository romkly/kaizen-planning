import { z } from "zod";

export type YearlyGoalStatus =
  | "todo"
  | "planned"
  | "in-progress"
  | "done";

export type GoalItem = {
  _id: string;
  title: string;
  description?: string;
  category: string | null;
  priorityType: "must" | "want" | null;
  parentGoalId: string | null;
  completed: boolean;
  progress: number;
  icon?: string;
  color?: string;

  planning?: {
    year?: {
      year: number;
      status: YearlyGoalStatus;
      order: number;
    } | null;
  };
};

export const createGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Goal is required")
    .max(360, "Goal must be less than 360 characters"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
