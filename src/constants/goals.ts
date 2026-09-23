export const GOAL_LEVELS = ["lifetime", "yearly", "monthly", "daily"] as const;

export const GOAL_CATEGORIES = [
  "self-development",
  "business",
  "family",
  "hobby",
  "public-affairs",
] as const;

export const GOAL_PRIORITY_TYPES = ["must", "want"] as const;

export const YEARLY_KANBAN_STATUSES = ["todo", "planned", "done"] as const;

export const MONTHLY_KANBAN_STATUSES = [
  "todo",
  "planned",
  "in-progress",
  "today",
  "done",
] as const;

export const DAILY_KANBAN_STATUSES = ["todo", "in-progress", "done"] as const;
