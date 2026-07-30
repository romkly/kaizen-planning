import mongoose, {
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

export const GOAL_CATEGORIES = [
  "self-development",
  "business",
  "family",
  "hobby",
  "public-affairs",
] as const;

export const PRIORITY_TYPES = [
  "must",
  "want",
] as const;

export const YEARLY_GOAL_STATUSES = [
  "todo",
  "planned",
  "in-progress",
  "done",
] as const;

export const MONTHLY_GOAL_STATUSES = [
  "todo",
  "planned",
  "in-progress",
  "today",
  "done",
] as const;

export type GoalCategory =
  (typeof GOAL_CATEGORIES)[number];

export type GoalPriorityType =
  (typeof PRIORITY_TYPES)[number];

export type YearlyGoalStatus =
  (typeof YEARLY_GOAL_STATUSES)[number];

export type MonthlyGoalStatus =
  (typeof MONTHLY_GOAL_STATUSES)[number];

export type YearlyPlanning = {
  year: number;
  status: YearlyGoalStatus;
  order: number;
};

export type MonthlyPlanning = {
  year: number;
  month: number;
  status: MonthlyGoalStatus;
  order: number;
};

export type GoalPlacement = {
  visionBoard: boolean;
};

export type GoalOrder = {
  brainstorm: number;
  categorization: number;
  priority: number;
  vision: number;
};

export interface IGoal {
  userId: Types.ObjectId;

  title: string;
  description: string;

  category: GoalCategory | null;
  priorityType: GoalPriorityType | null;

  parentGoalId: Types.ObjectId | null;

  icon: string | null;
  color: string | null;

  deadline: Date | null;
  estimatedHours: number | null;
  notes: string;

  progress: number;
  completed: boolean;
  completedAt: Date | null;

  placement: GoalPlacement;
  order: GoalOrder;

  planning?: {
    year?: YearlyPlanning | null;
    month?: MonthlyPlanning | null;
  };

  createdAt: Date;
  updatedAt: Date;
}

export type GoalDocument =
  HydratedDocument<IGoal>;

const YearlyPlanningSchema =
  new mongoose.Schema<YearlyPlanning>(
    {
      year: {
        type: Number,
        required: true,
        min: 1900,
        max: 3000,
      },

      status: {
        type: String,
        enum: YEARLY_GOAL_STATUSES,
        required: true,
      },

      order: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      _id: false,
    },
  );

const MonthlyPlanningSchema =
  new mongoose.Schema<MonthlyPlanning>(
    {
      year: {
        type: Number,
        required: true,
        min: 1900,
        max: 3000,
      },

      month: {
        type: Number,
        required: true,
        min: 0,
        max: 11,
      },

      status: {
        type: String,
        enum: MONTHLY_GOAL_STATUSES,
        required: true,
      },

      order: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      _id: false,
    },
  );

const GoalSchema = new mongoose.Schema<IGoal>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 360,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    category: {
      type: String,
      enum: [
        ...GOAL_CATEGORIES,
        null,
      ],
      default: null,
      index: true,
    },

    priorityType: {
      type: String,
      enum: [
        ...PRIORITY_TYPES,
        null,
      ],
      default: null,
      index: true,
    },

    parentGoalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
      index: true,
    },

    icon: {
      type: String,
      trim: true,
      default: null,
      maxlength: 20,
    },

    color: {
      type: String,
      trim: true,
      default: null,
      maxlength: 30,
    },

    deadline: {
      type: Date,
      default: null,
    },

    estimatedHours: {
      type: Number,
      default: null,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10000,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completed: {
      type: Boolean,
      default: false,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    placement: {
      visionBoard: {
        type: Boolean,
        default: false,
      },
    },

    order: {
      brainstorm: {
        type: Number,
        default: 0,
        min: 0,
      },

      categorization: {
        type: Number,
        default: 0,
        min: 0,
      },

      priority: {
        type: Number,
        default: 0,
        min: 0,
      },

      vision: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    planning: {
      year: {
        type: YearlyPlanningSchema,
        required: false,
        default: undefined,
      },

      month: {
        type: MonthlyPlanningSchema,
        required: false,
        default: undefined,
      },
    },
  },
  {
    timestamps: true,
  },
);

GoalSchema.index({
  userId: 1,
  parentGoalId: 1,
});

GoalSchema.index({
  userId: 1,
  category: 1,
});

GoalSchema.index({
  userId: 1,
  priorityType: 1,
});

GoalSchema.index({
  userId: 1,
  "placement.visionBoard": 1,
});

GoalSchema.index({
  userId: 1,
  "planning.year.year": 1,
  "planning.year.status": 1,
  "planning.year.order": 1,
});

GoalSchema.index({
  userId: 1,
  "planning.month.year": 1,
  "planning.month.month": 1,
  "planning.month.status": 1,
  "planning.month.order": 1,
});

GoalSchema.pre("validate", function validateCompletion() {
  if (this.completed) {
    this.progress = 100;

    if (!this.completedAt) {
      this.completedAt = new Date();
    }

    return;
  }

  if (this.progress < 100) {
    this.completedAt = null;
  }
});

export const Goal: Model<IGoal> =
  mongoose.models.Goal ??
  mongoose.model<IGoal>(
    "Goal",
    GoalSchema,
  );