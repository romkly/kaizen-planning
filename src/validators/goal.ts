import { z } from "zod";

export type YearlyGoalStatus =
  | "todo"
  | "planned"
  | "in-progress"
  | "done";

export type MonthlyGoalStatus =
  | "todo"
  | "planned"
  | "in-progress"
  | "today"
  | "done";

export type GoalItem = {
  _id: string;

  title: string;
  description?: string;

  category: string | null;
  priorityType: "must" | "want" | null;

  parentGoalId: string | null;

  icon?: string | null;
  color?: string | null;

  deadline?: string | null;
  estimatedHours?: number | null;
  notes?: string;

  progress: number;
  completed: boolean;
  completedAt?: string | null;

  placement?: {
    visionBoard?: boolean;
  };

  order?: {
    brainstorm?: number;
    categorization?: number;
    priority?: number;
    vision?: number;
  };

  planning?: {
    year?: {
      year: number;
      status: YearlyGoalStatus;
      order: number;
    } | null;

    month?: {
      year: number;
      month: number;
      status: MonthlyGoalStatus;
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
