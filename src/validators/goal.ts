import { z } from "zod";

export const createGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Goal is required")
    .max(360, "Goal must be less than 360 characters"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
